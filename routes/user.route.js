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
    updateUser
 } from '../arquitecture/Controllers/user.controller.js';

const router = express.Router();

router.post('/signup', fileUpload({useTempFiles: true, tempFileDir: './uploads'}), signUp);
router.get('/confirm/:token', [], confirm)

router.post('/recover',[],recoverPassword)
router.post('/resend',[],resendcode)
router.post('/verify',[],verifyCode)
router.post('/change',[],changePassword)

router.post('/login', [], login)
router.get('/logout', [], logout)
 
router.get('/reactivate/:token', [], recoverCount)

//Muestra la informacion de un usuario en especifico
router.get('/protected', requireToken, infoUser)
router.put('/update', requireToken, updateUser)

//refresca el token, pues este se cadica cada 15 min
router.get("/refresh", requireRefreshToken ,refreshToken, )
router.post('/addemployed', [], addEmpolyed)

export default router;
