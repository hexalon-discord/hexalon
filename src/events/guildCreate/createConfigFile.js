const fs = require('fs');
path = require('path');

module.exports = async (client, guild) => {
    fs.mkdirSync(`src/data/guilds/${guild.id}`);
    const directory = `src/data/guilds/${guild.id}`;
      const fileName = `guildSettings.json`;
      const filePath = path.join(directory, fileName);
      const fileData = {
        guildData: {
            name: guild.name,
            id: guild.id,
            ownerId: guild.ownerId,
        },
        setupData: {
          staffRoles: [''],
          managementRoles: [''],
          ignoredChannels: [''],
          moderationEnabled: true,
          modlogChannel: '',
          requireReason: '',
          showCase: true,
          welcomeEnabled: false,
          welcomechannel: '',
          welcomeText: `Welcome to our server!`
        }
      }
      fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          client.logger.error(`An error ocurred while creating the file: ${err}`);
            return;
        }
    });
}