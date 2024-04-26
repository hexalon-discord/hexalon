const { Schema, model } = require('mongoose');

const warnsSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Warns', warnsSchema);