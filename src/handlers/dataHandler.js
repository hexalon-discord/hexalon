const { } = require('discord.js')
const fs = require('fs')
const guildSchem = require('src/models/Guilds.json')
const mongoose = require('mongoose')

module.exports = class Data {

    static async getSettings(client, guild, setting, change) {
        try {
            let data;
            data = mongoose.idontunderstandthisshitpleasemakethisforme
            return data;
        } catch (error) {
            console.error('Error getting settings:', error);
            return null;
        }
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