import { 
    getAllFeaturedProjects,
    getFeaturedProjectById,
    updateFeaturedProject,
    deleteFeaturedProject,
    addFeaturedProject,
    getFeaturedProjectsByServiceId
} from '../arquitecture/Controllers/feature.controller.js';
import { handleImagesUpload } from '../helpers/middlewares/images.array.congif.js';
import express from 'express';

import { requireToken } from '../helpers/middlewares/JWT.config.js';    

const router = express.Router();
router.post('/add', requireToken, handleImagesUpload, addFeaturedProject)
router.get('/get', [], getAllFeaturedProjects)
router.get('/get/:id', [], getFeaturedProjectById)
router.get('/getByService/:id', [], getFeaturedProjectsByServiceId)
router.put('/update/:id', requireToken, handleImagesUpload ,updateFeaturedProject)
router.delete('/delete/:id', requireToken, deleteFeaturedProject)

export default router