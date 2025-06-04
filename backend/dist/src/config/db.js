"use strict";
// src/config/db.ts
const dotenv = require('dotenv');
dotenv.config();
const { Sequelize } = require('sequelize');
const sequelizeInstance = new Sequelize(process.env.DB_NAME || 'saraya_portal', process.env.DB_USER || 'saraya_user', process.env.DB_PASSWORD || 'saraya123@', {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    logging: console.log,
});
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
module.exports = sequelizeInstance;
