import express from 'express';

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
    getUsersByRole,
    getUsersOffline,
    getId
 } from '../arquitecture/Controllers/user.controller.js';
 import { handleImageUpload } from '../helpers/middlewares/images.config.js';
 import { contact } from '../arquitecture/Controllers/contact.controller.js';

const router = express.Router();

router.post('/signup', handleImageUpload, signUp);

router.get('/confirm/:token', [], confirm)
router.get('/getId', requireToken, getId)
router.get('/get', [], getUsersByRole)
router.get('/getOffline', [], getUsersOffline)

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
router.put('/update', requireToken, handleImageUpload, updateUser)

//refresca el token, pues este se cadica cada 15 min
router.get("/refresh", requireToken ,refreshToken )
router.post('/addemployed', [], addEmpolyed)

router.post('/contact', [], contact)

export default router;
