const { EmbedBuilder, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

module.exports = {
  name: 'unlock',
  description: 'Unlock a channel',
  options: [
    {
      name: 'channel',
      description: 'The channel(s) you want to unlock',
      required: true,
      type: ApplicationCommandOptionType.Channel,
    },
    {
      name: 'reason',
      description: 'The reason that should be displayed',
      required: false,
      type: ApplicationCommandOptionType.String,
    }, 
  ],
  staffOnly: false,
  debugType: true,
  callback: async (client, interaction, prefix) => {
    try {
      let cId
      cId = interaction.options.getChannel('channel').id
      if ((isNaN(cId))) {
          interaction.reply(`Please provide a valid channel or channelId`)
      }
      const channel = await client.channels.fetch(cId)
      const reason = cId = interaction.options.getChannel('reason') || "No reason provided."
      const err =await client.manager.unlock(client, interaction, interaction.user, channel, reason)
      if (err instanceof Error) {
        throw err;
      }
    }   catch (err) {
      throw err;
    }
  }
}