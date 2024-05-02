const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');

module.exports = {
  name: 'search',
  aliases: [''],
  description: 'Search moderations',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      const type = args[0]
      const value = args[1]
      if (!(args[0] === "case" || "moderator" || "type")) {
        message.reply(`Please use one of the following arguments \`case\`, \`moderator\` or \`type\``)
        return;
      }
      const data = await client.data.getModerations(message.guild, type, value)
      message.reply(`${JSON.stringify(data)}`)
      console.log(data)
    } catch (error) {
      throw error;
    }
  }
}