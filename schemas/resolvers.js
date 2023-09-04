require('dotenv').config();
const { AuthenticationError } = require('apollo-server-express');
const { User, Game, Leader } = require("../models");
const { signToken, clearToken } = require('../utils/auth');
const bcrypt = require('bcrypt');
const moment = require('moment');
const axios = require('axios');
const { promisify } = require("es6-promisify");
const randomBytes = require('randombytes');
const nodemailer = require("nodemailer");
const Sequelize = require('sequelize');
// const InitialEmail = require('../InitialEmail')
const GenerateCryptoRandomString = require('../CryptoRandomString');

const urlEndpoint = `${process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT}`;

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
        return userData;
      }
      // throw new AuthenticationError('Not logged in');
    },
    // users
    users: async (parent, args, context) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          return User.find()
        }
      } else {
        return null;
      }


    },
    // single user by username
    user: async (parent, args, context) => {
      if (context.user._id === args._id || context.user.role[0] === 'Admin') {
        return User.findOne({ _id: args._id })
      }
    },
    getUsers: async (parent, args, context) => {
      const { search } = args;
      let searchQuery = {};

      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          if (search) {
            searchQuery = {
              $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
              ],
            };
          }

          const users = await User.find(searchQuery);

          return {
            users,
          };
        }
      } else {
        return null;
      }
    },
    // users
    games: async (parent, args, context) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          return Game.find()
        }
      } else {
        return null;
      }

    },
    // single user by username
    game: async (parent, { _id }) => {
      return Game.findOne({ _id })
    },
    leaderBoard: async () => {
      let LBArray = [];
      let scoreSum = 0;

      const now = moment().utc();
      const cutoff = now.subtract(30, 'days').utc().toDate();
      const Game_0 = await Game.find({ date: { $gte: cutoff } });


      const combinedEntries = {};
      for (const entry of Game_0) {
        if (!(entry.username in combinedEntries)) {
          combinedEntries[entry.username] = { username: entry.username, score: 0 };
        }
        combinedEntries[entry.username].score += parseInt(entry.score);
      }

      // Sort the combined entries by score in descending order
      const sortedEntries = Object.values(combinedEntries);
      sortedEntries.sort((a, b) => b.score - a.score);

      // Build the leaderboard string
      for (const [i, entry] of sortedEntries.entries()) {
        LBArray.push({ "username": entry.username, "score": entry.score, id: i, position: i + 1 })
      }

      return LBArray;

    },
    // leaderBoard: async () => {
    //   const now = moment().utc();
    //   const cutoff = now.subtract(30, 'days').utc().toDate();
    //   const games = await Game.find({ date: { $gte: cutoff } });

    
    //   return games.map(game => ({
    //     username: game.username,
    //     score: game.score,
    //     date: game.date
    //   }));
    // }
    
    
  },

  Mutation: {
    login: async (parent, { username, password, role }) => {
      console.log("LOGIN")
      let lowerCaseUsername = username.toLowerCase();
      const user = await User.findOne({ username: lowerCaseUsername.replace(/\s/g, '') });
      const permission = await User.find({ role });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user, permission };
    },
    addUser: async (parent, args) => {
      console.log("ADD USER")
      let lowerCaseUsername = args.username.toLowerCase();
      let lowerCaseEmail = args.email.toLowerCase();
      let filteredUsername = lowerCaseUsername.replace(/\s+/g, '');
      let filteredEmail = lowerCaseEmail.replace(/\s+/g, '');

      const user = await User.create(
        {
          role: 'User',
          email: filteredEmail,
          username: filteredUsername,
          password: args.password,
        }
      );
      const token = signToken(user);

      // InitialEmail(args.username, lowerCaseEmail);

      return { token, user };
    },
    updateUser: async (parents, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        console.log(args)
        let lowerCaseUsername = args.username.toLowerCase();
        let lowerCaseEmail = args.email.toLowerCase();
        let filteredUsername = lowerCaseUsername.replace(/\s+/g, '');
        let filteredEmail = lowerCaseEmail.replace(/\s+/g, '');
        if (context.user) {
          await User.findByIdAndUpdate(
            { _id: context.user._id },
            {
              role: context.user.role,
              username: filteredUsername,
              email: filteredEmail,
            },
            { new: true }
          )
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }
    },
    updateUserPassword: async (parent, { password }, context) => {
      console.log(context.user)
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        if (context.user) {
          const result = await User.findByIdAndUpdate(
            { _id: context.user._id },
            {
              password: hash,
              resetToken: null,
              resetTokenExpiry: null
            },
            {
              where: { _id: context.user._id },
              returning: true,
              plain: true
            }
          );
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }

      // throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
    },
    addGame: async (parent, args, context) => {
      if (context.user._id !== args.userid) {
        throw new Error('Invalid user ID');
      }
    
      if (!args.username || !args.w1 || !args.w2 || !args.time || !args.score) {
        throw new Error('Missing required fields');
      }
    
      const game = new Game({
        username: args.username,
        userid: args.userid,
        w1: args.w1,
        w2: args.w2,
        w3: args.w3,
        time: args.time,
        score: args.score,
        date: moment().utc(),
        difficulty: args.difficulty
      });
    
      await game.save();
    
      const user = await User.updateOne(
        { _id: game.userid },
        {
          $addToSet: {
            games: {
              _id: game._id,
              username: game.username,
              userid: game.userid,
              w1: game.w1,
              w2: game.w2,
              w3: game.w3,
              time: game.time,
              score: game.score,
              date: game.date,
              difficulty: game.difficulty
            }
          }
        },
        { new: true }
      );
    
      return { game };
    },    
    deleteGame: async (parent, args, context) => {
      const saltRounds = 10;
      const hash = await bcrypt.hash(args.echo, saltRounds);

      if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        if (context.user.role[0] === 'Admin') {
          const game = await Game.findOne({ _id: args.id })
          console.log(game)
          await User.updateOne(
            { _id: game.userid },
            { $pull: { games: { _id: args.id } } },
          )
          await Game.findByIdAndDelete({ _id: args.id })
        }
      } else {
        return null;
      }

    },
    requestReset: async (parent, { email }, context) => {
      let lowerCaseEmail = email.toLowerCase();
      const username = `${process.env.SMTP_USERNAME}`
      const password = `${process.env.SMTP_PASSWORD}`
      const user = await User.findOne(
        { email: lowerCaseEmail }
      )
      // console.log(user)

      if (!user) throw new Error("No user found with that email.");

      // Create randomBytes that will be used as a token
      const randomBytesPromisified = promisify(randomBytes);
      const resetToken = (await randomBytesPromisified(20)).toString("hex");
      const resetTokenExpiry = Date.now() + 300000; // 5 minutes from now

      const saltRounds = 10;
      const hash = await bcrypt.hash(resetToken, saltRounds);

      const result = await User.findByIdAndUpdate(
        { _id: user._id },
        {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        },
        { new: true }
      );
      console.log(result)

      let transport = nodemailer.createTransport({
        host: "smtp.dreamhost.com",
        port: 465,
        auth: {
          user: `${username}`,
          pass: `${password}`
        },
        secure: true,
        logger: true,
        debug: true,
      });


      // Email them the token
      const mailRes = await transport.sendMail({
        from: 'admin@honestpatina.com',
        to: user.email,
        subject: "WordLit Password Reset Token",
        // text: 'Honest Patina email reset token: ' + `${resetToken}`,
        html:
          `
          <html>
            <head>
              <style>
                body {
                  background: linear-gradient(to bottom, white, lightgrey );
                  font-family: Arial, sans-serif;
                }
                .message-box {
                  background-color: white;
                  width: 50%;
                  margin: auto;
                  border-radius: 10px;
                  padding: 20px;
                }
                .btn {
                  background-color: blue;
                  font-weight: bold;
                  border: none;
                  color: white;
                  padding: 15px 32px;
                  text-align: center;
                  text-decoration: none;
                  display: inline-block;
                  font-size: 16px;
                  border-radius: 10px;
                }
                h1 {
                  text-align: center;
                }
                p {
                	font-size: 20px
                }
              </style>
            </head>
            <body>
              <h1>WordLit Password Reset</h1>
              <div class="message-box">
                <p>
                Dear ${user.username},
                </p>
                <p>
                  We have received a request to reset your WordLit password. If you did not make this request, you can safely ignore this email.
                </p>
                <p>
                  To reset your password, please copy the following reset token. The token will be invalid after 5 minutes.
                </p>
                <p>
                  <strong>Reset Token: ${resetToken}</strong>
                </p>
                <p>
                  Then, paste the token in the "reset token" box on WordLit.
                </p>
                <p>
                  Best regards,<br>
                  The WordLit Team
                </p>
              </div>
            </body>
          </html>
          `

      });
      console.log(mailRes)

      return true;

    },
    resetPassword: async (parent, { email, password, confirmPassword, resetToken }, { res }) => {
      console.log(resetToken)
      let lowerCaseEmail = email.toLowerCase();
      const Op = Sequelize.Op;

      // check if passwords match
      if (password !== confirmPassword) {
        throw new Error(`Your passwords don't match`);
      }

      // find the user with that resetToken
      // make sure it's not expired
      const user = await User.findOne(
        { resetToken: resetToken },

      );
      console.log(user)

      // throw error if user doesn't exist
      if (!user) {
        throw new Error(
          "Your password reset token is either invalid or expired."
        )
      }
      console.log(Date.now() - user.resetTokenExpiry)
      if (Date.now() > user.resetTokenExpiry) {
        throw new Error(
          "Your password reset token is either invalid or expired."
        )
      }

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      const result = await User.findByIdAndUpdate(
        { _id: user._id },
        {
          password: hash,
          resetToken: "",
          resetTokenExpiry: ""
        }
      );

      console.log(result)


    },
    deleteUser: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new ApolloError('Unauthorized access', 'AUTHENTICATION_FAILED')
        }

        const user = await User.findById({ _id: context.user._id })
        if (!user) {
          throw new ApolloError('User not found', 'AUTHENTICATION_FAILED')
        }

        // const saltRounds = 10;
        // const hash = await bcrypt.hash(args.echo, saltRounds);

        // if (await bcrypt.compare(process.env.ACCESS_PASSWORD, hash)) {
        //   if (context.user.role[0] === 'Admin') {
        console.log("deleteUser")

        if (context.user._id == args.id || context.user.role[0] == 'Admin') {
          const user = await User.findOne({ _id: args.id })

          for (let i = 0; i < user.games.length; i++) {
            await Game.findByIdAndDelete({ _id: user.games[i]._id })
          }

          await User.findByIdAndDelete({ _id: args.id })
        } else {
          return null;
        }
      } catch (err) {
        throw new ApolloError('An error occurred while processing the request', 'PROCESSING_ERROR')
      }

    },

  }
};

module.exports = resolvers;