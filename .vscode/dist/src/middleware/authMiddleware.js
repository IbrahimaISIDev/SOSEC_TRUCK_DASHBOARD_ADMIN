"use strict";
// // src/middleware/auth.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// // Define interface to extend Express Request
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         role: string;
//       };
//     }
//   }
// }
// export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'Unauthorized' });
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!);
//     req.user = decoded as { id: string; role: string };
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };
// // Role-based authorization middleware
// export const authorizeRoles = (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
//     }
//     next();
//   };
// };
// export default { authMiddleware, authorizeRoles };
