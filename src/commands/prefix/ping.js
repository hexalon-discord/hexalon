const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'ping',
  aliases: ['latency'],
  description: 'Get the bot\'s latency stats',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      client.manager.ping(client, message)
    } catch (error) {
      throw error;
    }
  }
}