import { 
    getAllFeaturedProjects,
    getFeaturedProjectById,
    updateFeaturedProject,
    deleteFeaturedProject
 } from '../arquitecture/Controllers/feature.controller.js';
import express from 'express';

import { requireToken } from '../helpers/middlewares/JWT.config.js';

const router = express.Router();

router.get('/get', [], getAllFeaturedProjects)
router.get('/get/:Id', [], getFeaturedProjectById)
router.put('update/:id', requireToken, updateFeaturedProject)
router.delete('delete/:id', requireToken, deleteFeaturedProject)

export default router