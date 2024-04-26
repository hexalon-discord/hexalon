const { Schema, model } = require('mongoose');

const guildsSchema = new Schema({
    guildId: String,
    config: {
        prefix: String,
        backupCode: String,
        mainRole: String,
    },
    moderation: {
        enabled: Boolean,
        modRole: String,
        adminRole: String,
        managerRole: String,
        modLog: String,
        autoMod: Boolean,
        autoModRules: {
            invite: Boolean,
            spam: Boolean,
            links: Boolean,
            mention: Boolean,
            mentions: Array,
            everyone: Boolean,
            whiteList: {
                invite: Boolean,
                spam: Boolean,
                links: Boolean,
                mention: Boolean,
                everyone: Boolean,
            },
        },
    },
    utility: {
        sticky: {
            enabled: Boolean,
            channel: String,
            message: String,
        },
        antiNuke: {
            enabled: Boolean,
            quarantineRole: String,
        },
    },
    levelling: {
        enabled: Boolean,
        msg: String,
        xpPerMsg: Number,
    },
    economy: {
        enabled: Boolean,
        credit: String,
    },
    roblox: {
        enabled: Boolean,
        api: String,
    },
    logging: {
        enabled: Boolean,
        channel: String,
    },
});
module.exports = model('Guilds', guildsSchema);
