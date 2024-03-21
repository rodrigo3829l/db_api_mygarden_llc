import express from 'express';
import fileUpload from "express-fileupload";
import { requireRefreshToken,  requireToken} from '../helpers/middlewares/JWT.config.js';
import { 
    signUp, 
    confirm, 
    recoverPassword,
    verifyCode, 
    changePassword, 
    login, 
    logout,
    infoUser,
    refreshToken,
    recoverCount,
    resendcode,
    addEmpolyed,
    updateUser,
    recoverSms,
 } from '../arquitecture/Controllers/user.controller.js';

const router = express.Router();

router.post('/signup', fileUpload({
    useTempFiles: true, 
    tempFileDir: './uploads',
    limits: { fileSize: 50 * 1024 * 1024 }, // Ejemplo: límite de 50MB
}), signUp);

router.get('/confirm/:token', [], confirm)

router.post('/recover',[],recoverPassword)
router.post('/recoversms',[],recoverSms)
router.post('/resend',[],resendcode)
router.post('/verify',[],verifyCode)
router.post('/change',[],changePassword)

router.post('/login', [], login)
router.get('/logout', [], logout)
 
router.get('/reactivate/:token', [], recoverCount)

//Muestra la informacion de un usuario en especifico pero le pide un token
router.get('/protected', requireToken, infoUser)
router.put('/update', requireToken, updateUser)

//refresca el token, pues este se cadica cada 15 min
router.get("/refresh", requireRefreshToken ,refreshToken, )
router.post('/addemployed', [], addEmpolyed)


export default router;
