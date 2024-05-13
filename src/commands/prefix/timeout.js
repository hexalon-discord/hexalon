const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'timeout',
  aliases: ['mute'],
  description: 'Time someone out',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
        let v, u, d, r;
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
            const typeTime = args[1].toLowerCase()
            const numberTime = args[1].slice(0, -1);
            if (typeTime.endsWith("d")) {
                d = Number(`${numberTime}`) * 86400000
            } else if (typeTime.endsWith("h")) {
                d = Number(`${numberTime}`) * 3600000
            } else if (typeTime.endsWith("m")) {
                d = Number(`${numberTime}`) * 60000
            } else if (typeTime.endsWith("s")) {
                d = Number(`${numberTime}`) * 1000
            } else {
                d = Number(`${numberTime}`)
            }
        }
        if (d > 2.4192E+9) {
            message.reply("Please choose a smaller value");
            return;
        }
        args.splice(0,2)
        if (!args[2]) {
            r = "No reason provided.";
        } else {
            r = `${args.join(" ")}`;
        }
      const err = await client.manager.mute(client, message, message.author, user, d, r)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}