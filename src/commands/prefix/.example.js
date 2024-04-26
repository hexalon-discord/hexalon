const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Guilds = require("../../models/Guilds");

module.exports = {
  name: '..example..',
  aliases: ['..exmp..'],
  description: 'This is an example',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      //await client.manager.example(client, message.channel, message.author.id, message.guild, message, debug)
    } catch (error) {
      throw error;
    }
  }
}