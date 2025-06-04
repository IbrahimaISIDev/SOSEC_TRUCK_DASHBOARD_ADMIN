"use strict";
// import request from 'supertest';
// import app from '../index';
// import { Utilisateur } from '../models/utilisateur';
// import bcrypt from 'bcryptjs';
// describe('POST /auth/login', () => {
//   beforeAll(async () => {
//     await Utilisateur.create({
//       nom: 'Test Admin',
//       email: 'admin@test.com',
//       motDePasse: await bcrypt.hash('password', 12),
//       role: 'Administrateur',
//     });
//   });
//   it('should login with valid credentials', async () => {
//     const res = await request(app)
//       .post('/auth/login')
//       .send({ email: 'admin@test.com', password: 'password' });
//     expect(res.status).toBe(200);
//     expect(res.body.token).toBeDefined();
//   });
//   it('should reject invalid credentials', async () => {
//     const res = await request(app)
//       .post('/auth/login')
//       .send({ email: 'admin@test.com', password: 'wrong' });
//     expect(res.status).toBe(401);
//   });
// });
//# sourceMappingURL=auth.test.js.map