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
      const data = await client.data.makeModeration(message.guild, user, "warn", message.author.id, reason)
      const total = data.total
      const caseNum = data.case
      const warnedEmbed = new EmbedBuilder()
      .setTitle(`Warning overview`)
      .setColor(client.config.customization.embedColor)
      .setDescription(`You have warned <@${user}> for the following reason: ${reason}. \nThey now have ${total} moderations in this server. \nCase: ${caseNum}`)
      message.reply({embeds: [warnedEmbed]});
      let dmEmbed = new EmbedBuilder()
      .setTitle(`You have been warned in ${message.guild.name}`)
      .setColor(client.config.customization.embedColor)
      .setDescription(`You have been warned by <@${message.author.id}> in ${message.guild.name} for the following reason: ${reason} \nYou now have ${total} warnings.`)
      .setFooter({text: 'Hexalon', iconURL: client.user.displayAvatarURL({ format: 'png', size: 2048 })})
      let dmChannel = await client.users.createDM(user);
      dmChannel.send({embeds: [dmEmbed]});
    } catch(err) {
      throw err
    }
  }
}