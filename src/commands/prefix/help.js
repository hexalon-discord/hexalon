const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const path = require('path');
const commandsDir = path.join(__dirname, '../slash/commands');
const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

module.exports = {
    name: 'help',
    aliases: [],
    description: 'The help menu of the Races & Car Meets bot',
    staffOnly: false,
    debugType: true,
    callback: async (message, args, client, prefix, debug) => {
    try{
        const slashCommands = await client.application.commands.fetch();
        let publiccmds = "**Public** \n▬▬▬▬▬▬▬▬▬▬▬"
        let moderation = "**Moderation** \n▬▬▬▬▬▬▬▬▬▬▬"
        let privateservercommands = "**Privateserver Commands** \n▬▬▬▬▬▬▬▬▬▬▬"
        let raceleaguecommands = "**Raceleague Commands** \n▬▬▬▬▬▬▬▬▬▬▬"
        //let  = "▬▬▬▬▬▬▬▬▬▬▬"
        for (const file of commandFiles) {
            const command = require(path.join(commandsDir, file));
            const commandid = slashCommands.find(cmd => cmd.name === command.name).id;
            if (command.category === "public") {
                publiccmds += `\n**</${command.name}:${commandid}> - ** \`${command.description}\``
            }
            if (command.category === "moderation") {
                moderation += `\n**</${command.name}:${commandid}> - ** \`${command.description}\``
            }
            if (command.category === "privateservercommands") {
                privateservercommands += `\n**</${command.name}:${commandid}> - ** \`${command.description}\``
            }
            if (command.category === "raceleague") {
                raceleaguecommands += `\n**</${command.name}:${commandid}> - ** \`${command.description}\``
            }  
        }
        
        const combinedCategories = [publiccmds.trim(), moderation.trim(), privateservercommands.trim(), raceleaguecommands.trim()].join(' | ');
        let channel = message.channel; 
        await client.manager.help(client, message.guild, message.member, channel, combinedCategories, false, debug);
    } catch (error) {
        throw (error)
      }
}
}