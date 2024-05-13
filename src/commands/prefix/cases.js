const { GuildMember, EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const { isNumberObject } = require("util/types");

module.exports = {
  name: 'cases',
  aliases: [''],
  description: 'Search cases',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      if (!args[0]) {
        return;
      }
      if (!(!isNaN(args[0]) || args[0].startsWith("<@") || args[0] === "?m" || args[0] === "?t")) {
        message.reply(`Please use one of the following methods:\n!cases \`<caseNumber>\`\n!cases \`<userid>\`\n!cases \`<mention>\`\n!cases \`?m <moderator>\`\n!cases \`?t <type>\``)
        return;
      }
      let type, value;
      const allModer = await client.data.getTotalModerations(message.guild) + 1
      if (!(isNaN(args[0]))) {
        // cases with case number or userid
        if (args[0] <= allModer) {
          // number
          type = "case"
          value = args[0]
        } else {
          // userid
          type = "target"
          value = args[0]
        }       
      } else if (args[0].startsWith("<@")) {
        // cases with mention
        const user = args[0].match(/\d+/g);
        type = "target"
        value = user
      } else if (args[0] === "?m" ) {
        // cases with modertor id
        if (args[1] instanceof Number) {
          type = "moderator"
          value = args[1]
        } else {
          const user = args[1].match(/\d+/g);
          type = "moderator"
          value = user
        }
      } else if (args[0] === "?t") {
        // cases with type
        type = "type"
        value = args[1].toLowerCase()
      } else {
        return;
      }
      const err = await client.manager.cases(client, message, message.author, type, value)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}