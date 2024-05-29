const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  DiscordAPIError,
} = require("discord.js");
const config = require("../config/config");
const fs = require("fs");
const path = require("path");
const os = require("os-utils");

let page = 0;
module.exports = class Manager {
  //----------------- utility -----------------\\
  static async ping(client, interaction) {
    try {
      const getCpuUsage = () => {
        return new Promise((resolve) => {
          os.cpuUsage((v) => {
            resolve(v.toFixed(2));
          });
        });
      };
      const CPU = await getCpuUsage();
      const memory = process.memoryUsage();
      const keys = Object.keys(memory);
      const a = memory;
      keys.forEach((key) => {
        memory[key] = (a[key] / 1024 / 1024).toFixed(2) + "MB";
      });
      const embedPing = new EmbedBuilder()
        .setTitle(`Shard [${interaction.guild.shard}]`)
        .setColor(client.config.customization.embedColor)
        .setDescription(
          `Pong! 🏓\n**Latency:** \`${Math.round(
            client.ws.ping
          )}ms\`\n**Resources:**\n<:space:1235658011607961690>***RAM:*** \`${
            memory.rss
          }\`\n<:space:1235658011607961690>***CPU:*** \`${CPU}%\`\n**Servers:** \`${
            client.guilds.cache.size
          }\`\n**Users:** \`${client.users.cache.size}\``
        );
      interaction.reply({ embeds: [embedPing] });
    } catch (err) {
      return err;
    }
  }

  static async customcommand(c, i, u) {
    try {
      const d = await c.data.getAllCustomCommands(i.guild);
      const re = new EmbedBuilder()
        .setTitle(`Customcommands in ${i.guild.name} [${d.length}]`)
        .setColor(c.config.customization.embedColor);

      let sum;
      d.forEach((v) => {
        if (!sum) {
          sum = `**${v.name}**\n> **ID:** \`${v.id}\`\n> **Enabled:** \`${
            v.enabled
          }\`\n> **Delete Trigger:** \`${v.delete_trigger}\`\n> **Author:** <@${
            v.created.user
          }>\n> **Created:** <t:${Math.floor(v.created.time / 1000)}>`;
        } else {
          sum += `\n\n**${v.name}**\n> **ID:** \`${v.id}\`\n> **Enabled:** \`${
            v.enabled
          }\`\n> **Delete Trigger:** \`${v.delete_trigger}\`\n> **Author:** <@${
            v.created.user
          }>\n> **Created:** <t:${Math.floor(v.created.time / 1000)}>`;
        }
      });
      re.setDescription(`${sum}`);

      const cb = new ButtonBuilder()
        .setCustomId("crbut")
        .setEmoji(`➕`)
        .setLabel(`Create`)
        .setStyle(ButtonStyle.Success);

      const dlb = new ButtonBuilder()
        .setCustomId("delccbut")
        .setEmoji(`🗑️`)
        //.setEmoji({
        //  name: 'trash',
        //  id: '1236348170683027557',
        //})
        .setLabel(`Delete`)
        .setStyle(ButtonStyle.Danger);

      const edb = new ButtonBuilder()
        .setCustomId("editbut")
        .setEmoji(`✏️`)
        .setLabel(`Edit`)
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(cb, dlb, edb);

      let q = {};

      const replyPromise = new Promise((resolve, reject) => {
        i.reply({ embeds: [re], components: [row] })
          .then((msg) => {
            const filter = (interaction) => {
              if (interaction.isButton() && interaction.message.interaction) {
                return (
                  interaction.isButton() &&
                  interaction.message.interaction.id === msg.interaction.id &&
                  interaction.user.id === u.id
                );
              } else {
                return (
                  interaction.isButton() &&
                  interaction.message.id === msg.id &&
                  interaction.user.id === u.id
                );
              }
            };
            const collector = i.channel.createMessageComponentCollector({
              filter,
              time: 60000,
            });

            collector.on("collect", async (interaction) => {
              try {
                if (interaction.customId === "crbut") {
                  collector.stop();
                  const fields = {
                    content: new TextInputBuilder()
                      .setCustomId(`name`)
                      .setLabel(`The name of the command`)
                      .setStyle(1)
                      .setRequired(true),
                  };
                  const modal = new ModalBuilder()
                    .setCustomId(`contentModal`)
                    .setTitle(`Command creation`);
                  const modalrow = new ActionRowBuilder().addComponents(
                    fields.content
                  );
                  modal.setComponents(modalrow);
                  try {
                    await interaction.showModal(modal);
                  } catch (err) {
                    throw err;
                  }
                  let submitted = await interaction
                    .awaitModalSubmit({
                      time: 60000,
                      filter: (i) => i.user.id === interaction.user.id,
                    })
                    .catch((err) => {
                      throw err;
                    });
                  if (!submitted) {
                    return;
                  }
                  submitted.deferUpdate();
                  const er = await this.createCustomCommand(
                    c,
                    i,
                    u,
                    submitted.fields.getTextInputValue("name")
                  );
                  if (er) {
                    reject(err);
                  }
                } else if (interaction.customId === "delccbut") {
                  collector.stop();
                  console.log(1);
                  const er = await this.deleteCustomCommand(c, interaction, u);
                  if (er) {
                    reject(err);
                    try {
                      interaction.deferUpdate();
                    } catch (err) {}
                  }
                } else if (interaction.customId === "editbut") {
                  this.editCustomCommand(c, i, u);
                  collector.stop();
                  await interaction.deferUpdate();
                }
                resolve();
              } catch (err) {
                reject(err);
                if (!interaction.deferred && !interaction.replied) {
                  await interaction.deferUpdate();
                }
              }
            });

            collector.on("end", () => {
              row.components.forEach((component) => {
                component.setDisabled(true);
              });
              msg.edit({ components: [row] });
            });
          })
          .catch((err) => {
            reject(err);
          });
      });
      return replyPromise.catch((err) => {
        throw err;
      });
    } catch (err) {
      return err;
    }
  }

  static async createCustomCommand(c, i, u, n) {
    try {
      let q = {
        main: {
          name: n,
          enabled: true,
          delete_trigger: true,
          user: u.id,
          reply: {
            dreply: false,
            channel: i.channel.id,
          },
          require: {
            channels: [],
            roles: [],
          },
          ignore: {
            channels: [],
            roles: [],
          },
        },
        message: {
          content: null,
        },
        embed: {},
      };

      const emSel = new StringSelectMenuBuilder()
        .setCustomId("create")
        .setPlaceholder("The option to change")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Title")
            .setDescription("The title of the embed")
            .setValue("title"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Color")
            .setDescription("The color of the embed")
            .setValue("color"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Description")
            .setDescription("The description of the embed")
            .setValue("description"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Author")
            .setDescription("The author of the embed")
            .setValue("author"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Fields")
            .setDescription("The fields of the embed")
            .setValue("field"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Thumbnail")
            .setDescription("The thumbnail of the embed")
            .setValue("thumbnail"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Image")
            .setDescription("The image of the embed")
            .setValue("image"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Footer")
            .setDescription("The footer of the embed")
            .setValue("footer"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Timestamp")
            .setDescription("Toggle the timestamp of the embed")
            .setValue("timestamp")
        );
      const setSel = new StringSelectMenuBuilder()
        .setCustomId("setting")
        .setPlaceholder("The setting to change")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Name")
            .setDescription("The name of the command")
            .setValue("name"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Enabled?")
            .setDescription("Toggle wether the command is enabled")
            .setValue("enabled"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Delete Trigger?")
            .setDescription("Delete the trigger on activation")
            .setValue("delete_trigger"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Reply?")
            .setDescription("Toggle wether the command replies")
            .setValue("dreply"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Reply channel")
            .setDescription("Change the channel to reply in")
            .setValue("replychannel"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Ignore Roles")
            .setDescription("Roles that should be ignored")
            .setValue("igroles"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Ignore Channel")
            .setDescription("Channels that should be ignored")
            .setValue("igchannels"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Require Roles")
            .setDescription("Roles that should be required")
            .setValue("rqroles"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Required Channel")
            .setDescription("Channels that should be Required")
            .setValue("rqchannels")
        );
      const cb = new ButtonBuilder()
        .setCustomId("createbut")
        .setEmoji(`➕`)
        .setLabel(`Create`)
        .setStyle(ButtonStyle.Success)
        .setDisabled(false);
      const dlb = new ButtonBuilder()
        .setCustomId("delbut")
        .setEmoji(`🗑️`)
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false);
      const set = new ButtonBuilder()
        .setCustomId("setbut")
        .setEmoji(`⚙️`)
        .setLabel(`Settings`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(false);
      const msgbut = new ButtonBuilder()
        .setCustomId("msgbut")
        .setEmoji(`💬`)
        .setLabel(`Edit the message`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      const embbut = new ButtonBuilder()
        .setCustomId("embbut")
        .setEmoji(`📓`)
        .setLabel(`Add an embed`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(false);
      const delembbut = new ButtonBuilder()
        .setCustomId("delembbut")
        .setEmoji(`📓`)
        .setLabel(`Remove the embed`)
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false);

      const rowBut = new ActionRowBuilder().addComponents(
        cb,
        dlb,
        set,
        msgbut,
        embbut
      );
      const rowBut2 = new ActionRowBuilder().addComponents(
        cb,
        dlb,
        set,
        msgbut,
        delembbut
      );
      const re = new EmbedBuilder().setDescription("_ _");
      const row = new ActionRowBuilder().addComponents(emSel);

      let s, debMsgSel;
      const replyPromise = new Promise((resolve, reject) => {
        i.reply({ content: "_ _", components: [rowBut] })
          .then((msg) => {
            let collector, em, ms, deb;
            function createMsgCompent() {
              try {
                const filter = (interaction) => {
                  if (
                    interaction.isStringSelectMenu() &&
                    interaction.message.interaction
                  ) {
                    return (
                      interaction.isStringSelectMenu() &&
                      interaction.message.interaction.id ===
                        msg.interaction.id &&
                      interaction.user.id === u.id
                    );
                  } else {
                    return (
                      interaction.isStringSelectMenu() &&
                      interaction.message.id === msg.id &&
                      interaction.user.id === u.id
                    );
                  }
                };
                collector = i.channel.createMessageComponentCollector({
                  filter,
                  time: 300000,
                });

               collector.on("collect", async (interaction) => {
                  let submitted, f;
                  try {
                    let fields;
                    switch (interaction.values[0]) {
                      case "title":
                      case "color":
                      case "image":
                      case "thumbnail":
                      case "url":
                        fields = {
                          name: new TextInputBuilder()
                            .setCustomId(`${interaction.values[0]}`)
                            .setLabel(`The ${interaction.values[0]}`)
                            .setStyle(1)
                            .setRequired(true),
                        };
                        createModal(interaction);
                        break;
                      case "description":
                        fields = {
                          name: new TextInputBuilder()
                            .setCustomId(`${interaction.values[0]}`)
                            .setLabel(`The description`)
                            .setStyle(2)
                            .setRequired(true),
                        };
                        createModal(interaction);
                        break;
                      case "field":
                        fields = {
                          name: new TextInputBuilder()
                            .setCustomId(`name`)
                            .setLabel(`The name of the field`)
                            .setStyle(1)
                            .setRequired(true),
                          value: new TextInputBuilder()
                            .setCustomId(`value`)
                            .setLabel(`The value of the field`)
                            .setStyle(2)
                            .setRequired(true),
                          inline: new TextInputBuilder()
                            .setCustomId(`inline`)
                            .setLabel(`Inline? (Y/True)`)
                            .setStyle(1)
                            .setRequired(false),
                        };
                        const feSel = new StringSelectMenuBuilder()
                          .setCustomId("field_select")
                          .setPlaceholder(
                            "Select field to edit or create a new one"
                          )
                          .addOptions(
                            new StringSelectMenuOptionBuilder()
                              .setLabel("New Field")
                              .setDescription("Create a new field")
                              .setValue("_%$%new%$%_%$%field%$%_")
                          );

                        if (re.data.fields) {
                          re.data.fields.forEach((field, index) => {
                            feSel.addOptions(
                              new StringSelectMenuOptionBuilder()
                                .setLabel(field.name)
                                .setDescription(`Edit this field [${index}]`)
                                .setValue(`${field.name} ${index}`)
                            );
                          });
                        }

                        const ferow = new ActionRowBuilder().addComponents(
                          feSel
                        );
                        const r = await interaction.reply({
                          components: [ferow],
                          ephemeral: true,
                        });

                        const filter2 = (i) =>
                          i.user.id === u.id && i.customId === "field_select";
                        const collector2 =
                          interaction.channel.createMessageComponentCollector({
                            filter2,
                            time: 120000,
                          });

                        collector2.on("collect", async (fieldInteraction) => {
                          const value =
                            fieldInteraction.values[0].split(" ")[0];
                          if (value === "_%$%new%$%_%$%field%$%_") {
                            await createModal(fieldInteraction, "new field");
                          } else {
                            await createModal(
                              fieldInteraction,
                              fieldInteraction.values[0]
                            );
                          }
                          r.delete();
                          collector2.stop();
                        });

                        break;
                      case "author":
                        fields = {
                          name: new TextInputBuilder()
                            .setCustomId(`name`)
                            .setLabel(`The authors name`)
                            .setStyle(1)
                            .setRequired(true),
                          iconURL: new TextInputBuilder()
                            .setCustomId(`icon`)
                            .setLabel(`The author icon (link)`)
                            .setStyle(1)
                            .setRequired(false),
                          url: new TextInputBuilder()
                            .setCustomId(`url`)
                            .setLabel(`The author url (link)`)
                            .setStyle(1)
                            .setRequired(false),
                        };
                        createModal(interaction);
                        break;
                      case "timestamp":
                        if (!re.data.timestamp) {
                          re.setTimestamp();
                        } else {
                          delete re.data.timestamp;
                        }
                        q.embed = re;
                        msg
                          .edit({ embeds: [re], components: msg.components })
                          .then(() => {
                            createMsgCompent();
                          });
                        interaction.deferUpdate();
                        return;
                      case "footer":
                        fields = {
                          name: new TextInputBuilder()
                            .setCustomId(`name`)
                            .setLabel(`What should the text be?`)
                            .setStyle(1)
                            .setRequired(true),
                          iconURL: new TextInputBuilder()
                            .setCustomId(`icon`)
                            .setLabel(`What should the icon (link) be?`)
                            .setStyle(1)
                            .setRequired(true),
                        };
                        createModal(interaction);
                        break;
                    }
                    async function createModal(interaction, field) {
                      try {
                      const modal = new ModalBuilder()
                        .setCustomId(`${interaction.values[0]}Modal`)
                        .setTitle(
                          `Customcommand: ${
                            interaction.values[0].charAt(0).toUpperCase() +
                            interaction.values[0].slice(1)
                          }`
                        );
                      if (field) {
                        modal.setCustomId(`fieldModal`);
                      }
                      const keys = Object.keys(fields);
                      if (fields) {
                        keys.forEach((key) => {
                          const modalrow = new ActionRowBuilder().addComponents(
                            fields[key]
                          );
                          modal.components.push(modalrow);
                        });
                      }

                      try {
                        await interaction.showModal(modal);
                      } catch (err) {
                        throw err;
                      }
                      submitted = await interaction
                        .awaitModalSubmit({
                          time: 60000,
                          filter: (i) => i.user.id === interaction.user.id,
                        })
                        .catch((err) => {
                          throw err;
                        });
                      handleModal(submitted, interaction, field);
                    } catch (err) {
                      if (
                        err instanceof DiscordAPIError &&
                        err.code === 10062
                      ) {
                        return;
                      }
                      reject(err);
                    }
                    }
                    function handleModal(submitted, interaction, field) {
                      try {
                      if (!submitted) {
                        return;
                      }
                      let nw;
                      switch (interaction.values[0]) {
                        case "title":
                          nw = submitted.fields.getTextInputValue("title");
                          re.setTitle(nw);
                          break;
                        case "description":
                          nw =
                            submitted.fields.getTextInputValue("description");
                          re.setDescription(nw);
                          break;
                        case "author":
                          if (
                            submitted.fields &&
                            submitted.fields
                              .getTextInputValue("icon")
                              .startsWith("http") &&
                            submitted.fields
                              .getTextInputValue("url")
                              .startsWith("http")
                          ) {
                            re.setAuthor({
                              name: submitted.fields.getTextInputValue("name"),
                              iconURL:
                                submitted.fields.getTextInputValue("icon"),
                              url: submitted.fields.getTextInputValue("url"),
                            });
                          } else if (
                            submitted.fields &&
                            submitted.fields
                              .getTextInputValue("icon")
                              .startsWith("http")
                          ) {
                            re.setAuthor({
                              name: submitted.fields.getTextInputValue("name"),
                              iconURL:
                                submitted.fields.getTextInputValue("icon"),
                            });
                          } else if (
                            submitted.fields &&
                            submitted.fields
                              .getTextInputValue("url")
                              .startsWith("http")
                          ) {
                            re.setAuthor({
                              name: submitted.fields.getTextInputValue("name"),
                              url: submitted.fields.getTextInputValue("url"),
                            });
                          } else {
                            re.setAuthor({
                              name: submitted.fields.getTextInputValue("name"),
                            });
                          }
                          break;
                        case "color":
                          nw = submitted.fields.getTextInputValue("color");
                          try {
                            re.setColor(nw);
                          } catch (err) {
                            submitted.reply({
                              content: `Please provide a valid hex color code (\`${nw}\`)`,
                              ephemeral: true,
                            });
                            return;
                          }
                          break;
                        case "footer":
                          if (
                            submitted.fields &&
                            submitted.fields
                              .getTextInputValue("icon")
                              .startsWith("http")
                          ) {
                            re.setFooter({
                              text: submitted.fields.getTextInputValue("name"),
                              iconURL:
                                submitted.fields.getTextInputValue("icon"),
                            });
                          } else {
                            re.setFooter({
                              text: submitted.fields.getTextInputValue("name"),
                            });
                          }
                          break;
                        case "image":
                          if (
                            submitted.fields &&
                            submitted.fields
                              .getTextInputValue("image")
                              .startsWith("http")
                          ) {
                            nw = submitted.fields.getTextInputValue("image");
                            re.setImage(nw);
                          }
                          break;
                        case "thumbnail":
                          if (
                            submitted.fields &&
                            submitted.fields
                              .getTextInputValue("thumbnail")
                              .startsWith("http")
                          ) {
                            nw =
                              submitted.fields.getTextInputValue("thumbnail");
                            re.setThumbnail(nw);
                          }
                          break;
                      }
                      if (field) {
                        if (field === "new field") {
                          if (
                            (submitted.fields &&
                              submitted.fields.getTextInputValue("inline") &&
                              submitted.fields
                                .getTextInputValue("inline")
                                .toLowerCase() === "true") ||
                            submitted.fields
                              .getTextInputValue("inline")
                              .toLowerCase() === "y"
                          ) {
                            re.addFields({
                              name: submitted.fields.getTextInputValue("name"),
                              value:
                                submitted.fields.getTextInputValue("value"),
                              inline: true,
                            });
                          } else {
                            re.addFields({
                              name: submitted.fields.getTextInputValue("name"),
                              value:
                                submitted.fields.getTextInputValue("value"),
                            });
                          }
                        } else {
                          re.data.fields[field.split(" ")[1]];
                          if (
                            (submitted.fields &&
                              submitted.fields.getTextInputValue("inline") &&
                              submitted.fields
                                .getTextInputValue("inline")
                                .toLowerCase() === "true") ||
                            submitted.fields
                              .getTextInputValue("inline")
                              .toLowerCase() === "y"
                          ) {
                            console.log(
                              re,
                              re.data,
                              re.data.fields[parseInt(field.split(" ")[1])]
                            );
                            re.data.fields[parseInt(field.split(" ")[1])].name =
                              submitted.fields.getTextInputValue("name");
                            re.data.fields[
                              parseInt(field.split(" ")[1])
                            ].value =
                              submitted.fields.getTextInputValue("value");
                            re.data.fields[
                              parseInt(field.split(" ")[1])
                            ].inline = true;
                          } else {
                            re.data.fields[parseInt(field.split(" ")[1])].name =
                              submitted.fields.getTextInputValue("name");
                            re.data.fields[
                              parseInt(field.split(" ")[1])
                            ].value =
                              submitted.fields.getTextInputValue("value");
                            re.data.fields[
                              parseInt(field.split(" ")[1])
                            ].inline = false;
                          }
                        }
                      }
                      q.embed = re;
                      msg
                        .edit({ embeds: [re], components: msg.components })
                        .then(() => {
                          createMsgCompent();
                        });
                      submitted.deferUpdate();
                    } catch (err) {
                      if (
                        err instanceof DiscordAPIError &&
                        err.code === 10062
                      ) {
                        return;
                      }
                      reject(err);
                    }
                    }
                    s = true;
                    collector.stop();
                    
                  } catch (err) {
                    reject(err);
                  }
                });
                collector.on("end", () => {
                  if (!s) {
                    msg.edit({ components: [rowBut] });
                    return;
                  } else {
                    s = false;
                  }
                });
              } catch (err) {
                throw err;
              }
            }
            function createButCompent() {
              const filterBut = (interaction) => {
                if (interaction.isButton() && interaction.message.interaction) {
                  return (
                    interaction.isButton() &&
                    interaction.message.interaction.id === msg.interaction.id &&
                    interaction.user.id === u.id
                  );
                } else {
                  return (
                    interaction.isButton() &&
                    interaction.message.id === msg.id &&
                    interaction.user.id === u.id
                  );
                }
              };
              const collectorBut = i.channel.createMessageComponentCollector({
                filterBut,
                time: 1800000,
              });
              collectorBut.on("collect", async (butInteraction) => {
                try {
                  if (!deb) {
                    deb = true;
                    ms = true;
                    if (butInteraction.customId === "delbut") {
                      try {
                        ms = false;
                        collectorBut.stop();
                        if (collector) {
                          collector.stop();
                        }
                        butInteraction.reply(
                          "Cancelled the making of a new custom command"
                        );
                        return;
                      } catch (err) {
                        reject(err);
                        return;
                      }
                    } else if (butInteraction.customId === "createbut") {
                      try {
                        const er = await c.data.createCustomCommand(
                          butInteraction.guild,
                          q
                        );
                        if (er) {
                          if (er === "Name already in use.") {
                            await butInteraction.reply({
                              content:
                                "This name is already in use, try renaming the command.",
                              ephemeral: true,
                            });
                          } else {
                            reject(er);
                          }
                        } else {
                          ms = false;
                          collectorBut.stop();
                          if (collector) {
                            collector.stop();
                          }
                          await butInteraction.reply(
                            "Made a new custom command"
                          );
                          return;
                        }
                      } catch (err) {
                        reject(err);
                        return;
                      }
                    } else if (butInteraction.customId === "setbut") {
                      async function createSetCompent(interaction, u) {
                        try {
                          collectorBut.stop();
                          em = true;
                          const setrow = new ActionRowBuilder().addComponents(
                            setSel
                          );
                          let r;
                          try {
                            r = await interaction.reply({
                              components: [setrow],
                              ephemeral: true,
                            });
                          } catch (err) {
                            if (
                              err instanceof DiscordAPIError &&
                              err.code === 10062
                            ) {
                              return;
                            }
                          }
                          const filter2 = (i) =>
                            i.user.id === u.id &&
                            i.customId === "setting" &&
                            interaction.message.interaction.id ===
                              msg.interaction.id;
                          const collector2 =
                            interaction.channel.createMessageComponentCollector(
                              {
                                filter2,
                                time: 120000,
                              }
                            );
                          collector2.on("collect", async (interaction) => {
                            try {
                              switch (interaction.values[0]) {
                                case "name":
                                  try {
                                    const fields = {
                                      name: new TextInputBuilder()
                                        .setCustomId(`${interaction.values[0]}`)
                                        .setLabel(
                                          `The ${interaction.values[0]}`
                                        )
                                        .setStyle(1)
                                        .setRequired(true),
                                    };
                                    const modal = new ModalBuilder()
                                      .setCustomId(
                                        `${interaction.values[0]}Modal`
                                      )
                                      .setTitle(
                                        `Customcommand: ${
                                          interaction.values[0]
                                            .charAt(0)
                                            .toUpperCase() +
                                          interaction.values[0].slice(1)
                                        }`
                                      );
                                    const modalrow =
                                      new ActionRowBuilder().addComponents(
                                        fields.name
                                      );
                                    modal.setComponents(modalrow);

                                    try {
                                      await interaction.showModal(modal);
                                    } catch (err) {
                                      throw err;
                                    }
                                    const submitted = await interaction
                                      .awaitModalSubmit({
                                        time: 60000,
                                        filter: (i) =>
                                          i.user.id === interaction.user.id,
                                      })
                                      .catch((err) => {
                                        throw err;
                                      });
                                    const oldn = q.main.name;
                                    q.main.name =
                                      submitted.fields.getTextInputValue(
                                        "name"
                                      );
                                    submitted.reply({
                                      content: `Changed the name from \`${oldn}\` to \`${q.main.name}\``,
                                      ephemeral: true,
                                    });
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                                case "enabled":
                                  try {
                                    if (q.main.enabled === true) {
                                      q.main.enabled = false;
                                      interaction.reply({
                                        content: `Set the command as \`disabled\``,
                                        ephemeral: true,
                                      });
                                    } else {
                                      q.main.enabled = true;
                                      interaction.reply({
                                        content: `Set the command as \`enabled\``,
                                        ephemeral: true,
                                      });
                                    }
                                  } catch (err) {
                                    reject(err);
                                  }
                                  createButCompent();
                                  break;
                                case "delete_trigger":
                                  try {
                                    if (q.main.delete_trigger === true) {
                                      q.main.delete_trigger = false;
                                      interaction.reply({
                                        content: `Set the Delete Trigger as \`disabled\``,
                                        ephemeral: true,
                                      });
                                    } else {
                                      q.main.delete_trigger = true;
                                      interaction.reply({
                                        content: `Set the Delete Trigger as \`enabled\``,
                                        ephemeral: true,
                                      });
                                    }
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                                case "dreply":
                                  try {
                                    if (q.main.reply.dreply === true) {
                                      q.main.reply.dreply = false;
                                      interaction.reply({
                                        content: `Set the Reply to trigger as \`disabled\``,
                                        ephemeral: true,
                                      });
                                    } else {
                                      q.main.reply.dreply = true;
                                      interaction.reply({
                                        content: `Set the Reply to trigger as \`enabled\``,
                                        ephemeral: true,
                                      });
                                    }
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                                case "replychannel":
                                  try {
                                    const rcroleSel =
                                      new ChannelSelectMenuBuilder()
                                        .setCustomId("chanSelect")
                                        .setMaxValues(1)
                                        .setMinValues(1)
                                        .setDefaultChannels(
                                          q.main.reply.channel
                                        );
                                    const rcrow =
                                      new ActionRowBuilder().addComponents(
                                        rcroleSel
                                      );
                                    const rco = await interaction.reply({
                                      components: [rcrow],
                                      ephemeral: true,
                                    });
                                    const igfilter2 = (i) =>
                                      i.user.id === u.id &&
                                      i.customId === "chanSelect" &&
                                      interaction.message.interaction.id ===
                                        msg.interaction.id;
                                    const rccollector2 =
                                      interaction.channel.createMessageComponentCollector(
                                        {
                                          igfilter2,
                                          time: 120000,
                                        }
                                      );

                                    rccollector2.on(
                                      "collect",
                                      async (interaction) => {
                                        q.main.reply.channel =
                                          interaction.values;
                                        rccollector2.stop();
                                        rco.delete();
                                        let content = `Set the command to reply in<#${q.main.reply.channel}>`;
                                        interaction.reply({
                                          content: content,
                                          ephemeral: true,
                                        });
                                      }
                                    );
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                                case "igroles":
                                  try {
                                    const igroleSel =
                                      new RoleSelectMenuBuilder()
                                        .setCustomId("rolesSelect")
                                        .setMaxValues(10)
                                        .setDefaultRoles(q.main.ignore.roles);
                                    const igrow =
                                      new ActionRowBuilder().addComponents(
                                        igroleSel
                                      );
                                    const igo = await interaction.reply({
                                      components: [igrow],
                                      ephemeral: true,
                                    });
                                    const igfilter2 = (i) =>
                                      i.user.id === u.id &&
                                      i.customId === "rolesSelect" &&
                                      interaction.message.interaction.id ===
                                        msg.interaction.id;
                                    const igcollector2 =
                                      interaction.channel.createMessageComponentCollector(
                                        {
                                          igfilter2,
                                          time: 120000,
                                        }
                                      );

                                    igcollector2.on(
                                      "collect",
                                      async (interaction) => {
                                        q.main.ignore.roles =
                                          interaction.values;
                                        let content = `Set the command to ignore`;
                                        q.main.ignore.roles.forEach((chan) => {
                                          content += ` <@&${chan}>`;
                                        });
                                        interaction.reply({
                                          content: content,
                                          ephemeral: true,
                                        });
                                        igcollector2.stop();
                                        igo.delete();
                                      }
                                    );
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                                case "igchannels":
                                  try {
                                    const rcroleSel =
                                      new ChannelSelectMenuBuilder()
                                        .setCustomId("chanSelect")
                                        .setMaxValues(10)
                                        .setMinValues(0)
                                        .setDefaultChannels(
                                          q.main.ignore.channels
                                        );
                                    const rcrow =
                                      new ActionRowBuilder().addComponents(
                                        rcroleSel
                                      );
                                    const rco = await interaction.reply({
                                      components: [rcrow],
                                      ephemeral: true,
                                    });
                                    const igfilter2 = (i) =>
                                      i.user.id === u.id &&
                                      i.customId === "chanSelect" &&
                                      interaction.message.interaction.id ===
                                        msg.interaction.id;
                                    const rccollector2 =
                                      interaction.channel.createMessageComponentCollector(
                                        {
                                          igfilter2,
                                          time: 120000,
                                        }
                                      );

                                    rccollector2.on(
                                      "collect",
                                      async (interaction) => {
                                        q.main.ignore.channels =
                                          interaction.values;
                                        rccollector2.stop();
                                        rco.delete();
                                        let content = `Set the command to ignore`;
                                        q.main.ignore.channels.forEach(
                                          (chan) => {
                                            content += ` <#${chan}>`;
                                          }
                                        );
                                        interaction.reply({
                                          content: content,
                                          ephemeral: true,
                                        });
                                      }
                                    );
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                                case "rqchannels":
                                  try {
                                    const rcroleSel =
                                      new ChannelSelectMenuBuilder()
                                        .setCustomId("chanSelect")
                                        .setMaxValues(5)
                                        .setMinValues(0)
                                        .setDefaultChannels(
                                          q.main.require.channels
                                        );
                                    const rcrow =
                                      new ActionRowBuilder().addComponents(
                                        rcroleSel
                                      );
                                    const rco = await interaction.reply({
                                      components: [rcrow],
                                      ephemeral: true,
                                    });
                                    const igfilter2 = (i) =>
                                      i.user.id === u.id &&
                                      i.customId === "chanSelect" &&
                                      interaction.message.interaction.id ===
                                        msg.interaction.id;
                                    const rccollector2 =
                                      interaction.channel.createMessageComponentCollector(
                                        {
                                          igfilter2,
                                          time: 120000,
                                        }
                                      );

                                    rccollector2.on(
                                      "collect",
                                      async (interaction) => {
                                        q.main.require.channels =
                                          interaction.values;
                                        rccollector2.stop();
                                        rco.delete();
                                        let content = `Set the command to require`;
                                        q.main.require.channels.forEach(
                                          (chan) => {
                                            content += `, <#${chan}>`;
                                          }
                                        );
                                        interaction.reply({
                                          content: content,
                                          ephemeral: true,
                                        });
                                      }
                                    );
                                  } catch (err) {
                                    reject(err);
                                  }
                                  break;
                              }
                              r.delete();
                              collector2.stop();
                            } catch (err) {
                              reject(err);
                            }
                          });
                        } catch (err) {
                          if (
                            err instanceof DiscordAPIError &&
                            err.code === 10062
                          ) {
                            return;
                          }
                          reject(err);
                          return;
                        }
                      }
                      createSetCompent(butInteraction, u);
                    } else if (butInteraction.customId === "embbut") {
                      try {
                        collectorBut.stop();
                        msg.edit({
                          content: msg.content,
                          embeds: [re],
                          components: [row, rowBut2],
                        });
                        createMsgCompent();
                        butInteraction.deferUpdate();
                      } catch (err) {
                        reject(err);
                        return;
                      }
                    } else if (butInteraction.customId === "delembbut") {
                      try {
                        collectorBut.stop();
                        em = false;
                        msg.edit({
                          content: msg.content,
                          embeds: [],
                          components: [rowBut],
                        });
                        q.embed = {};
                        collector.stop();
                        butInteraction.deferUpdate();
                      } catch (err) {
                        reject(err);
                        return;
                      }
                    } else if (butInteraction.customId === "msgbut") {
                      try {
                        collectorBut.stop();
                        const fields = {
                          content: new TextInputBuilder()
                            .setCustomId(`content`)
                            .setLabel(`The content of the message`)
                            .setStyle(2)
                            .setRequired(true),
                        };
                        const modal = new ModalBuilder()
                          .setCustomId(`contentModal`)
                          .setTitle(`Message content`);
                        const modalrow = new ActionRowBuilder().addComponents(
                          fields.content
                        );
                        modal.setComponents(modalrow);
                        try {
                          await butInteraction.showModal(modal);
                        } catch (err) {
                          throw err;
                        }
                        let submitted = await butInteraction
                          .awaitModalSubmit({
                            time: 60000,
                            filter: (i) => i.user.id === butInteraction.user.id,
                          })
                          .catch((err) => {
                            throw err;
                          });
                        if (!submitted) {
                          createButCompent();
                          return;
                        }
                        msg.edit({
                          content:
                            submitted.fields.getTextInputValue("content"),
                          embeds: msg.embeds,
                          components: msg.components,
                        });
                        (q.message.content =
                          submitted.fields.getTextInputValue("content")),
                          submitted.deferUpdate();
                      } catch (err) {
                        if (
                          err instanceof DiscordAPIError &&
                          err.code === 10062
                        ) {
                          return;
                        }
                        reject(err);
                        return;
                      }
                    }
                    createButCompent();
                    deb = false;
                  }
                } catch (err) {
                  reject(err);
                }
              });
              collectorBut.on("end", () => {
                if (!ms) {
                  if (collector) {
                    collector.stop();
                  }
                  msg.edit({ components: [] });
                  resolve();
                } else {
                  ms = false;
                }
              });
            }
            createButCompent();
          })
          .catch((err) => {
            reject(err);
            return;
          });
      });
      return replyPromise.catch((err) => {
        throw err;
      });
    } catch (err) {
      return err;
    }
  }

  static async deleteCustomCommand(c, i, u) {
    try {
      const allCommands = c.data.getAllCustomCommands(i.guild);
      const deSel = new StringSelectMenuBuilder()
        .setCustomId("del_select")
        .setPlaceholder("Select the command to delete");
      if (allCommands && allCommands[0]) {
        allCommands.forEach((cmd, index) => {
          deSel.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(cmd.name)
              .setDescription(
                `Delete the custom command "${cmd.name}" | ${cmd.id}`
              )
              .setValue(`${cmd.id}|${index}`)
          );
        });
        const delRow = new ActionRowBuilder().addComponents(deSel);
        const r = await i.reply({
          components: [delRow],
          ephemeral: true,
        });

        const filter2 = (i) =>
          i.user.id === u.id && i.customId === "del_select";
        const collector2 = interaction.channel.createMessageComponentCollector({
          filter2,
          time: 120000,
        });

        collector2.on("collect", async (ccToDelInter) => {
          const tDA = ccToDelInter.values[0].split("|");
          const tDID = tDA[0];
          const tDI = tDA[1];
          if (allCommands[tDI].id.toString() === tDID.toString()) {
            r.delete();
            collector2.stop();
          }
        });
      }
    } catch (err) {
      return err;
    }
  }

  static async editCustomCommand(c, i, u) {
    try {
    } catch (err) {
      return err;
    }
  }

  //----------------- moderation -----------------\\
  static async warn(client, interaction, target, user, reason) {
    try {
      const data = await client.data.makeModeration(
        interaction.guild,
        target,
        "warn",
        user.id,
        reason
      );
      const total = data.total;
      const caseNum = data.case;
      const warnedEmbed = new EmbedBuilder()
        .setTitle(`Warning overview`)
        .setColor(client.config.customization.embedColor);
      let dmEmbed = new EmbedBuilder()
        .setTitle(`You have been warned in ${interaction.guild.name}`)
        .setColor(client.config.customization.embedColor);

      if (total === 1) {
        dmEmbed.setDescription(
          `You have been warned by <@${user.id}> in ${interaction.guild.name} for the following reason: ${reason} \nYou now have ${total} warning.`
        );
        warnedEmbed.setDescription(
          `You have warned <@${target}> for the following reason: ${reason}. \nThey now have ${total} moderation in this server. \nCase: ${caseNum}`
        );
      } else {
        dmEmbed.setDescription(
          `You have been warned by <@${user.id}> in ${interaction.guild.name} for the following reason: ${reason} \nYou now have ${total} warnings.`
        );
        warnedEmbed.setDescription(
          `You have warned <@${target}> for the following reason: ${reason}. \nThey now have ${total} moderations in this server. \nCase: ${caseNum}`
        );
      }

      let dmChannel = await client.users.createDM(target);
      interaction.reply({ embeds: [warnedEmbed] });
      dmChannel.send({ embeds: [dmEmbed] });
    } catch (err) {
      return err;
    }
  }

  static async mute(c, i, m, t, d, r) {
    try {
      t.timeout(d, r);
      const data = await c.data.makeModeration(i.guild, t.id, "mute", m.id, r);
    } catch (error) {
      return error;
    }
  }

  static async unmute(c, i, m, t, r) {
    try {
      t.timeout(1, r);
      const data = await c.data.makeModeration(
        i.guild,
        t.id,
        "unmute",
        m.id,
        r
      );
    } catch (error) {
      return error;
    }
  }

  static async purge(client, i, u, c, ch) {
    try {
      let tD;
      if (!ch) {
        tD = await i.channel.messages.fetch({ limit: 100 });
      } else {
        tD = await ch.messages.fetch({ limit: 100 });
      }
      const deleted = await i.channel.bulkDelete(tD.first(c));
      const replyEmbed = new EmbedBuilder()
        .setTitle(`Purge succesfull`)
        .setColor(client.config.customization.embedColor)
        .setDescription(
          `<:reason:1233487051144302792> **Channel:** <#${i.channel.id}>\n<:staff:1233486987433087148>**Moderator:** <@${u.id}>\n<:servers:1235655770347933857>**Fetched:** \`${tD.size}\`\n<:size:1235655774022139964>**Requested:** \`${c}\`\n**Deleted:** \`${deleted.size}\``
        );
      if (i && i.options) {
        i.reply({ embeds: [replyEmbed], ephemeral: true });
      } else {
        i.channel.send({ embeds: [replyEmbed] });
      }
    } catch (err) {
      return err;
    }
  }

  static async kick() {
    try {
    } catch (error) {
      return error;
    }
  }

  static async ban(c, i, m, t, r, h) {
    try {
      if (h) {
        await i.guild.members.ban(t);
      } else {
        await t.ban();
        t = t.user;
      }
      const data = await c.data.makeModeration(i.guild, t.id, "ban", m.id, r);
      const total = data.total;
      const caseNum = data.case;
      const banEmbed = new EmbedBuilder()
        .setTitle(`Ban overview`)
        .setColor(c.config.customization.embedColor)
        .setDescription(
          `<:staff:1233486987433087148>**Moderator:** <@${m.id}>\n<:target:1233487058585260205>**Target:** \`${t.username}#${t.discriminator}\` \`(${t.id})\`\n<:size:1235655774022139964>**Case:** \`${caseNum}\`\n<:reason:1233487051144302792>**Reason:** \`${r}\``
        )
        .setAuthor({
          name: `${t.username}`,
          iconURL: `https://cdn.discordapp.com/avatars/${t.id}/${t.avatar}.webp?format=webp&width=638&height=638`,
        });
      const dmEmbed = new EmbedBuilder()
        .setTitle(`You have been banned in ${i.guild.name}`)
        .setColor(c.config.customization.embedColor)
        .setDescription(
          `You have been banned by <@${m.id}> in ${i.guild.name} for the following reason: \`${r}\`.`
        );

      const dmChannel = await c.users.createDM(t);
      i.reply({ embeds: [banEmbed] });
      await dmChannel.send({ embeds: [dmEmbed] });
    } catch (error) {
      return error;
    }
  }

  static async unban(c, i, m, t, r) {
    try {
      await i.guild.members.unban(t.id, r);
      const data = await c.data.makeModeration(i.guild, t.id, "unban", m.id, r);
      const total = data.total;
      const caseNum = data.case;
      const banEmbed = new EmbedBuilder()
        .setTitle(`Unban overview`)
        .setColor(c.config.customization.embedColor)
        .setDescription(
          `<:staff:1233486987433087148>**Moderator:** <@${m.id}>\n<:target:1233487058585260205>**Target:** \`${t.username}#${t.discriminator}\` \`(${t.id})\`\n<:size:1235655774022139964>**Case:** \`${caseNum}\`\n<:reason:1233487051144302792>**Reason:** \`${r}\``
        )
        .setAuthor({
          name: `${t.globalName || t.username}`,
          iconURL: `https://cdn.discordapp.com/avatars/${t.id}/${t.avatar}.webp?format=webp&width=638&height=638`,
        });
      i.reply({ embeds: [banEmbed] });
    } catch (error) {
      return error;
    }
  }

  static async lock(client, i, u, c, r) {
    try {
      c.permissionOverwrites.set([
        {
          id: i.guild.id,
          deny: PermissionsBitField.Flags.SendMessages,
        },
      ]);
      const lockedEmbed = new EmbedBuilder()
        .setTitle(`Channel Locked`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`**Reason:** ${r}`);
      c.send({ embeds: [lockedEmbed] });
    } catch (err) {
      return err;
    }
  }

  static async unlock(client, i, u, c, r) {
    try {
      c.permissionOverwrites.set([
        {
          id: i.guild.id,
          allow: PermissionsBitField.Flags.SendMessages,
        },
      ]);
      const unlockedEmbed = new EmbedBuilder()
        .setTitle(`Channel Unlocked`)
        .setColor(client.config.customization.embedColor);
      c.send({ embeds: [unlockedEmbed] });
    } catch (err) {
      return err;
    }
  }

  static async cases(client, i, user, typ, val) {
    try {
      let curPage = 1,
        maxPage;
      const data = await client.data.getModerations(i.guild, typ, val);
      maxPage = Math.ceil(Number(data.length) / 5);
      const responseEmbed = new EmbedBuilder()
        .setTitle("Search results")
        .setColor(client.config.customization.embedColor);

      const prevButton = new ButtonBuilder()
        .setCustomId("prevPage")
        .setEmoji({
          name: "tts_left_arrow",
          id: "1194338492772270152",
        })
        .setStyle(ButtonStyle.Primary);

      const currentPageButton = new ButtonBuilder()
        .setCustomId("currentPage")
        .setLabel(`Page 1 / ${maxPage}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const nextButton = new ButtonBuilder()
        .setCustomId("nextPage")
        .setEmoji({
          name: "tts_right_arrow",
          id: "1194338413441191976",
        })
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(
        prevButton,
        currentPageButton,
        nextButton
      );

      if (data.length === 0) {
        responseEmbed.setDescription(`No logs were found.`);
      }
      const selecData = Object.keys(data)
        .slice(-4 + curPage * 5, curPage * 5)
        .map((key) => data[key]);
      selecData.forEach((log) => {
        const caseId = log.case;
        const targetId = log.target;
        const type = log.type;
        const moderatorId = log.moderator;
        const time = log.time;

        responseEmbed.addFields({
          name: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } - Case ${caseId}`,
          value: `<:size:1235655774022139964>**Case:** \`${caseId}\` \n<:moderation:1233486994911395942>**Type:** \`${
            type.charAt(0).toUpperCase() + type.slice(1)
          }\` \n<:target:1233487058585260205>**Target:** <@${targetId}> \n<:staff:1233486987433087148>**Moderator:** <@${moderatorId}> \n<:time:1235655785204285500>**Time:** <t:${Math.floor(
            time / 1000
          )}>`,
        });
      });
      i.reply({ embeds: [responseEmbed], components: [row] }).then((msg) => {
        const filter = (interaction) => {
          if (interaction.isButton() && interaction.message.interaction) {
            return (
              interaction.isButton() &&
              interaction.message.interaction.id === msg.interaction.id &&
              interaction.user.id === user.id
            );
          } else {
            return (
              interaction.isButton() &&
              interaction.message.id === msg.id &&
              interaction.user.id === user.id
            );
          }
        };
        const collector = i.channel.createMessageComponentCollector({
          filter,
          time: 60000,
        });
        collector.on("collect", (interaction) => {
          if (interaction.customId === "prevPage") {
            curPage--;
            if (curPage === 0) {
              curPage = maxPage;
            }
            const selecData = Object.keys(data)
              .slice(-4 + curPage * 5, curPage * 5)
              .map((key) => data[key]);
            const allEmbeds = interaction.message.embeds;
            const oldEmbed = allEmbeds[0];
            const newEmbed = new EmbedBuilder()
              .setColor(client.config.customization.embedColor)
              .setTitle(oldEmbed.title)
              .setDescription(oldEmbed.description)
              .setFooter(oldEmbed.footer)
              .setThumbnail(oldEmbed.thumbnail)
              .setImage(oldEmbed.image)
              .setAuthor(oldEmbed.author);
            selecData.forEach((log) => {
              const caseId = log.case;
              const targetId = log.target;
              const type = log.type;
              const moderatorId = log.moderator;
              const time = log.time;

              newEmbed.addFields({
                name: `${
                  type.charAt(0).toUpperCase() + type.slice(1)
                } - Case ${caseId}`,
                value: `<:size:1235655774022139964>**Case:** \`${caseId}\` \n<:moderation:1233486994911395942>**Type:** \`${
                  type.charAt(0).toUpperCase() + type.slice(1)
                }\` \n<:target:1233487058585260205>**Target:** <@${targetId}> \n<:staff:1233486987433087148>**Moderator:** <@${moderatorId}> \n<:time:1235655785204285500>**Time:** <t:${Math.floor(
                  time / 1000
                )}>`,
              });
            });
            row.components[1].setLabel(`Page ${curPage} / ${maxPage}`);
            interaction.message.edit({ embeds: [newEmbed], components: [row] });
            interaction.deferUpdate();
          } else if (interaction.customId === "nextPage") {
            curPage++;
            if (curPage > maxPage) {
              curPage = 1;
            }
            const selecData = Object.keys(data)
              .slice(-4 + curPage * 5, curPage * 5)
              .map((key) => data[key]);
            const allEmbeds = interaction.message.embeds;
            const oldEmbed = allEmbeds[0];
            const newEmbed = new EmbedBuilder()
              .setColor(client.config.customization.embedColor)
              .setTitle(oldEmbed.title)
              .setDescription(oldEmbed.description)
              .setFooter(oldEmbed.footer)
              .setThumbnail(oldEmbed.thumbnail)
              .setImage(oldEmbed.image)
              .setAuthor(oldEmbed.author);
            selecData.forEach((log) => {
              const caseId = log.case;
              const targetId = log.target;
              const type = log.type;
              const moderatorId = log.moderator;
              const time = log.time;

              newEmbed.addFields({
                name: `${
                  type.charAt(0).toUpperCase() + type.slice(1)
                } - Case ${caseId}`,
                value: `<:size:1235655774022139964>**Case:** \`${caseId}\` \n<:moderation:1233486994911395942>**Type:** \`${
                  type.charAt(0).toUpperCase() + type.slice(1)
                }\` \n<:target:1233487058585260205>**Target:** <@${targetId}> \n<:staff:1233486987433087148>**Moderator:** <@${moderatorId}> \n<:time:1235655785204285500>**Time:** <t:${Math.floor(
                  time / 1000
                )}>`,
              });
            });
            row.components[1].setLabel(`Page ${curPage} / ${maxPage}`);
            interaction.message.edit({ embeds: [newEmbed], components: [row] });
            interaction.deferUpdate();
          }
        });
        collector.on("end", () => {
          row.components.forEach((component) => {
            component.setDisabled(true);
          });
          msg.edit({ components: [row] });
        });
      });
    } catch (err) {
      return err;
    }
  }

  //----------------- base -----------------\\
  static async config(client, interaction, user, args) {
    try {
      if (page === 3) {
        page = 0;
      }
      let found = false;
      if (args[0] && !(args[0].length <= 2)) {
        const data = await client.data.getGuildSettings(interaction.guild);
        findKey(data, args);
        function findKey(obj, args) {
          for (const key in obj) {
            if (Array.isArray(obj[key]) && args[0] === key) {
              obj[key].push(args[1]);
              found = true;
              interaction.reply(`Changed the ${key} to ${obj[key]}`);
            } else if (obj[key] instanceof Object && obj[key] !== null) {
              findKey(obj[key], args);
            } else if (args[0] === key) {
              obj[key] = args[1];
              found = true;
              interaction.reply(`Changed the ${key} to ${obj[key]}`);
            }
          }
        }
        if (!found) {
          interaction.reply(`Could not find \`${args[0]}\``);
        }
        client.data.setGuildSettings(interaction.guild, data);
        return;
      }
      const data = await client.data.getGuildSettings(interaction.guild);
      const configEmbed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name}'s configurations`)
        .setColor(client.config.customization.embedColor);

      let pages = [];
      for (const category in data) {
        pages.push(category);
      }
      for (const settingName in data[pages[page]]) {
        const setting = data[pages[page]][settingName];
        if (Array.isArray(setting)) {
          let items;
          items = setting.join(", ");
          if (items.length <= 2) {
            items = "None";
          }
          configEmbed.addFields({ name: `${settingName}`, value: `${items}` });
        } else if (setting instanceof Object) {
          let sSet = "";
          for (const subSettingName in setting) {
            const subSetting = setting[subSettingName];
            sSet = `${sSet}\n${subSettingName}: ${subSetting}`;
          }
          configEmbed.addFields({ name: `${settingName}`, value: `${sSet}` });
        } else {
          configEmbed.addFields({
            name: `${settingName}`,
            value: `${setting}`,
          });
        }
      }
      page++;
      const sentEmbed = await interaction.reply({
        content: `${JSON.stringify(data)}`,
        embeds: [configEmbed],
      });
    } catch (err) {
      return err;
    }
  }
};
