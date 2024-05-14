const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'untimeout',
  description: 'Get the bot\'s latency stats',
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
    const embedPing = new EmbedBuilder()
    .setTitle('Hexalon latency')
    .setColor(client.config.customization.embedColor)
    .setDescription(`Pong! 🏓 \nCommand latency is ${Date.now() - interaction.createdTimestamp}ms. \nAPI latency is ${Math.round(client.ws.ping)}ms.`)
    .setTimestamp();
      interaction.reply({embeds: [embedPing]});
    } catch (error) {
      throw error;
    }
  }
}