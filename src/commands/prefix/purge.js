const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'purge',
  aliases: [],
  description: 'Bulk delete messages in a channel',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {    
        if ((isNaN(args[0]))) {
            message.reply("Please provide a valid message count.");
            return;
        }
        const count = Number(args[0])
        if (!( 1 <= count && 100 >= count )) {
            message.reply("Please provide a message count between 1 and 100.");
            return;
        }
        message.delete()
      const err = await client.manager.purge(client, message, message.author, count)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}