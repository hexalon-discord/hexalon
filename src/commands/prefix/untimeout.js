const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'untimeout',
  aliases: ['unmute'],
  description: 'Untime someone out',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
        let v, u, r;
        if (args[0].startsWith("<@")) {
            u = args[0].match(/\d+/g);
            v = `${u[0]}`
        } else if (!isNaN(args[0])) {
            v = `${args[0]}`;
        } else {
            message.reply("Please provide a valid user");
            return;
        }
        const user = await message.guild.members.fetch(v);
        if (!user) {
            message.reply("Please provide a valid user");
            return;
        }
        if (!args[1]) {
            d = 1800000; //30mins
        } else {
            d = Number(`${args[1]}`);
        }
        if (!args[2]) {
            r = "No reason provided.";
        } else {
            r = args[2];
        }
      const err = await client.manager.unmute(client, message, message.author, user, r)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}