import express from 'express';

import { addProduct, updateProduct, setProductUsability } from '../arquitecture/Controllers/products.controller.js';

const router = express.Router()


router.post('/add', [], addProduct)
router.post('/update:id', [], updateProduct)
router.post('/usuable:id', [], setProductUsability)

export default router