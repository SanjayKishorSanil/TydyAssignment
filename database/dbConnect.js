let conn = null;
// Connecting to DB
const getConnection = async () => {
  try {
    if (!conn) {
      const Sequelize = require("sequelize");
      conn = new Sequelize({
        database: process.env.SQL_DB_NAME,
        host: process.env.SQL_DB_HOST,
        username: process.env.SQL_DB_USER,
        port: process.env.SQL_DB_PORT,
        password: process.env.SQL_DB_PASSWORD,
        dialect: process.env.DATABASE_TYPE,
        dialectOptions: {
          multipleStatements: true,
        },
        pool: {
          max: 1,
          min: 0,
          idle: 20000,
          acquire: 20000,
        },
        logging: false, // To avoid sql query logs
      });
    }

    return conn;
  } catch (e) {
    console.log("Error", e);
  }
};

module.exports.getConnection = getConnection;
