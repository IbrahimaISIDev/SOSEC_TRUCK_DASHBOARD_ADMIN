"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
node_cron_1.default.schedule("0 0 * * *", async () => {
    console.log("Checking document expirations...");
    // Add logic for US9
});
// const cron = require('node-cron');
// const { Op } = require('sequelize');
// cron.schedule('0 0 * * *', async () => {
//   const period = await NotificationConfig.findOne(); // Get configured days
//   const documents = await Document.findAll({
//     where: {
//       date_expiration: {
//         [Op.between]: [new Date(), new Date(Date.now() + period * 24 * 60 * 60 * 1000)]
//       }
//     }
//   });
//   // Generate notifications
//   documents.forEach(doc => createNotification(doc));
// });
//# sourceMappingURL=expirationCron.js.map