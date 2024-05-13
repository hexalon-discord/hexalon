const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'ping',
  aliases: ['latency'],
  description: 'Get the bot\'s latency stats',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      const err = await client.manager.ping(client, message)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}