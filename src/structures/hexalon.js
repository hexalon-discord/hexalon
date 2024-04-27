const {
    Client,
    Collection,
    GatewayIntentBits,
    Partials,
  } = require("discord.js");
  
  class Hexalon extends Client {
    constructor() {
      super({
        allowedMentions: {
          parse: ["everyone", "roles", "users"],
        },
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildVoiceStates,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildEmojisAndStickers,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.GuildInvites,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildPresences,
        ],
        partials: [
          Partials.Channel,
          Partials.Message,
          Partials.User,
          Partials.GuildMember,
        ],
      });
      this.slashCommands = new Collection();
      this.config = require("../config/config");
      this.owner = this.config.main.owner;
      this.prefix = this.config.main.prefix;
      this.embedColor = this.config.customization.embedColor;
      this.aliases = new Collection();
      this.commands = new Collection();
      this.manager = require('../utils/manager');
      if (!this.token) this.token = process.env.TOKEN;
  
      this.rest.on("rateLimited", (info) => {
        console.log(info, "log");
      });

      ["commands", "slashCommand", "events", "errorHandler"].forEach((handler) => {
        require(`../handlers/${handler}`)(this);
      });
    }
  
    connect(token) {
      return super.login(token);
    }
  }
  
  module.exports = Hexalon;