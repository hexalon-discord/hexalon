const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'customcommand',
  aliases: ['cc'],
  description: 'Create, edit or list Customcommands',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      const err = await client.manager.customcommand(client, message, message.author)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}