import express from 'express';
import { signUp, confirm } from '../arquitecture/Controllers/user.controller.js';

const router = express.Router();

router.post('/signup', fileUpload({useTempFiles: true, tempFileDir: './uploads'}), signUp);

router.get('/confirm/:token', [], confirm)

export default router;
