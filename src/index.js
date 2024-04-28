require('dotenv').config();

const Hexalon = require('./structures/hexalon.js');
const client = new Hexalon();
client.connect(process.env.TOKEN)

client.setMaxListeners(100)