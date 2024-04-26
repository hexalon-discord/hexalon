const { InteractionType, EmbedBuilder, DiscordAPIError } = require("discord.js");
const config_js = require('../../config/config')
const fs = require('fs')
const path = require('path')

module.exports = async (client, interaction) => {
    if (!interaction.type === InteractionType.ApplicationCommand) return;
    const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
    if (command.staffOnly === true) {
      const noPermEmbed = new EmbedBuilder()
      .setTitle('Insufficent permissions')
      .setAuthor({name: interaction.guild.name, iconURL: interaction.guild.iconURL({ format: 'png', size: 2048 })})
      .setColor(client.config.customization.embedColor)
      .setDescription(`You do not have enough permissions to run this command, if you think this was a mistake please contact the server admin.`)
      .setFooter({text: `${client.config.branding.name}`, iconURL: client.user.displayAvatarURL({ format: 'png', size: 2048 })})
      if (
        !interaction.member.roles.cache.some(role => config_js.ranks.staff.includes(role.id))
      ) {
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true});
    }};
    if (command.userPerms) {
      if (command.botPerms) {
        if (
          !interaction.guild.members.me.permissions.has(
          PermissionsBitField.resolve(command.botPerms || [])
          )
        ) {
          embed.setDescription(
          `I don't have **\`${
           command.botPerms
           }\`** permission in ${interaction.channel.toString()} to execute this **\`${
           command.name
           }\`** command.`
          );
        return interaction.reply({ embeds: [embed] });
        }
      }
      if (
        !interaction.member.permissions.has(
        PermissionsBitField.resolve(command.userPerms || [])
      )
      ) {
        embed.setDescription(
        `You don't have **\`${
          command.userPerms
        }\`** permission in ${interaction.channel.toString()} to execute this **\`${
          command.name
        }\`** command.`
      );
          return interaction.reply({ embeds: [embed] });
        }
    }
    try {
      const prefix = client.config.main.prefix;
      await command.callback(client, interaction, prefix)
    } catch (error) {

      // ===================== Check for certain errors ===================== //
      if (error instanceof DiscordAPIError && error.code === 50007) {
        return;
      }
      
      console.error(error)
      let errorid = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      const length = 10
      let counter = 0;
      while (counter < length) {
        errorid += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      const errorMessage = error.toString().replace(/^Error: /, '');
      const errorEmbed = new EmbedBuilder()
      .setTitle("Error Details")
      .setAuthor({name: `The bot expierenced an error`, iconURL: 'https://cdn.discordapp.com/emojis/1005002070782382162.webp?size=60&quality=lossless'})
      .setColor(client.config.customization.embedColor)
      .setDescription(`The \`${command.name}\` command raised an error:\n${errorMessage}\n\n**If this keeps to happening please contact <@872110981835268096>**\n<:down_right:1194345511365390356>**Error id:** \`${errorid}\``)
      .setFooter({text: `${client.config.branding.name}`, iconURL: client.user.displayAvatarURL({ format: 'png', size: 2048 })})
      .setTimestamp()

      function formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}-${minutes}-${day}-${month}`;
      }

      const currentDate = formatDate(new Date());
      const directory = 'src/data/logs/';
      const fileName = `${errorid}_${currentDate}.txt`;
      const filePath = path.join(directory, fileName);
      const fileContent = 
      `${error.stack}\nCommand: ${command.name} (Slash)\nChannelId: ${interaction.channel.id}\nUserId: ${interaction.user.id}\nGuildId: ${interaction.guild.id}`;
      
      fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error('An error occurred while creating the file:', err);
        return;
      }});
      
      if (interaction.replied) {
        await interaction
          .editReply({
            embeds: [errorEmbed],
          })
          .catch(() => {});
      } else {
        await interaction
          .reply({
            embeds: [errorEmbed],
          })
          .catch(() => {});
      }
    };
}