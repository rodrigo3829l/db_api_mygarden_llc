import express from 'express';

import { 
    addProduct,
    updateProduct,
    setProductUsability,
    getAllUsableProducts,
    getAllProducts
} from '../arquitecture/Controllers/products.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';

const router = express.Router()


router.post('/add', requireToken, addProduct)
router.put('/update/:id', requireToken, updateProduct)
router.put('/usuable/:id', requireToken, setProductUsability)
router.get('/getUsuable', getAllUsableProducts)
router.get('/get', getAllProducts)

export default router