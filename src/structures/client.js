const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const mongoose = require("mongoose");

class RACMbot extends Client {
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
    if (!this.token) this.token = this.config.token;

    this.rest.on("rateLimited", (info) => {
      console.log(info, "log");
    });

    /**
     *  Mongose for database
     */
    mongoose.connect(process.env.MONGODB_URI);
    mongoose.set("strictQuery", true);
    mongoose.connection.on("connected", () => {
      console.log("[DB] DATABASE CONNECTED", "ready");
    });
    mongoose.connection.on("err", (err) => {
      console.log(`Mongoose connection error: \n ${err.stack}`, "error");
    });
    mongoose.connection.on("disconnected", () => {
      console.log("Mongoose disconnected");
    });
    // Load handlers (commands, slash commands, events, error handler)
    ["commands", "slashCommand", "events", "errorHandler"].forEach((handler) => {
      require(`../handlers/${handler}`)(this);
    });
  }

  connect(token) {
    return super.login(token);
  }
}

module.exports = RACMbot;