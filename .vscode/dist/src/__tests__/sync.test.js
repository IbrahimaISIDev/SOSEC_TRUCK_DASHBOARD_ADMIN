"use strict";
// import request from 'supertest';
// import app from '../index';
// import sequelize from '../config/db';
// import { db } from '../config/firebase';
// import Document from '../models/document';
// import Depense from '../models/depense';
// jest.mock('../config/firebase');
// describe('Sync Endpoint', () => {
//   beforeAll(async () => {
//     await sequelize.sync({ force: true });
//   });
//   afterAll(async () => {
//     await sequelize.close();
//   });
//   it('should sync tickets and expenses', async () => {
//     (db.ref as jest.Mock).mockImplementation(() => ({
//       once: jest.fn().mockResolvedValue({
//         val: () => ({
//           ticket1: {
//             ticket_num: '250395',
//             type: 'pesee',
//             image_url: 'url',
//             driver: 'driver1',
//             sync_status: 'synced',
//           },
//           expense1: {
//             amount: 100,
//             type: 'carburant',
//             date: '2025-05-08',
//             driver_id: 'driver1',
//             sync_status: 'synced',
//           },
//         }),
//       }),
//     }));
//     const res = await request(app).post('/api/sync');
//     expect(res.status).toBe(200);
//     expect(res.body.message).toBe('Synchronisation terminée');
//     const documents = await Document.findAll();
//     const depenses = await Depense.findAll();
//     expect(documents.length).toBe(1);
//     expect(depenses.length).toBe(1);
//   });
// });
