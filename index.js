const { ApolloServer } = require('apollo-server');

const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

//Dabatabase
const conectarDB = require('./config/db');

//Connect Database
conectarDB();

//Schema
const typeDefs = require('./db/schema');

//Resolvers
const resolvers = require('./db/resolvers');

//Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // console.log(req.headers['authorization']);

    const token = req.headers['authorization'] || '';

    if (token) {
      try {
        const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);

        return {
          usuario,
        };
        
      } catch (error) {
        console.log('Hubo un error');
        console.log(error);
      }
    }
  },
});

//Run server
server.listen().then(({ url }) => {
  console.log(`Server runing on URL: ${url}`);
});
