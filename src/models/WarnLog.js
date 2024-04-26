const { Schema, model } = require('mongoose');

const warnLogSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  moderator: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

module.exports = model('WarnLog', warnLogSchema);