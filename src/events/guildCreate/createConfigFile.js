const fs = require('fs');
path = require('path');

module.exports = async (client, guild) => {
    fs.mkdirSync(`src/data/guilds/${guild.id}`);
    const directory = `src/data/guilds/`;
      const fileName = `${guild.id}.json`;
      const filePath = path.join(directory, fileName);
      const fileData = {
        guildData: {
          guildInfo: {
            guildName: guild.name,
            guildId: guild.id
          },
          config: {
            moderation: {
              enabled: false,
              staffRoles: [""],
              adminRoles: [""],
              require
            }
          }
        }
      }
      fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          client.logger.error(`An error ocurred while creating the file: ${err}`);
            return;
        }
    });
}