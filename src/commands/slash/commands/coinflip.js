const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'coinflip',
  description: 'Do a coinflip',
  staffOnly: false,
  category: "public",
  callback: async (client, interaction, prefix) => {
    try {
    client.manager.coinflip(client, interaction.channel, interaction.user.id, interaction.guild, interaction)
  } catch (error) {
    throw (error)
  }
  }
}