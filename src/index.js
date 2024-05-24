require('dotenv').config();

const Hexalon = require('./structures/hexalon.js');
const client = new Hexalon();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs')

const moduleName = 'bugsy';
const destination = path.join('./node_modules', moduleName);

if (fs.existsSync(destination)) {
    client.logger.warn(`Directory ${destination} already exists. Deleting...`);
    fs.rm(destination, { recursive: true }, (err) => {
      if (err) {
        client.logger.error(err)
        return;
      }
      client.logger.warn(`Directory ${destination} deleted successfully.`);
      cloneRepository();
    });
  } else {
    cloneRepository();
  }
  
  async function cloneRepository() {
    const cloneCommand = `git clone https://github.com/hexalon-discord/bugsy.git ${destination}`;
  
    await exec(cloneCommand, (error, stdout, stderr) => {
      if (error) {
        client.logger.err(`Error cloning repository: ${error}`);
        return;
      }
      client.logger.client(`Repository cloned successfully into: ${destination}`);
    });
}

client.connect(process.env.TOKEN)
client.setMaxListeners(100)