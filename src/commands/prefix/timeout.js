const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'timeout',
  aliases: ['mute'],
  description: 'Time someone out',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
        let v, d, r;
        if (args[0].startsWith("<@")) {
            v = args[0].match(/\d+/g);
        } else if (!isNaN(args[0])) {
            v = `${args[0]}`;
        } else {
            message.reply("Please provide a valid user");
        }
        console.log(v);
        const user = await message.guild.members.fetch(v);
        if (!user) {
            message.reply("Please provide a valid user");
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
      await client.manager.mute(client, message, message.author, user, d, r)
    } catch (error) {
      throw error;
    }
  }
}