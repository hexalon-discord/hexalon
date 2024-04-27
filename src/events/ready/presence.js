require('dotenv').config();
const { ActivityType, setActivity} = require('discord.js')

module.exports = async (client) => {
try {
    client.user.setStatus('online');
    let status = [
        {
          name: '/help',
          type:  ActivityType.Listening,
        },
        {
          name: 'how I\'m still being developed',
          type:  ActivityType.Watching,
        },
    ];

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
  console.log(`Changed ${client.user.tag} presence`, 'ready');
} catch (error) {
  console.log("Error while changing presence", "error");
} {
}
};