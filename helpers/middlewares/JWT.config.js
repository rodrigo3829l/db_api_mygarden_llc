import jwt from "jsonwebtoken"

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
            secure: !(process.env.MODO === "developer"),
            expires: new Date(Date.now() + expiresIn * 1000),
            // sameSite : 'none'
        })
    } catch (error) {
        console.log(error)
    }
} 
export const requireRefreshToken = (req, res, next) => {
    try {
        console.log(req.headers.cookie);
        const cookieString = req.headers.cookie;

        // Buscar y extraer la parte después de "refreshToken="
        const match = cookieString.match(/refreshToken=([^;]*)/);

        if (!match || match.length < 2) {
            throw new Error("No se encontró refreshToken en las cookies");
        }

        const refreshTokenCookie = match[1];
        console.log(refreshTokenCookie);

        const { uid } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);
        req.uid = uid;
        next();
    } catch (error) {
        console.log('Error en require refresh token');
        console.log(error);
        res.status(401).json({ error: TokenVerificationErrors[error.message] });
    }
}




export const requireToken = (req, res, next) => {
    try {
        let token = req.headers?.authorization ;
        if(!token) 
            throw new Error('No Bearer');

        token = token.split(" ")[1];

        const {uid} = jwt.verify(token, process.env.JWT_SECRET)
        console.log("uid de require token => " + uid)
        req.uid = uid;

        next();
    } catch (error) {
        console.log(error);
        return res
        .status(401)
        .send({error: TokenVerificationErrors[error.message ]})
    }
};

