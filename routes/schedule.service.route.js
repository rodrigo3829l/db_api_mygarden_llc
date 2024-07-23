import express from 'express';

import { bookService, 
    quoteService, 
    getSchedulesServicesByUser, 
    getScheduleService, 
    cancelService, 
    rescheduleService,
    getScheduleServices,
    changeStatus,
    getScheduleServicesByStatus
 } from '../arquitecture/Controllers/schedule.service.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';
import { registerOffline } from '../arquitecture/Controllers/user.controller.js';
const router = express.Router()


router.get('/getServices', [], getScheduleServices)
router.get('/getServicesByStatus/:status', getScheduleServicesByStatus);
router.post('/schedule', [], bookService)
router.post('/quote/:id', requireToken, quoteService)

router.get('/scheduleservice/:id', [], getScheduleService)

router.post('/scheduleOfline', requireToken, registerOffline, bookService)


router.put('/change/:id', requireToken, changeStatus)



router.get('/userservices',  getSchedulesServicesByUser)


router.put('/cancel/:serviceId', [], cancelService)
// router.put('/cancel/:id', [], cancelService)
router.put('/rescheduleService/:serviceId', [], rescheduleService)

export default router