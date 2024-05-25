const fs = require('fs')

module.exports = class DataHandler {
    static makeModeration(guild, ta, ty, mo, re) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
    
                try {
                    const guildFile = JSON.parse(datajson);
                    var curcase = guildFile.moderations.length + 1;
                    const moder = {
                        "case": `${curcase}`,
                        "target": `${ta}`,
                        "type": `${ty.toLowerCase()}`,
                        "moderator": `${mo}`,
                        "time": `${Date.now()}`,
                        "reason": `${re}`
                    };
                    guildFile.moderations.push(moder);
                    let totalmoder = 0;
                    for (const entry of guildFile.moderations) {
                        if (entry.target === ta) {
                            totalmoder++;
                        }
                    }
                    const data = {
                        "case": curcase,
                        "total": totalmoder
                    };
                    fs.writeFile(`src/data/guildData/${guild.id}.json`, JSON.stringify(guildFile, null, 2), (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    static getModerations(guild, w, v) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', async (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                const guildFile = JSON.parse(datajson); 
                let totalmoder=0, each=[];
                for (const entry of guildFile.moderations) {
                    if (`${entry[w]}` === `${v}`) {
                        totalmoder++
                        each.push(entry)
                    }
                }
                const data = each
                resolve(data)
                        
            } catch (err) {
                reject(err);
                }
            });
        })
    }

    static getTotalModerations(guild) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', async (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                const guildFile = JSON.parse(datajson); 
                const data = guildFile.moderations.length
                resolve(data)
            
                } catch (err) {
                reject(err);
                }
            });
        })
    }

    static getGuildPrefix(guild) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
    
                try {
                    const guildFile = JSON.parse(datajson);
                    const data = guildFile.config.main.prefix
                        resolve(data);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    static getGuildSettings(guild) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
    
                try {
                    const guildFile = JSON.parse(datajson);
                    const data = guildFile.config
                        resolve(data);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    static setGuildSettings(guild, ns) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
    
                try {
                    const guildFile = JSON.parse(datajson);
                    guildFile.config = ns
                    fs.writeFile(`src/data/guildData/${guild.id}.json`, JSON.stringify(guildFile, null, 2), (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(200);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    static getGuildModerationRules(guild, ns) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const guildFile = JSON.parse(datajson);
                    const data = guildFile.config.moderation
                    resolve(data)
                } catch (err) {
                    reject(err)
                }
            });
        });
    }

    static getCustomCommand(guild, cc) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const guildFile = JSON.parse(datajson);
                    const data = guildFile.customCommands.find(cmd => cmd.name.toLowerCase() === cc.toLowerCase());
                    resolve(data ? data : false);
                } catch (err) {
                    reject(err)
                }
            });
        });
    }

    static getAllCustomCommands(guild) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const guildFile = JSON.parse(datajson);
                    const data = guildFile.customCommands
                    resolve(data ? data : false);
                } catch (err) {
                    reject(err)
                }
            });
        });
    }
    static createCustomCommand(guild, data) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    console.log(data)
                    let comId = '';
                    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const charactersLength = characters.length;
                    const length = 16
                    let counter = 0;
                    while (counter < length) {
                        comId += characters.charAt(Math.floor(Math.random() * charactersLength));
                      counter += 1;
                    }
                    const newCommand = {
                        name: data.main.name.toLowerCase() || null,
                        id: comId || null,
                        enabled: data.main.enabled || false,
                        delete_trigger: data.main.delete_trigger || false,
                        reply: {
                          dreply: data.main.reply.dreply || false, 
                          channel: data.main.reply.channel || null
                        },
                        created: {
                          time: Date.now(),
                          user: data.main.user || null
                        },
                        require: {
                          channels: data.main.require.channels || [],
                          roles: data.main.require.roles || []
                        },
                        ignore: {
                          channels: data.main.ignore.channels || [],
                          roles: data.main.ignore.roles || []
                        },
                        message: {
                          content: data.message.content || null
                        },
                        embed: {

                        }
                      }
                      if (data.embed.data && data.embed.data[1]) {
                        newCommand.embed = {
                            color: data.embed.data.color || null,
                            title: data.embed.data.title || null,
                            url: data.embed.data.url || null,
                            author: data.embed.data.author || null,
                            description: data.embed.data.description,
                            fields: data.embed.data.fields || null,
                            thumbnail: data.embed.data.thumbnail || null,
                            image: data.embed.data.image || null,
                            footer: data.embed.data.footer || null,
                            timestamp: data.embed.data.timestamp || false
                          }
                      };
                    const guildFile = JSON.parse(datajson);
                    guildFile.customCommands.push(newCommand);
                    console.log(guildFile, newCommand)
                    fs.writeFile(`src/data/guildData/${guild.id}.json`, JSON.stringify(guildFile, null, 2), (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        });
    }
}