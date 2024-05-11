const { EmbedBuilder, ButtonInteraction, TimestampStyles, MessageComponentInteraction, InteractionType, Embed, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, UserContextMenuCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require("discord.js");
const config = require("../config/config");
const fs = require('fs');
const path = require('path');
const os = require('node:os');
const { start } = require("repl");
const { channel } = require("diagnostics_channel");

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
let page=0;
module.exports = class Manager {

    //----------------- utility -----------------\\
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


    //----------------- moderation -----------------\\
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

    static async mute(c, i, m, t, d, r) {
      t.timeout(d, r)
    }
    
    static async ban() {

    }

    static async purge(client, i, u, c) {
      try {
        const tD = await i.channel.messages.fetch({ limit: 100 });

        const deleted = await i.channel.bulkDelete(tD.first(c))
        const replyEmbed = new EmbedBuilder()
        .setTitle(`Purge succesfull`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`<:reason:1233487051144302792> **Channel:** <#${i.channel.id}>\n<:staff:1233486987433087148>**Moderator:** <@${u.id}>\n<:servers:1235655770347933857>**Fetched:** \`${tD.size}\`\n<:size:1235655774022139964>**Requested:** \`${c}\`\n**Deleted:** \`${deleted.size}\``)
        i.channel.send({embeds: [replyEmbed]})
      } catch (err) {
        throw err;
      }
    }

    static async lock(client, i, u, c, r) {
      try {
        c.permissionOverwrites.set([
          {
            id: i.guild.id,
            deny: PermissionsBitField.Flags.SendMessages
          }
        ])
        const lockedEmbed = new EmbedBuilder()
        .setTitle(`Channel Locked`)
        .setColor(client.config.customization.embedColor)
        .setDescription(`**Reason:** ${r}`)
        c.send({embeds: [lockedEmbed]})
      } catch (err) {
        throw err;
      }
    }

    static async unlock(client, i, u, c, r) {
      try {
        c.permissionOverwrites.set([
          {
            id: i.guild.id,
            allow: PermissionsBitField.Flags.SendMessages
          }
        ])
        const unlockedEmbed = new EmbedBuilder()
        .setTitle(`Channel Unlocked`)
        .setColor(client.config.customization.embedColor)
        c.send({embeds: [unlockedEmbed]})
      } catch (err) {
        throw err;
      }
    }

    //----------------- base -----------------\\
    static async config(client, interaction, user, args) {
      try {
        if (page === 3) {
          page = 0
        }
        let found = false;
        if (args[0] && !(args[0].length <= 2)) {
          const data = await client.data.getGuildSettings(interaction.guild)
          findKey(data, args);
          function findKey(obj, args) {
            for (const key in obj) {
              if (Array.isArray(obj[key]) && args[0] === key) {
                obj[key].push(args[1]);
                found = true
                interaction.reply(`Changed the ${key} to ${obj[key]}`)
              } else if (obj[key] instanceof Object && obj[key] !== null) {
                findKey(obj[key], args);
              } else if (args[0] === key) {
                obj[key] = args[1];  
                found = true
                interaction.reply(`Changed the ${key} to ${obj[key]}`)
              }
            }
          }
          if (!found) {
            interaction.reply(`Could not find \`${args[0]}\``)
          }
          client.data.setGuildSettings(interaction.guild, data)
          return;
        }
        const data = await client.data.getGuildSettings(interaction.guild)
        const configEmbed = new EmbedBuilder()
        .setTitle(`${interaction.guild.name}'s configurations`)
        .setColor(client.config.customization.embedColor)

        let pages=[];
        for (const category in data) {
          pages.push(category)
        }
        for (const settingName in data[pages[page]]) {
          const setting = data[pages[page]][settingName];
          if (Array.isArray(setting)) {
            let items;
            items = setting.join(", ")
            if (items.length <= 2) {
              items = "None"
            }
            configEmbed.addFields({ name: `${settingName}`, value: `${items}` });
          } else if (setting instanceof Object) {
            let sSet="";
            for (const subSettingName in setting) {
              const subSetting = setting[subSettingName];
              sSet = `${sSet}\n${subSettingName}: ${subSetting}`;
            }
            configEmbed.addFields({name: `${settingName}`, value: `${sSet}`})
          } else {
            configEmbed.addFields({name: `${settingName}`, value: `${setting}`})
          }
        }
        page++
        const sentEmbed = await interaction.reply({content: `${JSON.stringify(data)}`, embeds: [configEmbed]});
      } catch (err) {throw err;}
    }
}
