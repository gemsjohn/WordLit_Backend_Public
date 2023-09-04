// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`

  type User {
    _id: ID
    role: [String]
    username: String
    email: String
    profilepicture: String
    games: [Game]
    resetToken: String
    resetTokenExpiry: String,
    currentVersion: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Game {
    _id: ID,
    userid: String
    username: String
    w1: String
    w2: String
    w3: String
    time: String
    score: String
    date: String
    difficulty: String
  }

  type LeaderBoardEntry {
    id: String
    username: String
    score: String
    position: String
    date: String
  }

  type UsersResult {
    users: [User]
  }

  type Query {
    me: User
    users(echo: String): [User]
    user(_id: ID!): User
    getUsers(search: String, echo: String): UsersResult
    games(echo: String): [Game]
    game(_id: ID!): Game
    leaderBoard: [LeaderBoardEntry]
  }

  type Mutation {
    login(
      username: String!, 
      password: String!
    ): Auth

    addUser(
      role: [String!],
      username: String!, 
      email: String!,
      profilepicture: String,
      password: String!,
    ): Auth

    deleteUser(id: ID!): String

    updateUser(
      username: String, 
      email: String,
      profilepicture: String,
    ): User
    
    updateUserPassword(
      password: String
    ): User

    requestReset(
      email: String
    ): User

    resetPassword(
      email: String
      password: String
      confirmPassword: String
      resetToken: String
    ): User

    addGame(
      userid: String
      username: String
      w1: String
      w2: String
      w3: String
      time: String
      score: String
      date: String
      difficulty: String
    ): Game
    
    deleteGame(id: ID!, echo: String): String
  }
  
`;

// export the typeDefs
module.exports = typeDefs;