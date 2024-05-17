const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'unban',
  description: 'Unban a server member',
  options: [
    {
      name: 'user',
      description: 'The user you\'re trying to ban',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'reason',
      description: 'Reason for the ban',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      let v = interaction.options.getUser('user').id
      let r = interaction.options.getString('reason') || "No reason provided.";

      const banList = await interaction.guild.bans.fetch();
      if (banList.size <1) {
        interaction.reply("Did not find any bans");
        return;
      }
      const obj = banList.find(entry => entry.user.id === v);
      const user = obj.user;
      if (!user) {
        interaction.reply("This user is not banned");
        return;
      }
      const err = await client.manager.unban(client, interaction, interaction.user, user, r);
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}