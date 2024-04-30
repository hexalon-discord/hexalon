const fs = require('fs');

module.exports = async (client, guild) => {
    fs.rmSync (`src/data/guilds/${guild.id}`, {recursive:true});
}