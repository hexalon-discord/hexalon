const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'ping',
  description: 'Get the bot\'s latency stats',
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      const err = await client.manager.ping(client, interaction)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}