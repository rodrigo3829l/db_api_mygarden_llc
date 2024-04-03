import express from 'express';

import { bookService, 
    quoteService, 
    getSchedulesServicesByUser, 
    getScheduleService, 
    cancelService, 
    rescheduleService,


    getScheduleServices,
    changeStatus
 } from '../arquitecture/Controllers/schedule.service.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';

const router = express.Router()


router.get('/getServices', [], getScheduleServices)








router.post('/schedule', [], bookService)
router.post('/quote/:id', requireToken, quoteService)

router.get('/scheduleservice/:id', [], getScheduleService)


router.put('/change/:id', requireToken, changeStatus)



router.get('/userservices', requireToken, getSchedulesServicesByUser)


router.put('/cancel/:serviceId', [], cancelService)
// router.put('/cancel/:id', [], cancelService)
router.put('/rescheduleService/:serviceId', [], rescheduleService)

export default router