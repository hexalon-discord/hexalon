const { EmbedBuilder, ButtonInteraction, TimestampStyles, MessageComponentInteraction, InteractionType, Embed, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require("discord.js");
const config = require("../config/config");
const fs = require('fs');
const path = require('path');
const os = require('os-utils');
let page=0;
module.exports = class Manager {

    //----------------- utility -----------------\\
    static async ping(client, message) {
      try {
        const getCpuUsage = () => {
          return new Promise((resolve) => {
            os.cpuUsage((v) => {
              resolve(v.toFixed(2));
            });
          });
        };
        const CPU = await getCpuUsage()
        const memory = process.memoryUsage();
        const keys = Object.keys(memory);
        const a = memory;
        keys.forEach((key) => {
            memory[key] = (a[key] / 1024 / 1024).toFixed(2) + "MB";
        });
        const embedPing = new EmbedBuilder()
        .setTitle(`Shard [${message.guild.shard}]`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`Pong! 🏓\n**Latency:** \`${Math.round(client.ws.ping)}ms\`\n**Resources:**\n<:space:1235658011607961690>***RAM:*** \`${memory.rss}\`\n<:space:1235658011607961690>***CPU:*** \`${CPU}%\`\n**Servers:** \`${client.guilds.cache.size}\`\n**Users:** \`${client.users.cache.size}\``)
          message.reply({embeds: [embedPing]});
      } catch (err) {
        return err;
      }
    }


    //----------------- moderation -----------------\\
    static async warn(client, interaction, target, user, reason) {
      try {
        const data = await client.data.makeModeration(interaction.guild, target, "warn", user.id, reason)
        const total = data.total
        const caseNum = data.case
        const warnedEmbed = new EmbedBuilder()
        .setTitle(`Warning overview`)
        .setColor(client.config.customization.embedColor)
        let dmEmbed = new EmbedBuilder()
        .setTitle(`You have been warned in ${interaction.guild.name}`)
        .setColor(client.config.customization.embedColor)

        if (total === 1) {
          dmEmbed.setDescription(`You have been warned by <@${user.id}> in ${interaction.guild.name} for the following reason: ${reason} \nYou now have ${total} warning.`)
          warnedEmbed.setDescription(`You have warned <@${target}> for the following reason: ${reason}. \nThey now have ${total} moderation in this server. \nCase: ${caseNum}`)
        } else {
          dmEmbed.setDescription(`You have been warned by <@${user.id}> in ${interaction.guild.name} for the following reason: ${reason} \nYou now have ${total} warnings.`)
          warnedEmbed.setDescription(`You have warned <@${target}> for the following reason: ${reason}. \nThey now have ${total} moderations in this server. \nCase: ${caseNum}`)
        }

        let dmChannel = await client.users.createDM(target);
        interaction.reply({embeds: [warnedEmbed]});
        dmChannel.send({embeds: [dmEmbed]});
      } catch(err) {
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
        const data = await c.data.makeModeration(i.guild, t.id, "unmute", m.id, r);
      } catch (error) {
        return error;
      }
    }

    static async purge(client, i, u, c, ch) {
      try {
        let tD
        if (!ch) {
          tD = await i.channel.messages.fetch({ limit: 100 });
        } else {
          tD = await ch.messages.fetch({ limit: 100 });
        }
        const deleted = await i.channel.bulkDelete(tD.first(c))
        const replyEmbed = new EmbedBuilder()
        .setTitle(`Purge succesfull`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`<:reason:1233487051144302792> **Channel:** <#${i.channel.id}>\n<:staff:1233486987433087148>**Moderator:** <@${u.id}>\n<:servers:1235655770347933857>**Fetched:** \`${tD.size}\`\n<:size:1235655774022139964>**Requested:** \`${c}\`\n**Deleted:** \`${deleted.size}\``)
        if (i && i.options) {
          i.reply({embeds: [replyEmbed], ephemeral: true})
        } else {
          i.channel.send({embeds: [replyEmbed]})
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
          await i.guild.members.ban(t)
        } else {
          await t.ban();
          t = t.user
        }
        const data = await c.data.makeModeration(i.guild, t.id, "ban", m.id, r);
        const total = data.total
        const caseNum = data.case
        const banEmbed = new EmbedBuilder()
        .setTitle(`Ban overview`)
        .setColor(c.config.customization.embedColor)
        .setDescription(`<:staff:1233486987433087148>**Moderator:** <@${m.id}>\n<:target:1233487058585260205>**Target:** \`${t.username}#${t.discriminator}\` \`(${t.id})\`\n<:size:1235655774022139964>**Case:** \`${caseNum}\`\n<:reason:1233487051144302792>**Reason:** \`${r}\``)
        .setAuthor({name: `${t.username}`, iconURL: `https://cdn.discordapp.com/avatars/${t.id}/${t.avatar}.webp?format=webp&width=638&height=638`})
        const dmEmbed = new EmbedBuilder()
        .setTitle(`You have been banned in ${i.guild.name}`)
        .setColor(c.config.customization.embedColor)
        .setDescription(`You have been banned by <@${m.id}> in ${i.guild.name} for the following reason: \`${r}\`.`)
  
        const dmChannel = await c.users.createDM(t);
        i.reply({embeds: [banEmbed]});
        await dmChannel.send({embeds: [dmEmbed]});
      } catch (error) {
        return error;
      }
    }

    static async unban(c, i, m, t, r) {
      try {
        await i.guild.members.unban(t.id, r)
        const data = await c.data.makeModeration(i.guild, t.id, "unban", m.id, r);
        const total = data.total
        const caseNum = data.case
        const banEmbed = new EmbedBuilder()
        .setTitle(`Unban overview`)
        .setColor(c.config.customization.embedColor)
        .setDescription(`<:staff:1233486987433087148>**Moderator:** <@${m.id}>\n<:target:1233487058585260205>**Target:** \`${t.username}#${t.discriminator}\` \`(${t.id})\`\n<:size:1235655774022139964>**Case:** \`${caseNum}\`\n<:reason:1233487051144302792>**Reason:** \`${r}\``)
        .setAuthor({name: `${t.globalName || t.username}`, iconURL: `https://cdn.discordapp.com/avatars/${t.id}/${t.avatar}.webp?format=webp&width=638&height=638`})
        i.reply({embeds: [banEmbed]});
      } catch (error) {
        return error;
      }
    }

    static async lock(client, i, u, c, r) {
      try {
        c.permissionOverwrites.set([
          {
            id: i.guild.id,
            deny: PermissionsBitField.Flags.SendMessages
          }
        ])
        const lockedEmbed = new EmbedBuilder()
        .setTitle(`Channel Locked`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`**Reason:** ${r}`)
        c.send({embeds: [lockedEmbed]})
      } catch (err) {
        return err;
      }
    }

    static async unlock(client, i, u, c, r) {
      try {
        c.permissionOverwrites.set([
          {
            id: i.guild.id,
            allow: PermissionsBitField.Flags.SendMessages
          }
        ])
        const unlockedEmbed = new EmbedBuilder()
        .setTitle(`Channel Unlocked`)
        .setColor(client.config.customization.embedColor)
        c.send({embeds: [unlockedEmbed]})
      } catch (err) {
        return err;
      }
    }

    static async cases(client, i, user, typ, val) {
      try {
      let curPage=1, maxPage;
      const data = await client.data.getModerations(i.guild, typ, val)
      maxPage = Math.ceil(Number(data.length)/5);
      const responseEmbed = new EmbedBuilder()
      .setTitle('Search results')
      .setColor(client.config.customization.embedColor)

      const prevButton = new ButtonBuilder()
            .setCustomId('prevPage')
            .setEmoji({
                name: 'tts_left_arrow',
                id: '1194338492772270152',
           })
            .setStyle(ButtonStyle.Primary);
    
        const currentPageButton = new ButtonBuilder()
            .setCustomId('currentPage')
            .setLabel(`Page 1 / ${maxPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);
    
        const nextButton = new ButtonBuilder()
            .setCustomId('nextPage')
            .setEmoji({
                name: 'tts_right_arrow',
                id: '1194338413441191976',
           })
            .setStyle(ButtonStyle.Primary);
    
        const row = new ActionRowBuilder()
            .addComponents(prevButton, currentPageButton, nextButton);

      if (data.length === 0) {
        responseEmbed.setDescription(`No logs were found.`)
      }
      const selecData = Object.keys(data).slice(-4+curPage*5,curPage*5).map(key => data[key]);
      selecData.forEach(log => {
        const caseId = log.case
        const targetId = log.target
        const type = log.type
        const moderatorId = log.moderator
        const time = log.time

        responseEmbed.addFields({name: `${type.charAt(0).toUpperCase() + type.slice(1)} - Case ${caseId}`, value: `<:size:1235655774022139964>**Case:** \`${caseId}\` \n<:moderation:1233486994911395942>**Type:** \`${type.charAt(0).toUpperCase() + type.slice(1)}\` \n<:target:1233487058585260205>**Target:** <@${targetId}> \n<:staff:1233486987433087148>**Moderator:** <@${moderatorId}> \n<:time:1235655785204285500>**Time:** <t:${Math.floor(time/1000)}>`});
      })
      i.reply({embeds: [responseEmbed], components: [row]})
      .then(msg => {
        const filter = (interaction) => { 
          if (interaction.isButton() && interaction.message.interaction) {
            return interaction.isButton() && interaction.message.interaction.id === msg.interaction.id && interaction.user.id === user.id;
          } else {
            return interaction.isButton() && interaction.message.id === msg.id && interaction.user.id === user.id;
          }
        };
          const collector = i.channel.createMessageComponentCollector({ filter, time: 60000 });     
          collector.on('collect', (interaction) => {
            if (interaction.customId === 'prevPage') {
              curPage--
              if (curPage === 0) {
                curPage = maxPage
              }
              const selecData = Object.keys(data).slice(-4+curPage*5,curPage*5).map(key => data[key]);
              const allEmbeds = interaction.message.embeds;
              const oldEmbed = allEmbeds[0];
              const newEmbed = new EmbedBuilder()
              .setColor(client.config.customization.embedColor)
              .setTitle(oldEmbed.title)
              .setDescription(oldEmbed.description)
              .setFooter(oldEmbed.footer)
              .setThumbnail(oldEmbed.thumbnail)
              .setImage(oldEmbed.image)
              .setAuthor(oldEmbed.author)
              selecData.forEach(log => {
                const caseId = log.case
                const targetId = log.target
                const type = log.type
                const moderatorId = log.moderator
                const time = log.time
        
                newEmbed.addFields({name: `${type.charAt(0).toUpperCase() + type.slice(1)} - Case ${caseId}`, value: `<:size:1235655774022139964>**Case:** \`${caseId}\` \n<:moderation:1233486994911395942>**Type:** \`${type.charAt(0).toUpperCase() + type.slice(1)}\` \n<:target:1233487058585260205>**Target:** <@${targetId}> \n<:staff:1233486987433087148>**Moderator:** <@${moderatorId}> \n<:time:1235655785204285500>**Time:** <t:${Math.floor(time/1000)}>`});
              })
              row.components[1].setLabel(`Page ${curPage} / ${maxPage}`);
              interaction.message.edit({embeds: [newEmbed], components: [row]});
              interaction.deferUpdate();
            } else if (interaction.customId === 'nextPage') {
              curPage++
              if (curPage > maxPage) {
                curPage = 1
              }
              const selecData = Object.keys(data).slice(-4+curPage*5,curPage*5).map(key => data[key]);
              const allEmbeds = interaction.message.embeds;
              const oldEmbed = allEmbeds[0];
              const newEmbed = new EmbedBuilder()
              .setColor(client.config.customization.embedColor)
              .setTitle(oldEmbed.title)
              .setDescription(oldEmbed.description)
              .setFooter(oldEmbed.footer)
              .setThumbnail(oldEmbed.thumbnail)
              .setImage(oldEmbed.image)
              .setAuthor(oldEmbed.author)
              selecData.forEach(log => {
                const caseId = log.case
                const targetId = log.target
                const type = log.type
                const moderatorId = log.moderator
                const time = log.time
                
                newEmbed.addFields({name: `${type.charAt(0).toUpperCase() + type.slice(1)} - Case ${caseId}`, value: `<:size:1235655774022139964>**Case:** \`${caseId}\` \n<:moderation:1233486994911395942>**Type:** \`${type.charAt(0).toUpperCase() + type.slice(1)}\` \n<:target:1233487058585260205>**Target:** <@${targetId}> \n<:staff:1233486987433087148>**Moderator:** <@${moderatorId}> \n<:time:1235655785204285500>**Time:** <t:${Math.floor(time/1000)}>`});
              })
              row.components[1].setLabel(`Page ${curPage} / ${maxPage}`);
              interaction.message.edit({embeds: [newEmbed], components: [row]});
              interaction.deferUpdate();
            }
          })
          collector.on('end', () => {
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
          page = 0
        }
        let found = false;
        if (args[0] && !(args[0].length <= 2)) {
          const data = await client.data.getGuildSettings(interaction.guild)
          findKey(data, args);
          function findKey(obj, args) {
            for (const key in obj) {
              if (Array.isArray(obj[key]) && args[0] === key) {
                obj[key].push(args[1]);
                found = true
                interaction.reply(`Changed the ${key} to ${obj[key]}`)
              } else if (obj[key] instanceof Object && obj[key] !== null) {
                findKey(obj[key], args);
              } else if (args[0] === key) {
                obj[key] = args[1];  
                found = true
                interaction.reply(`Changed the ${key} to ${obj[key]}`)
              }
            }
          }
          if (!found) {
            interaction.reply(`Could not find \`${args[0]}\``)
          }
          client.data.setGuildSettings(interaction.guild, data)
          return;
        }
        const data = await client.data.getGuildSettings(interaction.guild)
        const configEmbed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name}'s configurations`)
        .setColor(client.config.customization.embedColor)

        let pages=[];
        for (const category in data) {
          pages.push(category)
        }
        for (const settingName in data[pages[page]]) {
          const setting = data[pages[page]][settingName];
          if (Array.isArray(setting)) {
            let items;
            items = setting.join(", ")
            if (items.length <= 2) {
              items = "None"
            }
            configEmbed.addFields({ name: `${settingName}`, value: `${items}` });
          } else if (setting instanceof Object) {
            let sSet="";
            for (const subSettingName in setting) {
              const subSetting = setting[subSettingName];
              sSet = `${sSet}\n${subSettingName}: ${subSetting}`;
            }
            configEmbed.addFields({name: `${settingName}`, value: `${sSet}`})
          } else {
            configEmbed.addFields({name: `${settingName}`, value: `${setting}`})
          }
        }
        page++
        const sentEmbed = await interaction.reply({content: `${JSON.stringify(data)}`, embeds: [configEmbed]});
      } catch (err) {return err;}
    }
}
