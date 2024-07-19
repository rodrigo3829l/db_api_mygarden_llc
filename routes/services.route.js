import express from 'express';
import { requireRefreshToken,  requireToken} from '../helpers/middlewares/JWT.config.js';
import { 
    addService,
    getServices,
    getServiceById,
    updateServiceById,
    setServiceUsability,
    editService,
    getServicesByType,
} from '../arquitecture/Controllers/services.controller.js';

import { handleImageUpload } from '../helpers/middlewares/images.config.js';

const router = express.Router();

router.post('/add', requireToken, handleImageUpload, addService)
router.put('/update/:id', requireToken, handleImageUpload, updateServiceById)

router.get('/get', [], getServices)
router.get('/getByType/:tipoDeServicio', [], getServicesByType)
router.get('/getService/:id', [], getServiceById)

router.put('/usuable/:id', requireToken, setServiceUsability)
// router.put('/update/:id', requireToken, editService)


export default router;