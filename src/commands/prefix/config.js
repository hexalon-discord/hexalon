const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'config',
  aliases: ['c'],
  description: 'Change the configurations of the bot',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      await client.manager.config(client, message, message.user, args)
    } catch (error) {
      throw error;
    }
  }
}