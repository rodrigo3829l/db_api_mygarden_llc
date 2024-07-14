import express from 'express';
import { addDate, removeDate, getDates, updateDate } from '../arquitecture/Controllers/dates.controller.js';
import { requireRefreshToken,  requireToken} from '../helpers/middlewares/JWT.config.js';
const router = express.Router();

router.post ('/add', addDate)
router.delete ('/remove/:id', requireToken, removeDate)
router.get ('/get', getDates)
router.put ('/update/:id', requireToken, updateDate)

export default router