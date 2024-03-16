import express from 'express';

import { bookService, quoteService, getSchedulesServicesByUser, getScheduleService, cancelService, rescheduleService } from '../arquitecture/Controllers/schedule.service.controller.js';

const router = express.Router()

router.post('/schedule', [], bookService)
router.post('/quote/:id', [], quoteService)

router.get('/scheduleservice/:id', [], getScheduleService)

router.get('/userservices/:token', [], getSchedulesServicesByUser)


router.put('/cancel/:serviceId', [], cancelService)
// router.put('/cancel/:id', [], cancelService)
router.put('/rescheduleService/:serviceId', [], rescheduleService)

export default router