const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'untimeout',
  description: 'Remove a timeout from a servermember',
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      let v = interaction.options.getUser('user').id
      const user = await interaction.guild.members.fetch(v);
      if (!user) {
        interaction.reply("Please provide a valid user");
          return;
      }
      const r = interaction.options.getString('reason') || "No reason provided."
      const err = await client.manager.unmute(client, interaction, interaction.user, user, r)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}