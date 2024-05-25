const { EmbedBuilder } = require("discord.js");

module.exports = class CustomCommands {
  static async executeCC(c, msg, ccd, cb) {
    try {
      if (ccd.enabled === false) {
        return;
      }
      const ignoredChannels = ccd.ignore.channels;
      const ignoredRoles = ccd.ignore.roles;
      ignoredChannels.forEach((channelId) => {
        if (channelId === msg.channel.id) {
          return;
        }
      });
      ignoredRoles.forEach((roleId) => {
        if (msg.member.roles.cache.has(roleId)) {
          return;
        }
      });
      const requiredChannels = ccd.require.channels;
      const requiredRoles = ccd.require.roles;
      if (!requiredChannels === undefined) {
        requiredChannels.forEach((channelId) => {
          if (channelId === msg.channel.id) {
            return;
          }
        });
      }
      if (!requiredRoles === undefined) {
        requiredRoles.forEach((roleId) => {
          if (msg.author.roles.cache.has(roleId)) {
            return;
          }
        });
      }
      if (ccd.delete_trigger) {
        msg.delete();
      }
      let embed;
      if (ccd.embed.description !== null) {
        embed = new EmbedBuilder();
        if (ccd.embed.color) embed.setColor(ccd.embed.color);
        if (ccd.embed.title) embed.setTitle(ccd.embed.title);
        if (ccd.embed.url) embed.setURL(ccd.embed.url);
        if (ccd.embed.author) {
          embed.setAuthor({
            name: ccd.embed.author.name,
            iconURL: ccd.embed.author.icon,
            url: ccd.embed.author.url,
          });
        }
        if (ccd.embed.description) embed.setDescription(ccd.embed.description);
        if (ccd.embed.fields && ccd.embed.fields.length > 0) {
          ccd.embed.fields.forEach((field) => {
            if (field.name) {
              embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline,
              });
            }
          });
        }
        if (ccd.embed.thumbnail) embed.setThumbnail(ccd.embed.thumbnail.url);
        if (ccd.embed.image) embed.setImage(ccd.embed.image.url);
        if (ccd.embed.footer && ccd.embed.footer.text) {
          embed.setFooter({
            text: ccd.embed.footer.text,
            iconURL: ccd.embed.footer.icon,
          });
        }
        if (ccd.embed.timestamp !== false) embed.setTimestamp();
      }
      if (ccd.reply.dreply) {
        if (embed.data.description != null) {
          msg.reply({ content: ccd.message.content, embeds: [embed] });
        } else {
          msg.reply({ content: ccd.message.content });
        }
      } else if (!ccd.reply.channel !== msg.channel.id) {
        const channel = await msg.guild.channels.fetch(ccd.reply.channel);
        if (embed.data.description != null) {
          channel.send({ content: ccd.message.content, embeds: [embed] });
        } else {
          channel.send({ content: ccd.message.content });
        }
      } else {
        if (embed.data.description != null) {
          msg.channel.send({ content: ccd.message.content, embeds: [embed] });
        } else {
          msg.channel.send({ content: ccd.message.content });
        }
      }
    } catch (err) {
      cb(err);
    }
  }
};
