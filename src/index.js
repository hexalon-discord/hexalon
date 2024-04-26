require('dotenv').config();
const DiscoMod = require('./structures/client');
const client = new DiscoMod();
client.connect(process.env.TOKEN)

const { EventEmitter } = require('events');

// Assuming 'bot' is your EventEmitter
client.setMaxListeners(100); // Setting the limit to 30 listeners