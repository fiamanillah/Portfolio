import express from 'express';
import passport from 'passport';

import { register } from '../controllers/authController';
import asyncHandler from '../utils/asyncHandler';

const authRoutes = express.Router();

authRoutes.post('/register', asyncHandler(register));

export default authRoutes;
