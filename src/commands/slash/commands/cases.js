const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'cases',
  description: 'Search for moderation cases',
  options: [
    {
      name: 'case-number',
      description: 'The number of the case you\'re trying to search for',
      required: false,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: 'member',
      description: 'The cases of this member',
      required: false,
      type: ApplicationCommandOptionType.Mentionable,
    },    
    {
      name: 'moderator',
      description: 'The cases of this moderator',
      required: false,
      type: ApplicationCommandOptionType.Mentionable,
    },    {
      name: 'type',
      description: 'The type of moderation you want to search for',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
  ],
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      if (interaction.options.getMember('member') === null && interaction.options.getMember('moderator') === null && interaction.options.getNumber('case-number') === null && interaction.options.getString('type') === null) {
        interaction.reply('You must provide a method to search')
        return;
      }
      let v, t;
      if (!(interaction.options.getMember('member') === null)) {
        v = interaction.options.getMember('member').user.id
        t = "target"
      } else if (!(interaction.options.getMember('moderator') === null)) {
        v = interaction.options.getMember('moderator').user.id
        t = "moderator"
      } else if (!(interaction.options.getNumber('case-number') === null)) {
        v = interaction.options.getNumber('case-number') 
        t = "case"
      } else if (!(interaction.options.getString('type') === null)) {
        v = interaction.options.getString('type').toLowerCase()
        if (!(v === "ban" || v.toLowerCase() === "kick" || v.toLowerCase() === "mute" || v.toLowerCase() === "unmute" || v.toLowerCase() === "unban" || v.toLowerCase() === "warn")) {
          interaction.reply("Please provide a valid type of moderation")
          return;
        }
        t = "type"
      }
      const err = await client.manager.cases(client, interaction, interaction.user, t, v)
      if (err instanceof Error) {
        throw err;
      }
    } catch (error) {
      throw error;
    }
  }
}