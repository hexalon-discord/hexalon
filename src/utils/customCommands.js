const { EmbedBuilder } = require("discord.js")

module.exports = class CustomCommands {
  static executeCC(c, msg, ccd, cb) {
    console.log("recieved")
    try {
      console.log("start")
      const ignoredChannels = ccd.ignore.channels
      const ignoredRoles = ccd.ignore.roles
      ignoredChannels.forEach(channelId => {
        if (channelId === msg.channel.id) {
          return;
        }
      });
      ignoredRoles.forEach(roleId => {
        if (msg.author.roles.cache.has(roleId)) {
          return;
        }
      });
      console.log("not ignored")
      const requiredChannels = ccd.require.channels
      const requiredRoles = ccd.require.roles
      if (!requiredChannels === undefined) {
        requiredChannels.forEach(channelId => {
          if (channelId === msg.channel.id) {
           return;
          }
        });
      }
      if (!requiredRoles === undefined) {
        requiredRoles.forEach(roleId => {
          if (msg.author.roles.cache.has(roleId)) {
            return;
          }
        });
      }
      console.log("met requirements")
      if (ccd.delete_trigger) {
        msg.delete()
        console.log("deleted trigger")
      }
      const embed = new EmbedBuilder()
      console.log("making embed", embed)
      if (ccd.embed.color !== null){embed.setColor(ccd.embed.color)};
      if (ccd.embed.title !== null){embed.setTitle(ccd.embed.title)};
      if (ccd.embed.url !== null){embed.setURL(ccd.embed.url)};
      if (ccd.embed.author.name !== null){embed.setAuthor({name: ccd.embed.author.name, iconURL: ccd.embed.author.icon, url: ccd.embed.author.url})};
      if (ccd.embed.description !== null){embed.setDescription(ccd.embed.description)};
      if (ccd.embed.fields && ccd.embed.fields[0].name !== null) {
        ccd.embed.fields.forEach(field => {
          if (field.name !== null) {
            embed.addFields({ name: field.name, value: field.value, inline: field.inline });
          }
        });
      }
      if (ccd.embed.thumbnail !== null){embed.setThumbnail(ccd.embed.thumbnail)};
      if (ccd.embed.image !== null){embed.setImage(ccd.embed.image)};
      if (ccd.embed.footer.text !== null){embed.setFooter({text: ccd.embed.footer.text, iconURL: ccd.embed.footer.icon})};
      if (ccd.embed.timestamp !== false){embed.setTimestamp()};
      if (ccd.reply.dreply) {
        if (embed.data.size !== 0) {
          msg.reply({content: ccd.message.content, embeds: [embed]});
        } else {
          msg.reply({content: ccd.message.content});
        };
        console.log("replied")
      } else {
        if (embed.data.size !== 0) {
          msg.channel.send({content: ccd.message.content, embeds: [embed]});
        } else {
          msg.channel.send({content: ccd.message.content});
        };
      }
      cb(200)
    } catch (err) {
      cb(err);
    }
  }
}