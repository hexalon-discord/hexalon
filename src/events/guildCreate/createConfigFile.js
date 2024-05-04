const fs = require('fs');
const path = require('path');

module.exports = async (client, guild) => {
    const directory = `src/data/guilds/`;
      const fileName = `${guild.id}.json`;
      const filePath = path.join(directory, fileName);
      const fileData = {
        "guildInfo": {
          "guildName": guild.name,
          "guildId": guild.id
        },
        "config": {
          "prefix": "!",
          "moderation": {
            "enabled": false,
            "staffRoles": [""],
            "adminRoles": [""],
            "requireReason": false,
          },
          "logging": {
            "modLogs": {
              "enabled": false,
              "channel": ""
            },
            "messsageLogs": {
              "enabled": false,
              "channel": ""
            },
            "joinLogs": {
              "enabled": false,
              "channel": ""
            },
            "roleLogs": {
              "enabled": false,
              "channel": ""
            },
            "channelLogs": {
              "enabled": false,
              "channel": ""
            }
          },
        },
        "moderations": []
      }
      fs.writeFile(filePath, JSON.stringify(fileData, null, 2), (err) => {
        if (err) {
          client.logger.error(`An error ocurred while creating the file: ${err}`);
            return;
        }
    });
}