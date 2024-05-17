const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'warn',
  description: 'Warn a servermember',
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      const noPermEmbed = new EmbedBuilder()
      .setTitle('Insufficient permissions')
      .setColor(client.config.customization.embedColor)
      .setDescription('You do not have enough permissions to run this command. You need the server mod role or ban permissions.')
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers) && !interaction.member.roles.cache.has(client.manager.getConfigModRole(client, interaction.guild.id))) {
        return interaction.reply({embeds: [noPermEmbed]})
      }
      const r = interaction.options.getChannel('reason') || "No reason provided."
      const v = interaction.options.getUser('user').id
      if (v = interaction.user.id) {
        const noSelfEmbed = new EmbedBuilder()
        .setTitle("Wrong arguments")
        .setColor(client.config.customization.embedColor)
        .setDescription(`You did not provide all required arguments, correct syntax: \`\`\`!warn <user> <reason (optional)>\`\`\``)
        interaction.reply({embeds: [noSelfEmbed]});
        return;
      };
      const err =await client.manager.warn(client, interaction, v, interaction.user, r)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}