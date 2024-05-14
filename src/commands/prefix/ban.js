const { EmbedBuilder, PermissionsBitField, DiscordAPIError, DiscordjsError } = require("discord.js");

module.exports = {
  name: 'ban',
  aliases: [],
  description: 'Ban someone',
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
      let user;
      try {
        user = await message.guild.members.fetch(v)
      } catch (err) {
        message.reply("This user is not in this server");
        return;
      }
      if (!args[1]) {
        r = "No reason provided.";
      } else {
        r = args.slice(1).join(' ');
      }
      const err = await client.manager.ban(client, message, message.author, user, r, false);
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}