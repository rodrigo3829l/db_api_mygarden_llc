import express from 'express';

import { addProduct, updateProduct, setProductUsability, getAllUsableProducts } from '../arquitecture/Controllers/products.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';

const router = express.Router()


router.post('/add', [], addProduct)
router.post('/update:id', [], updateProduct)
router.post('/usuable:id', [], setProductUsability)
router.get('/get', requireToken, getAllUsableProducts)

export default router