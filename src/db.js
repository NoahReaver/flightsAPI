const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");
const config = require("./config/config");

const basename = path.basename(__filename);
const modelsDirectory = path.join(__dirname, "/models");

const db = {};

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const actualConfig = config[env];
const sequelize =
  process.env.NODE_ENV === "production"
    ? new Sequelize({
        database: actualConfig.database,
        dialect: "postgres",
        host: actualConfig.host,
        port: 5432,
        username: actualConfig.username,
        password: actualConfig.password,
        pool: {
          max: 3,
          min: 1,
          idle: 10000,
        },
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          keepAlive: true,
        },
        ssl: true,
      })
    : new Sequelize(
        actualConfig.database,
        actualConfig.username,
        actualConfig.password,
        actualConfig
      );

fs.readdirSync(modelsDirectory)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(modelsDirectory, file))(
      sequelize,
      DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate !== null) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
