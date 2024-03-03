import express from 'express';

import { bookService, quoteService, getSchedulesServicesByUser, getScheduleService } from '../arquitecture/Controllers/schedule.service.controller.js';

const router = express.Router()

router.post('/schedule', [], bookService)
router.post('/quote/:id', [], quoteService)

router.get('/scheduleservice/:id', [], getScheduleService)

router.get('/userservices/:token', [], getSchedulesServicesByUser)

export default router