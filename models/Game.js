const { Schema, model } = require('mongoose');


const GameSchema = new Schema(
  {
    userid: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    w1: {
      type: String,
    },
    w2: {
      type: String,
    },
    w3: {
      type: String,
    },
    time: {
      type: String,
      required: true,
    },
    score: {
      type: String,
      required: true,
    },
    date: Date,
    difficulty: {
      type: String,
    }
  },
  
  // set this to use virtual below
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Game = model('Game', GameSchema);

module.exports = Game;
