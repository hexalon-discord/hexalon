const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'timeout',
  description: 'Time a server member out',
  options: [
    {
      name: 'user',
      description: 'The user to timeout',
      required: true,
      type: ApplicationCommandOptionType.User,
    },
    {
      name: 'duration',
      description: 'The duration of the timeout "30m", "3d", "10h" (defaults to 30 minutes)',
      required: false,
      type: ApplicationCommandOptionType.Number,
    }, 
    {
      name: 'reason',
      description: 'The reason for timing this person out',
      required: false,
      type: ApplicationCommandOptionType.String,
    }, 
  ],
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      const v = interaction.options.getMember('user').id
      const user = await interaction.guild.members.fetch(v);
      if (!user) {
        interaction.reply("Please provide a valid user");
          return;
      }
      let d = interaction.options.getNumber('duration')
      if (!d) {
          d = 1800000; //30mins
      } else {
          const typeTime = d
          const numberTime = d
          if (typeTime.endsWith("d")) {
            d = Number(`${numberTime}`) * 86400000
          } else if (typeTime.endsWith("h")) {
            d = Number(`${numberTime}`) * 3600000
          } else if (typeTime.endsWith("m")) {
            d = Number(`${numberTime}`) * 60000
          } else if (typeTime.endsWith("s")) {
            d = Number(`${numberTime}`) * 1000
          } else {
            interaction.reply("Please a valid date type");
          }
      }
      if (d > 2.4192E+9) {
        interaction.reply("Please choose a smaller value");
          return;
      }
      let r = interaction.options.getString('reason') || "No reason provided.";
    const err = await client.manager.mute(client, interaction, interaction.user, user, d, r)
    if (err instanceof Error) {
      throw err;
    }
  } catch (err) {
    throw err;
  }
}
}