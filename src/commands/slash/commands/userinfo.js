const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");
const Guilds = require("../../../models/Guilds");

module.exports = {
  name: 'userinfo',
  description: 'Get information about a user',
  options: [
    {
        name: 'user',
        description: 'The user you want to get information about',
        required: true,
        type: ApplicationCommandOptionType.User,
    }],
  staffOnly: false,
  category: "public",
  callback: async (client, interaction, prefix) => {
    try {
    const target = interaction.options.getMember('user')
    client.manager.userinfo(client, interaction.channel, interaction.user.id, interaction.guild, target, interaction)
  } catch (error) {
    throw (error)
  }
  }
}