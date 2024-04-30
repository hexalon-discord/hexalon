const { REST } = require("@discordjs/rest");
const { PermissionsBitField, Routes } = require("discord.js");
const { readdirSync } = require("fs");

module.exports = {
    name: 'reload',
    aliases: ['rl', 'refresh'],
    description: 'Reload all commands.',
    staffOnly: true,
    debugType: true,
    callback: async (message, args, client, prefix, debug) => {
        const data = [];
  let count = 0;
  readdirSync("./src/commands/slash/").forEach((dir) => {
    const slashCommandFile = readdirSync(`./src/commands/slash/${dir}`).filter(
      (files) => files.endsWith(".js")
    );

    for (const file of slashCommandFile) {
      const slashCommand = require(`../../commands/slash/${dir}/${file}`);

      if (!slashCommand.name)
        return client.logger.error('slashCommandError: Application command name is required');

      if (!slashCommand.description)
        return client.logger.error('slashCommandError: Application command description is required');

      client.slashCommands.set(slashCommand.name, slashCommand);
      
      
      data.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ? slashCommand.options : null,
        default_member_permissions: slashCommand.default_member_permissions
          ? PermissionsBitField.resolve(
              slashCommand.default_member_permissions
            ).toString()
          : null,
      });
      count++;
    }
  });
  const rest = new REST({ version: "10" }).setToken(client.config.main.token);
  (async () => {
    try {
    message.reply('Started reloading slash commands :arrows_clockwise:')
      rest.put(Routes.applicationCommands(client.config.main.id), {
        body: data,
      });
    message.reply('Successfully reloaded slash commands! :white_check_mark:')
    } catch (error) {
      client.logger.error(error)
    }
  })();
      }
}