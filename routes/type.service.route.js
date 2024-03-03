import express from 'express';
// import {addTypeService} from '../arquitecture/Controllers/type.services.controller'
import { 
    addTypeService,
    getTipeServices
     } from '../arquitecture/Controllers/type.services.controller.js';

const router = express.Router();

router.post('/add', [], addTypeService)

router.get('/get', [], getTipeServices)

export default router;