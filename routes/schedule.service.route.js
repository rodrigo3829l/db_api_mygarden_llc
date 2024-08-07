import express from 'express';

import { bookService, 
    quoteService, 
    getSchedulesServicesByUser, 
    getScheduleService, 
    cancelService, 
    rescheduleService,
    getScheduleServices,
    changeStatus,
    getScheduleServicesByStatus,
    getLimitedScheduleServices
 } from '../arquitecture/Controllers/schedule.service.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
import { registerOffline } from '../arquitecture/Controllers/user.controller.js';
import { handleImageUpload } from '../helpers/middlewares/images.config.js';
const router = express.Router()


router.get('/getServices', [], getScheduleServices)
router.get('/getServicesLimit', [], getLimitedScheduleServices)
router.get('/getServicesByStatus/:status', getScheduleServicesByStatus);
router.get('/scheduleservice/:id', [], getScheduleService)
router.get('/userservices',  requireToken, getSchedulesServicesByUser)

router.post('/schedule', handleImageUpload, bookService)
router.post('/quote/:id', requireToken, quoteService)
router.post('/scheduleOfline', requireToken, registerOffline, bookService)

router.put('/change/:id', requireToken, changeStatus)

router.put('/cancel/:serviceId', [], cancelService)
// router.put('/cancel/:id', [], cancelService)
router.put('/rescheduleService/:serviceId', [], rescheduleService)

export default router