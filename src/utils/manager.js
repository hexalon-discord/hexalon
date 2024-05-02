const { EmbedBuilder, ButtonInteraction, TimestampStyles, MessageComponentInteraction, InteractionType, Embed, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const config = require("../config/config");
const fs = require('fs');
const path = require('path');

module.exports = class Manager {
    static getConfigModRole (client, guildId) {
        fs.readFile(`src/data/guilds/${guildId}/guildSettings.json`, 'utf8', (err, data) => {
            if (err) {
                client.logger.error(`Error reading JSON config file: ${err}`);
                return;
            }
        
            try {
                const file = JSON.parse(data);
                const modRole = file.setupData.modRole;
            } catch (error) {
                client.logger.error(`Error parsing config JSON: ${error}`);
            }
        });
    }

    static searchTotalWarns (client, guildId, userId) {
        return new Promise((resolve, reject) => {
        function checkForFile(dirPath, fileName) {
            const filePath = path.join(dirPath, fileName);
            return fs.existsSync(filePath);
        }

        if (checkForFile(`src/data/guilds/${guildId}`, `warns_${userId}.json`)) {
            fs.readFile(`src/data/guilds/${guildId}/warns_${userId}.json`, 'utf8', (err, data) => {
                if (err) {
                    client.logger.error(`Error reading warns json file: ${err}`);
                    return;
                }

                try {
                    const warnsData = JSON.parse(data);

                    warnsData.count += 1;

                    const updatedWarnsData = JSON.stringify(warnsData, null, 2);

                    fs.writeFile(`src/data/guilds/${guildId}/warns_${userId}.json`, updatedWarnsData, 'utf8', (err) => {
                        if (err) {
                            client.logger.error(`Error writing file: ${err}`);
                            return;
                        }
                        const warnCount = warnsData.count;
                        resolve(warnCount);
                    });
                } catch (error) {
                    client.logger.error(`Error parsing warns json data: ${error}`)
                }
            });
        } else {
            const newWarnsData = {
                guildId: guildId,
                userId: userId,
                count: 1,
            };

            const jsonReadyWarns = JSON.stringify(newWarnsData, null, 2);

            const guildDirPath = `src/data/guilds/${guildId}`;

            const warnsFilePath = path.join(guildDirPath, `warns_${userId}.json`)

            fs.writeFile(warnsFilePath, jsonReadyWarns, 'utf8', (err) => {
                if (err) {
                    client.logger.error(`Error writing warns file: ${err}`);
                    return;
                }
                resolve(1);
            });
        }
    })
}

static warnUser (client, guildId, userId, moderator, reason) {
    return new Promise((resolve, reject) => {
    let caseId = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      const length = 8
      let counter = 0;
      while (counter < length) {
        caseId += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }

    const newWarnLog = {
        guildId: guildId,
        userId: userId,
        moderator: moderator,
        reason: reason,
        caseId: caseId
    }

    const jsonWarnLog = JSON.stringify(newWarnLog, null, 2);

    const guildDirPath = `src/data/guilds/${guildId}`;

    const warnLogFilePath = path.join(guildDirPath, `warnlog_${caseId}.json`);

    fs.writeFile(warnLogFilePath, jsonWarnLog, 'utf8', (err) => {
        if (err) {
            client.logger.error(`Error writing warnlog file: ${err}`);
            return;
        }
        resolve(caseId)
    });
});
}
}