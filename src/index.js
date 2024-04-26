require('dotenv').config();
const Hexalon = require('./structures/client');
const client = new Hexalon();
client.connect(process.env.TOKEN)

const { EventEmitter } = require('events');

// Assuming 'bot' is your EventEmitter
client.setMaxListeners(100); // Setting the limit to 30 listeners