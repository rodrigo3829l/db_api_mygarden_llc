import { addTypePay } from "../arquitecture/Controllers/type.pay.js";
import express from 'express';

const router = express.Router();

router.post('/add', [], addTypePay)

export default router