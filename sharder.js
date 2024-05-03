const { ShardingManager } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const manager = new ShardingManager('./src/index.js', {
  token: process.env.TOKEN,
  totalShards: 2
});

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();
