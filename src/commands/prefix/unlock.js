const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'unlock',
  aliases: [],
  description: 'Unlock a locked channel',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
        let cId
        if (args[0].startsWith("<#")) {
            cId = args[0].match(/\d+/g);
        } else {
            cId = args[0]
        }
        if ((isNaN(cId))) {
            message.reply(`Please provide a valid channel or channelId`)
        }
        const channel = await client.channels.fetch(cId)

        args.splice(0,1)
        const reason = args.join(" ") || "No reason provided."
      const err = await client.manager.unlock(client, message, message.user, channel, reason)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}