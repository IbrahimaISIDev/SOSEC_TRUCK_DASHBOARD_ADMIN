"use strict";
// import request from 'supertest';
// import app from '../index';
// import sequelize from '../config/db';
// import Revenu from '../models/revenu';
// import Depense from '../models/depense';
// describe('Financial Endpoints', () => {
//   beforeAll(async () => {
//     await sequelize.sync({ force: true });
//   });
//   afterAll(async () => {
//     await sequelize.close();
//   });
//   it('should create a revenu', async () => {
//     const res = await request(app)
//       .post('/api/revenus')
//       .send({
//         montant: 1000.50,
//         source: 'Transport',
//         date: '2025-05-08',
//         notes: 'Paiement client',
//       });
//     expect(res.status).toBe(201);
//     expect(res.body.montant).toBe(1000.50);
//   });
//   it('should create a depense', async () => {
//     const res = await request(app)
//       .post('/api/depenses')
//       .send({
//         montant: 200.75,
//         categorie: 'Carburant',
//         date: '2025-05-08',
//         notes: 'Achat carburant',
//       });
//     expect(res.status).toBe(201);
//     expect(res.body.montant).toBe(200.75);
//   });
// });
//# sourceMappingURL=financial.test.js.map