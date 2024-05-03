const fs = require('fs')

module.exports = class DataHandler {
    static makeModeration(guild, ta, ty, mo, re) {
        try {
            return new Promise((resolve, reject) => {
            fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', async (err, datajson) => {
                const guildFile = JSON.parse(datajson);       
                var curcase = guildFile.moderations.length + 1
                const moder = {
                    "case": `${curcase}`,
                    "target": `${ta}`,
                    "type": `${ty.toLowerCase()}`,
                    "moderator": `${mo}`,
                    "time": `${Date.now()}`,
                    "reason": `${re}`
                }
                guildFile.moderations.push(moder)
                let totalmoder = 0;
                for (const entry of guildFile.moderations) {
                    if (entry.target === ta) {
                        totalmoder++
                    }
                }
                const data = {
                    "case": curcase,
                    "total": totalmoder
                }
                fs.writeFile(`src/data/guildData/${guild.id}.json`, JSON.stringify(guildFile, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    }
                })
                resolve(data)});
            });
        } catch(err) {
            return err;
        }
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
            return err;
        }
    }

    static getTotalModerations(guild) {
        try {
            return new Promise((resolve, reject) => {
                fs.readFile(`src/data/guildData/${guild.id}.json`, 'utf8', async (err, datajson) => {
                    console.log(5)
                    const guildFile = JSON.parse(datajson); 
                    const data = guildFile.moderations.length
                    resolve(data)});
                })
        } catch (err) {
            return err;
        }
    }
}