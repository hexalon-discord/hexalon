const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: 'warn',
  aliases: ['warning'],
  description: 'Warn a server member',
  staffOnly: false,
  debugType: true,
  callback: async (message, args, client, prefix, debug) => {
    try {
      const noPermEmbed = new EmbedBuilder()
      .setTitle('Insufficient permissions')
      .setColor(client.config.customization.embedColor)
      .setDescription('You do not have enough permissions to run this command. You need the server mod role or ban permissions.')
      if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers) && !message.member.roles.cache.has(client.manager.getConfigModRole(client, message.guild.id))) {
        return message.reply({embeds: [noPermEmbed]})
      }
      let reason = args.slice(1).join(' ') || "No reason provided.";
      let user;
      if (message.mentions.users.size > 0) {
        const Suser = message.mentions.users.first();
        user = Suser.id;
      } else {
        const userId = args[0];
        if (!client.users.cache.get(userId) === undefined) {
          user = args[0];
        } else {
          const noSelfEmbed = new EmbedBuilder()
          .setTitle("Wrong arguments")
          .setColor(client.config.customization.embedColor)
          .setDescription(`You did not provide all required arguments, correct syntax: \`\`\`!warn <user> <reason (optional)>\`\`\``)
          message.reply({embeds: [noSelfEmbed]});
          return;
        }
      }
      const err =await client.manager.warn(client, message, user, message.author, reason)
      if (err instanceof Error) {
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }
}