import express from 'express';
import { payScheduledService } from '../arquitecture/Controllers/pays.controller.js';
const router = express.Router();

router.post('/pay', [], payScheduledService)

export default router