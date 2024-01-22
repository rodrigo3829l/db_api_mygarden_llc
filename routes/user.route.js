import express from 'express';
import fileUpload from "express-fileupload";
import { signUp, confirm, recoverPassword,verifyCode, changePassword } from '../arquitecture/Controllers/user.controller.js';

const router = express.Router();

router.post('/signup', fileUpload({useTempFiles: true, tempFileDir: './uploads'}), signUp);
router.get('/confirm/:token', [], confirm)

router.post('/recover',[],recoverPassword)
router.post('/verify',[],verifyCode)
router.post('/change',[],changePassword)

export default router;
