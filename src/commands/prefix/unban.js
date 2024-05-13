const { EmbedBuilder, PermissionsBitField, DiscordAPIError, DiscordjsError } = require("discord.js");

module.exports = {
  name: 'unban',
  aliases: [],
  description: 'Unban someone',
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
      if (!args[1]) {
        r = "No reason provided.";
      } else {
        r = args.slice(1).join(' ');
      }

      const banList = await message.guild.bans.fetch();
      if (banList.size <1) {
        message.reply("Did not find any bans");
        return;
      }
      const obj = banList.find(entry => entry.user.id === v);
      const user = obj.user;
      if (!user) {
        message.reply("This user is not banned");
        return;
      }
      const err = await client.manager.unban(client, message, message.author, user, r);
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}