const { EmbedBuilder, ButtonInteraction, TimestampStyles, MessageComponentInteraction, InteractionType, Embed, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const config = require("../config/config");
const fs = require('fs');
const path = require('path');
const os = require('node:os');
const { start } = require("repl");

function cpuAverage() {
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();
  
    for(var i = 0, len = cpus.length; i < len; i++) {
  
      var cpu = cpus[i];
  
      for(type in cpu.times) {
        totalTick += cpu.times[type];
     }
  
      totalIdle += cpu.times.idle;
    }
  
    return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
  }

module.exports = class Manager {
    static async ping(client, message) {
        var startMeasure = cpuAverage();
        const memory = process.memoryUsage();
        const keys = Object.keys(memory);
        const a = memory;
        keys.forEach((key) => {
            memory[key] = (a[key] / 1024 / 1024).toFixed(2) + "MB";
        });
        var endMeasure = cpuAverage(); 
        var idleDifference = endMeasure.idle - startMeasure.idle;
        var totalDifference = endMeasure.total - startMeasure.total;
        var CPU = 1 + ~~(100 * idleDifference / totalDifference);

        const embedPing = new EmbedBuilder()
        .setTitle(`Shard [${message.guild.shard}]`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`Pong! 🏓\n**Latency:** \`${Math.round(client.ws.ping)}ms\`\n**Resources:**\n<:space:1235658011607961690>***RAM:*** \`${memory.rss}\`\n<:space:1235658011607961690>***CPU:*** \`${CPU}%\`\n**Servers:** \`${client.guilds.cache.size}\`\n**Users:** \`${client.users.cache.size}\``)
          message.reply({embeds: [embedPing]});
    }
    
    static async cases(client, interaction, user, typ, val) {
      const data = await client.data.getModerations(interaction.guild, typ, val)
      const responseEmbed = new EmbedBuilder()
      .setTitle('Search results')
      .setColor(client.config.customization.embedColor)

      if (data.length === 0) {
        responseEmbed.setDescription(`No logs were found.`)
      }
      await data.forEach(log => {
        const caseId = log.case
        const targetId = log.target
        const type = log.type
        const moderatorId = log.moderator
        const time = log.time

        responseEmbed.addFields({name: caseId, value: `Case: ${caseId} \nType: ${type} \nTarget: <@${targetId}> \nModerator: <@${moderatorId}> \nTime: <t:${Math.floor(time/1000)}>`});
      })
      interaction.reply({embeds: [responseEmbed]});
    }

    static async warn(client, interaction, target, user, reason) {
      try {
        const data = await client.data.makeModeration(interaction.guild, target, "warn", user.id, reason)
        const total = data.total
        const caseNum = data.case
        const warnedEmbed = new EmbedBuilder()
        .setTitle(`Warning overview`)
        .setColor(client.config.customization.embedColor)
        let dmEmbed = new EmbedBuilder()
        .setTitle(`You have been warned in ${interaction.guild.name}`)
        .setColor(client.config.customization.embedColor)

        if (total === 1) {
          dmEmbed.setDescription(`You have been warned by <@${user.id}> in ${interaction.guild.name} for the following reason: ${reason} \nYou now have ${total} warning.`)
          warnedEmbed.setDescription(`You have warned <@${target}> for the following reason: ${reason}. \nThey now have ${total} moderation in this server. \nCase: ${caseNum}`)
        } else {
          dmEmbed.setDescription(`You have been warned by <@${user.id}> in ${interaction.guild.name} for the following reason: ${reason} \nYou now have ${total} warnings.`)
          warnedEmbed.setDescription(`You have warned <@${target}> for the following reason: ${reason}. \nThey now have ${total} moderations in this server. \nCase: ${caseNum}`)
        }

        let dmChannel = await client.users.createDM(target);
        interaction.reply({embeds: [warnedEmbed]});
        dmChannel.send({embeds: [dmEmbed]});
      } catch(err) {
        throw err;
      }
    }

    static async kick() {

    }
    
    static async ban() {

    }
}