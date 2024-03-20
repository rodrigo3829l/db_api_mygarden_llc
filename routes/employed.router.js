import express from 'express';
import { getEmployeds } from '../arquitecture/Controllers/employed.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
const router = express.Router();

router.get('/get', requireToken, getEmployeds)

export default router