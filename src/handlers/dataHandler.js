const { } = require('discord.js')
const fs = require('fs')
const guildSchem = require('src/models/Guilds.json')

module.exports = class Data {

    static getSettings(client, guild, setting, change) {
        let data;
        fs.readFile(`src/data/guildData/${guild.guildId}.json`, 'utf8', async (err, rawData) => {
            if (err) {
              console.error('Error reading JSON file:', err);
              return;
            }
            const settingsData = JSON.parse(rawData);
            const guildSchematic = require('src/models/Guilds.json')
            console.log(settingsData, guildSchematic)
        });
        return data;
    } 

    static setSettings(client, guild, setting, change) {
        let data;

        return data;
    } 

    static getModerations(client, guild, target) {
        let data;

        return data;
    }

    static setModerations(client, guild, target, type, reason) {
        let data;

        return data;
    }

    static editModerations(client, guild, target, type, reason) {
        let data;

        return data;
    }

    static removeModerations(client, guild, target, type, reason) {
        let data;

        return data;
    }
}