const fs = require('fs')

module.exports = class DataHandler {
    static makeModeration(guild, ta, ty, mo, re) {
        return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', (err, datajson) => {
                if (err) {
                    reject(err); // Reject promise if there's an error reading the file
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
                            reject(err); // Reject promise if there's an error writing the file
                            return;
                        }
                        resolve(data); // Resolve promise with data if everything is successful
                    });
                } catch (err) {
                    reject(err); // Reject promise if there's an error parsing JSON or any other synchronous error
                }
            });
        });
    }

    static getModerations(guild, w, v) {
        try {
            return new Promise((resolve, reject) => {
                fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', async (err, datajson) => {
                    const guildFile = JSON.parse(datajson); 
                    let totalmoder=0, each=[];
                    for (const entry of guildFile.moderations) {
                        if (`${entry[w]}` === `${v}`) {
                            totalmoder++
                            each.push(entry)
                        }
                    }
                    const data = each
                    resolve(data)});
                })
        } catch (err) {
            throw err;
        }
    }

    static getTotalModerations(guild) {
        try {
            return new Promise((resolve, reject) => {
                fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', async (err, datajson) => {
                    const guildFile = JSON.parse(datajson); 
                    const data = guildFile.moderations.length
                    resolve(data)});
                })
        } catch (err) {
            throw err;
        }
    }
}