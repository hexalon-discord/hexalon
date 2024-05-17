const { ApplicationCommandOptionType, DiscordAPIError } = require("discord.js");

module.exports = {
  name: 'ban',
  description: 'Ban a user from the server',
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
    {
      name: 'hack-ban',
      description: 'Whether to ban this user if they\'re NOT in the server',
      required: false,
      type: ApplicationCommandOptionType.Boolean,
    }
  ],
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      let v, u, d, h;
      if (interaction.options.getBoolean('hack-ban')) {
        u = interaction.options.getUser('user')
        try {
          if (await interaction.guild.members.fetch(u.id)) {
            interaction.reply("user in the server")
            return;
          }
        } catch (err) {
          if (!(err instanceof DiscordAPIError && err.code === 10007)) {
            throw err;
          }
        }
        h = true
      } else {
        v = interaction.options.getUser('user')
        try {
          u = await interaction.guild.members.fetch(v.id)
        } catch (err) {
          if (err instanceof DiscordAPIError && err.code === 10007) {
            interaction.reply("user is not in the server")
            return;
          }
        }
        h = false
      }
      let r = interaction.options.getString('reason') || "No reason provided.";
      const err = await client.manager.ban(client, interaction, interaction.user, u, r, h);
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
};