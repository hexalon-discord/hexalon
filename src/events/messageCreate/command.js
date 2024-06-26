const { EmbedBuilder, DiscordAPIError } = require("discord.js");
const bugsy = require('bugsy');
const config = require('../../config/config');
const dotenv = require('dotenv');
const fs = require('fs')
const path = require('path')

module.exports = async (client, message) => {

    const Bugsy = new bugsy.Client(client, {
        aliases: ['bugsy', 'bgy'], // Customizable aliases
        prefix: ">",
        owners: config.main.owner,
    });

    await Bugsy.run(message);

    if (message.author.bot) return;

    const prefix = client.config.main.prefix
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|!)\\s*`);
    if (!prefixRegex.test(message.content)) return;
    const [matchedPrefix] = message.content.match(prefixRegex);

    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return;

    if (command.staffOnly === true) {
      const noPermEmbed = new EmbedBuilder()
      .setTitle('Insufficent permissions')
      .setAuthor({name: message.guild.name, iconURL: message.guild.iconURL({ format: 'png', size: 2048 })})
      .setColor(client.config.customization.embedColor)
      .setDescription(`You do not have enough permissions to run this command, if you think this was a mistake please contact the server admin.`)
      .setFooter({text: `${client.config.branding.name}`, iconURL: client.user.displayAvatarURL({ format: 'png', size: 2048 })})
      if (
        !client.config.main.owner === message.member.user.id
      ) {
        return message.reply({ embeds: [noPermEmbed]});
    }};

    try {
        await command.callback(message, args, client, prefix, false)
    } catch (error) {

      // ===================== Check for certain errors ===================== //
      if (error instanceof DiscordAPIError && error.code === 50007) {
        return;
      }

      let errorid = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      const length = 8
      let counter = 0;
      while (counter < length) {
        errorid += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      const errorMessage = error.toString().replace(/^Error: /, '');
      const errorEmbed = new EmbedBuilder()
      .setAuthor({name: `The bot raised an error`, iconURL: 'https://cdn.discordapp.com/emojis/1232696750339522620.webp?size=60&quality=lossless'})
      .setColor(client.config.customization.embedColor)
      .setDescription(`The \`${command.name}\` command raised an error.\nJoin the [Hexalon Support](https://www.discord.gg/EdKqfrnZTg) server for details.\n**Error id**\n<:down_right:1194345511365390356>\`${errorid}\``)
      const directory = 'src/data/logs/';
      const fileName = `err_${errorid}.json`;
      const filePath = path.join(directory, fileName);
      const fileData = {
        errorData: {
          type: `${error.name}`,
          error: `${error.stack}`,
          time: `${message.createdTimestamp}`
        },
        commandData: {
          command: `${command.name} (Prefix)`,
          channelId: `${message.channel.id}`,
          userId: `${message.author.id}`,
          guildId:`${message.guild.id}`,
        }
      }
      fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          client.logger.error(`An error ocurred while creating the file: ${err}`);
            return;
        }
    });
      
      if (message.replied) {
        await message
          .editReply({
            embeds: [errorEmbed],
          })
          .catch(() => {});
      } else {
        await message
          .reply({
            embeds: [errorEmbed],
          })
          .catch(() => {});
      }
    };
}