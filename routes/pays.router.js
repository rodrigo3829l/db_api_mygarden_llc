import express from 'express';
import { deletePay, getPays, payScheduledService, updatePay } from '../arquitecture/Controllers/pays.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
const router = express.Router();

router.post('/pay', [], payScheduledService)
router.put('/updatePay/:id', requireToken, updatePay)
router.delete('/deletePay/:id', requireToken, deletePay)
router.get('/get', requireToken, getPays)

export default router