const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'config',
  description: 'Get the config of this server',
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      const err = await client.manager.config(client, interaction, interaction.user, args)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}