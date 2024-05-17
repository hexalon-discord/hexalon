const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'purge',
  description: 'Bulk delete messages',
  options: [
    {
      name: 'count',
      description: 'The amount of message to delete',
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
    {
      name: 'channel',
      description: 'The channel to delete messages in',
      required: false,
      type: ApplicationCommandOptionType.Channel,
    }, 
  ],
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {    
      const count = interaction.options.getNumber('count')
      if (!( 1 <= count && 100 >= count )) {
        interaction.reply("Please provide a message count between 1 and 100.");
          return;
      }
      let channel
      if (interaction.options.getChannel('channel') === null) {
        channel = false
      } else {
        channel = interaction.options.getChannel('channel')
      }
    const err = await client.manager.purge(client, interaction, interaction.user, count, channel)
    if (err instanceof Error) {
      return err;
    }
  } catch (err) {
    return err;
  }
}
}