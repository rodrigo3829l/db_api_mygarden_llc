import jwt from "jsonwebtoken"
import { newLog } from "../config/log.config.js";

export const getToken = (uid) =>{
    const expiresIn = 60 * 60;

    try {
        const token = jwt.sign({uid}, process.env.JWT_SECRET,{ expiresIn} );
        return {token, expiresIn}
    } catch (error) {
        console.log(error);
    }
}

export const getTokenData = (token) => {
    let data = null

    jwt.verify( token, process.env.JWT_SECRET, (err, decoded) =>{
        if(err){
            console.log("Error al ontener la data del token")
            console.log(err)
        }else{
            data = decoded
        }
    })
    return data
}

const TokenVerificationErrors = {
    ["invalid signature"]: "La firma del jwt no es valida",
    ["jwt expired"]: "jwt expirado",
    ["invalid token"]: "Token no valido",
    ["No Bearer"]: "Utiliza el formato Bearer",
    ["jwt malformed"]: "JWT formato no valido"
};

export const generateRefreshToken = (uid, res) => {
    const expiresIn = 60 * 60 * 24 * 30; 
    try {
        const refreshToken = jwt.sign({uid}, process.env.JWT_REFRESH, {expiresIn})
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.MODO !== "developer",
            expires: new Date(Date.now() + expiresIn * 1000),
            // sameSite : 'none'
        })
    } catch (error) {
        console.log(error)
    }
} 

export const requireToken = async (req, res, next) => {
    try {
        let token = req.headers?.authorization ;
        let rol = req.headers?.rol ;
        if(!token) 
            throw new Error('No Bearer');
        token = token.split(" ")[1];

        
        // Extrae la informacion del token, en este caso el id
        const {uid} = jwt.verify(token, process.env.JWT_SECRET)
        if(rol !== uid.userRol){
            const description = `Intento no autorizado al departamento de: ${rol}`
            await newLog(
                description, 
                req.ip,
                uid.id,
            )
            return res.status(403).json({error: `Intento no autorizado al departamento de: ${rol}`})
        }
        req.uid = uid;

        next();
    } catch (error) {
        console.log(error);
        return res
        .status(401)
        .send({error: TokenVerificationErrors[error.message ]})
    }
};

export const requireRefreshToken = (req, res, next) => {
    try {
        

        
        const cookieString = req.headers.cookie;
        // Buscar y extraer la parte después de "refreshToken="
        const match = cookieString.match(/refreshToken=([^;]*)/);

        if (!match || match.length < 2) {
            throw new Error("No se encontró refreshToken en las cookies");
        }

        const refreshTokenCookie = match[1];
        const { uid } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
        // console.log("Req.iud de require refresh token")
        // console.log(uid)
        req.uid = uid;
        next();
    } catch (error) {
        console.log('Error en require refresh token');
        console.log(error);
        res.status(401).json({ error: TokenVerificationErrors[error.message] });
    }
}






