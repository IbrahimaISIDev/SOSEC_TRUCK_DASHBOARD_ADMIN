import cron from "node-cron";

cron.schedule("0 0 * * *", async () => {
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