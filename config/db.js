const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParse: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    console.log('DB Conectada');
  } catch (error) {
    console.log('Error de conexion');
    console.log(error);
    process.exit(1);
  }
};

module.exports = conectarDB;
