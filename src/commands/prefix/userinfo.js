const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'userinfo',
  aliases: ['whois'],
  description: 'Get information about a user',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
    let target;
    if (!args[0]) {
      args = ""
    }
    if (message.mentions.members.size > 0) {
      target = message.mentions.members.first();
    } else if (args) {
      target = message.guild.members.cache.find(member => member.id === args[0] ||  member.id === args);     
    } else {
      target = message.guild.members.cache.find(member => member.id === message.author.id);
    }
    await client.manager.userinfo(client, message.channel, message.author.id, message.guild, target, message)
  } catch (error) {
    throw (error)
  }
  }
}