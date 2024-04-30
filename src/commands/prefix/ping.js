const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'ping',
  aliases: ['latency'],
  description: 'Get the bot\'s latency stats',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
    const embedPing = new EmbedBuilder()
    .setTitle('Hexalon latency')
    .setColor(client.config.customization.embedColor)
    .setDescription(`Pong! 🏓 \nCommand latency is ${Date.now() - message.createdTimestamp}ms. \nAPI latency is ${Math.round(client.ws.ping)}ms.`)
      message.reply({embeds: [embedPing]});
    } catch (error) {
      throw error;
    }
  }
}