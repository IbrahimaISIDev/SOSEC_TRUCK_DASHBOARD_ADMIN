import { Sequelize } from "sequelize";

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "postgres", // Change to your database dialect (e.g., 'postgres', 'sqlite', etc.)
});

export default sequelize;