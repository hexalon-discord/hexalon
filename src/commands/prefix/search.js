const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');

module.exports = {
  name: 'search',
  aliases: [''],
  description: 'Search moderations',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      const type = args[0]
      const value = args[1]
      if (!(args[0] === "case" || "moderator" || "type")) {
        message.reply(`Please use one of the following arguments \`case\`, \`moderator\` or \`type\``)
        return;
      }
      const data = await client.data.getModerations(message.guild, type, value)
      const responseEmbed = new EmbedBuilder()
      .setTitle('Search results')
      .setColor(client.config.customization.embedColor)

      if (data.length === 0) {
        responseEmbed.setDescription(`No logs were found.`)
      }
      await data.forEach(log => {
        const caseId = log.case
        const targetId = log.target
        const type = log.type
        const moderatorId = log.moderator
        const time = log.time

        responseEmbed.addFields({name: caseId, value: `Case: ${caseId} \nType: ${type} \nTarget: <@${targetId}> \nModerator: <@${moderatorId}> \nTime: <t:${time}>`});
      })
      message.reply({embeds: [responseEmbed]});
      console.log(data)
    } catch (error) {
      throw error;
    }
  }
}