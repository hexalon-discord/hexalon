const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'coinflip',
  aliases: ['cf'],
  description: 'Do a coinflip',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      await client.manager.coinflip(client, message.channel, message.author.id, message.guild, message, debug)
    } catch (error) {
      throw error;
    }
  }
}