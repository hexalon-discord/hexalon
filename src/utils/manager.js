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
    static ping(client, message) {
        var startMeasure = cpuAverage();
        const memory = process.memoryUsage();
        const keys = Object.keys(memory);
        const a = memory;
        keys.forEach((key) => {
            memory[key] = (a[key] / 1024 / 1024).toFixed(2) + "MB";
        });
        var endMeasure = cpuAverage(); 
        console.log(startMeasure)
        console.log(endMeasure)
        var idleDifference = endMeasure.idle - startMeasure.idle;
        var totalDifference = endMeasure.total - startMeasure.total;
        var CPU = 100 - ~~(100 * idleDifference / totalDifference);

        const embedPing = new EmbedBuilder()
        .setTitle(`Shard [${client.shard}]`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`Pong! 🏓\n**Latency:** \`${Math.round(client.ws.ping)}ms\`\n**Resources:**\n<:space:1235658011607961690>***RAM:*** \`${memory.rss}\`\n<:space:1235658011607961690>***CPU:*** \`${CPU}\`\n**Servers:** \`${client.guilds.cache.size}\`\n**Users:** \`${client.users.cache.size}\``)
          message.reply({embeds: [embedPing]});
          console.log(CPU)
    }
    
    static cases() {
        
    }

    static warn() {

    }

    static kick() {

    }
    
    static ban() {

    }
}