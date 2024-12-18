import { User } from "../models/Users.js";

import { newLog } from "../../helpers/config/log.config.js";

import { v4 as uuidv4 } from "uuid";
import {
    getToken,
    getTokenData,
    generateRefreshToken,
} from "../../helpers/middlewares/JWT.config.js";
import { sendEmail, getTemplate } from "../../helpers/config/mail.config.js";
// import {uploadImage} from "../../helpers/utils/cloudinary.js"
import { generateRandomCode } from "../../helpers/config/code.confi.js";
import { sendSms } from "../../helpers/config/sms.config.js";

export const registerOffline = async (req, res, next) => {
    try {
        const { userId, name, apellidoP, apellidoM, cellPhone, direccion, email } =
            req.body;
        console.log(req.body);

        if (userId) {
            return next();
        }
        // console.log(req.body)
        let user = await User.findOne({ email });

        if (user !== null) {
            return res.json({
                success: false,
                msg: "El correo electrónico ya está registrado.",
            });
        }

        user = await User.findOne({ cellPhone });

        if (user !== null) {
            return res.json({
                success: false,
                msg: "El número de teléfono ya está registrado.",
            });
        }
        user = new User({
            name,
            apellidoP,
            apellidoM,
            cellPhone,
            direccion,
            email,
            register: "offline",
            rol: "client",
        });

        const newUser = await user.save();
        // console.log("nuevo usuario")
        // console.log(newUser)
        // Generar token
        const { token } = getToken({ id: newUser._id });

        req.body.user = token;

        next();
    } catch (error) {
        console.log("Error en el registro offline");
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al registrar usuario offline",
        });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({ rol: "client" });

        if (!users || users.length === 0) {
            return res.json({
                success: false,
                msg: "No se encontraron usuarios con el rol especificado",
            });
        }

        return res.json({
            success: true,
            users,
        });
    } catch (error) {
        console.log("Error al obtener usuarios por rol 'client'");
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al obtener usuarios por rol",
        });
    }
};

export const getUsersOffline = async (req, res) => {
    try {
        const users = await User.find({ register: "offline" }).lean();

        if (!users || users.length === 0) {
            return res.json({
                success: false,
                msg: "No se encontraron usuarios con el rol especificado",
            });
        }

        return res.json({
            success: true,
            users: users,
        });
    } catch (error) {
        console.log("Error al obtener usuarios por rol 'client'");
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al obtener usuarios por rol",
        });
    }
};

export const signUp = async (req, res) => {
    try {
        const {
            name,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            genero,
            cellPhone,
            direccion,
            userName,
            email,
            password,
            img,
        } = req.body;

        let user = await User.findOne({ email });

        if (user !== null) {
            return res.json({
                success: false,
                msg: req.t("user.signUp.email_already_rooted"),
            });
        }

        user = await User.findOne({ userName });

        if (user !== null) {
            return res.json({
                success: false,
                msg: req.t("user.signUp.user_name_already_use"),
            });
        }

        user = await User.findOne({ cellPhone });

        if (user !== null) {
            return res.json({
                success: false,
                msg: req.t("user.signUp.cellphone_already_use"),
            });
        }

        const code = uuidv4();

        user = new User({
            name,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            genero,
            cellPhone,
            direccion,
            userName,
            email,
            password,
            code,
            img,
            rol: "client",
            lade: 52,
        });
        const { token } = getToken({ email, code });

        const template = getTemplate(
            req.t("email.confirm.titleOne"),
            req.t("email.confirm.titleTwo"),
            req.t("email.confirm.prOne"),
            req.t("email.confirm.prTwo"),
            name,
            token,
            "confirm",
            req.t("email.confirm.textAction")
        );

        await sendEmail(
            email,
            req.t("email.confirm.tittle"),
            template,
            req.t("email.confirm.tittle")
        );

        await user.save();

        return res.json({
            success: true,
            msg: req.t("user.signUp.signup_correct"),
        });
    } catch (error) {
        console.log("Error en el  registro");
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al registrar usuario",
        });
    }
};

export const getId = async (req, res) => {
    try {
        const user = await User.findById(req.uid.id).lean();

        if (!user) {
            return res.json({
                success: false,
            });
        }

        return res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al confirmar usuario",
        });
    }
};

export const confirm = async (req, res) => {
    try {
        const { token } = req.params;

        const data = getTokenData(token);

        if (data === null) {
            return res.json({
                success: false,
            });
        }

        const { email, code } = data.uid;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
            });
        }

        // Calcula la diferencia de tiempo en minutos
        const diffInMinutes = (new Date() - user.creation) / 1000 / 60;
        console.log(diffInMinutes);
        if (diffInMinutes > 9) {
            const code = uuidv4();
            const { token } = getToken({ email, code });

            const template = getTemplate(
                req.t("email.confirm.titleOne"),
                req.t("email.confirm.titleTwo"),
                req.t("email.confirm.prOne"),
                req.t("email.confirm.prTwo"),
                user.name,
                token,
                "confirm",
                req.t("email.confirm.textAction")
            );

            await sendEmail(
                email,
                req.t("email.confirm.tittle"),
                template,
                req.t("email.confirm.tittle")
            );

            // const template = getTemplate(
            //     user.name,
            //     token,
            //     "confirm"
            // )

            // await sendEmail(
            //     email,
            //     'Confirm acount',
            //     template,
            //     "Confirm your acount"
            // )
            user.creation = new Date();
            user.code = code;
            await user.save();
            // return res.redirect('https://mygardenllcservices.com/resendemail')
            return res.redirect("https://mygardenllcservices.com/resendemail");
        }

        if (code !== user.code) {
            // return res.redirect('https://mygardenllcservices.com/notverified')
            return res.redirect("https://mygardenllcservices.com/notverified");
        }

        user.verified = "VERIFIED";
        await user.save();

        // return res.redirect('https://mygardenllcservices.com/successverified')
        return res.redirect("https://mygardenllcservices.com/successverified");
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al confirmar usuario",
        });
    }
};

export const recoverPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
            });
        }

        const code = generateRandomCode();
        user.code = code;

        const { token } = getToken({ email });

        await user.save();

        const template = getTemplate(
            req.t("email.recover.titleOne"),
            req.t("email.recover.titleTwo"),
            req.t("email.recover.prOne"),
            req.t("email.recover.prTwo"),
            user.name,
            code,
            "recover",
            req.t("email.recover.textAction")
        );

        await sendEmail(
            email,
            req.t("email.recover.tittle"),
            template,
            req.t("email.recover.tittle")
        );

        return res.json({
            success: true,
            token,
            code,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error de recuperacion de contraseña",
        });
    }
};

export const recoverSms = async (req, res) => {
    try {
        const { cellPhone } = req.body;
        const user = await User.findOne({ cellPhone });
        if (!user) {
            return res.json({
                success: false,
                msg: "usuario no encontrado",
            });
        }
        const code = generateRandomCode();
        user.code = code;
        await user.save();
        const email = user.email;
        const { token } = getToken({ email });

        const data = await sendSms(code, user.lade, cellPhone);

        if (data.error === true) {
            return res.json({
                success: false,
                msg: data.mensaje_error,
            });
        }
        console.log(data);
        return res.json({
            success: true,
            token,
        });
    } catch (error) {
        console.log("Error al enviar el mensaje");
        console.log(error);
        return res.json({
            success: false,
            msg: "Error de recuperacion de contraseña",
        });
    }
};

export const verifyCode = async (req, res) => {
    try {
        const { token, code } = req.body;

        const data = getTokenData(token);

        if (data === null) {
            return res.json({
                success: false,
            });
        }

        const { email } = data.uid;

        const user = await User.findOne({ email });

        if (user === null) {
            return res.json({
                success: false,
            });
        }

        if (user.code !== code) {
            return res.json({
                success: false,
            });
        }

        return res.json({
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al Verificar Codigo",
        });
    }
};

export const resendcode = async (req, res) => {
    try {
        const { token } = req.body;

        const data = getTokenData(token);

        if (data === null) {
            return res.json({
                success: false,
                msg: "Error al obtener data",
            });
        }

        const { email } = data.uid;
        const user = await User.findOne({ email });
        if (user === null) {
            return res.json({
                success: false,
                msg: "El correo no existe",
            });
        }

        const code = generateRandomCode();
        user.code = code;

        await user.save();

        const template = getTemplate(
            req.t("email.recover.titleOne"),
            req.t("email.recover.titleTwo"),
            req.t("email.recover.prOne"),
            req.t("email.recover.prTwo"),
            user.name,
            code,
            "recover",
            req.t("email.recover.textAction")
        );

        await sendEmail(
            email,
            req.t("email.recover.tittle"),
            template,
            req.t("email.recover.tittle")
        );

        return res.json({
            success: true,
            msg: "Codigo enviado correctamente",
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al Verificar Codigo",
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const data = getTokenData(token);

        if (data === null) {
            return res.json({
                success: false,
                msg: "Error al obtener data",
            });
        }

        const { email } = data.uid;

        const user = await User.findOne({ email });
        if (user === null) {
            return res.json({
                success: false,
                msg: "El correo no existe",
            });
        }
        user.lastPassword = new Date();
        user.password = password;
        await user.save();
        return res.json({
            success: true,
            msg: "Contraseña cambiada con exito",
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al Cambiar contraseña",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, department, fcmToken, platform } = req.body;

        if (!fcmToken || !platform) {
            return res.status(403).json({ error: "Not provided fcmToken" });
        }
        console.log(fcmToken)
        let user = await User.findOne({ email });

        if (!user) {
            if (department === "finance") {
                const description =
                    "Intento de acceso fallido, no hay usuario el nombre de usuario, telefono o email";
                await newLog(description, req.ip, null);
            }
            return res.status(403).json({ error: req.t("user.login.invalid_email") });
        }

        if (user.intentsFailBlocked === 5)
            return res
                .status(403)
                .json({ error: req.t("user.login.blocked_account") });

        if (user.lastIntent) {
            const difference = new Date() - user.lastIntent;
            const differenceInSeconds = Math.abs(difference) / 1000; // Convertir a segundos

            if (differenceInSeconds < 60) {
                // Si la diferencia es menor a 60 segundos
                const remainingSeconds = Math.ceil(60 - differenceInSeconds); // Calcular segundos restantes
                return res.status(403).json({
                    error: `${req.t(
                        "user.login.many_attempts"
                    )} ${remainingSeconds} ${req.t("user.login.seconds")}`,
                });
            } else {
                user.intentos = 0;
                user.lastIntent = null;
                await user.save();
            }
        }

        const respuestaPassword = await user.comparePassword(password);
        if (!respuestaPassword) {
            if (department === "finance") {
                const description =
                    "Intento de acceso fallido al departamento de finanzas";
                await newLog(description, req.ip, user._id);
            }
            user.intentos++;
            user.intentsFailBlocked++;
            if (user.intentos >= 3) {
                user.lastIntent = new Date();

                const template = getTemplate(
                    req.t("email.warning.titleOne"),
                    req.t("email.warning.titleTwo"),
                    req.t("email.warning.prOne"),
                    req.t("email.warning.prTwo"),
                    user.name,
                    null,
                    "warning",
                    req.t("email.warning.textAction")
                );

                await sendEmail(
                    email,
                    req.t("email.warning.tittle"),
                    template,
                    req.t("email.warning.tittle")
                );
            }
            if (user.intentsFailBlocked >= 5) {
                user.status = "BLOCKED";
                const code = uuidv4();
                user.code = code;
                const { token } = getToken({ email, code });

                const template = getTemplate(
                    req.t("email.reactivated.titleOne"),
                    req.t("email.reactivated.titleTwo"),
                    req.t("email.reactivated.prOne"),
                    req.t("email.reactivated.prTwo"),
                    user.name,
                    token,
                    "reactivated",
                    req.t("email.reactivated.textAction")
                );

                await sendEmail(
                    email,
                    req.t("email.reactivated.tittle"),
                    template,
                    req.t("email.reactivated.tittle")
                );

                await user.save();
            }
            await user.save();
            return res
                .status(403)
                .json({ error: req.t("user.login.invalid_password") });
        }

        if (user.verified === "UNVERIFIED")
            return res.status(403).json({ error: req.t("user.login.not_verified") });

        if (user.userStatus === "DISABLED") {
            user.userStatus = "ENABLED";
            await user.save();
        }
        const id = user.id;
        const userRol = user.rol;
        //generar el jwt token
        const { token, expiresIn } = getToken({ id, userRol });

        generateRefreshToken({ id, userRol }, res);
        // ya hize login
        if (department === "finance") {
            const description = "Intento de acceso correcto de finanzas";
            await newLog(description, req.ip, user._id);
        }

        user.intentos = 0;
        user.intentsFailBlocked = 0;
        user.lastIntent = null;
        user.lastLogin = new Date();
        const existingToken = user.fcmTokens.find(
            (tokenObj) => tokenObj.platform === platform
        );

        if (existingToken) {
            // Si el token ya existe para la plataforma, actualízalo
            existingToken.token = fcmToken;
            existingToken.lastUpdated = new Date();
            console.log(`Token FCM actualizado para ${platform}`);
        } else {
            // Si no existe un token para esta plataforma, agrégalo
            user.fcmTokens.push({ token: fcmToken, platform });
            console.log(`Nuevo token FCM agregado para ${platform}`);
        }
        await user.save();
        return res.json({
            token,
            expiresIn,
            name: `${user.name} ${user.apellidoP} ${user.apellidoM}`,
            email: user.email,
            rol: user.rol,
            image: user.img
                ? user.img.secure_url
                : "https://cdn-icons-png.flaticon.com/128/5024/5024561.png",
        });
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al hacer el logeo",
        });
    }
};

export const recoverCount = async (req, res) => {
    try {
        const { token } = req.params;

        const data = getTokenData(token);
        if (data === null) {
            return res.json({
                success: false,
                msg: "Error al obtener data",
            });
        }

        const { email, code } = data.uid;

        const user = await User.findOne({ email });

        if (user === null) {
            return res.json({
                success: false,
                msg: "El usuario no existe",
            });
        }

        if (code !== user.code) {
            // return res.redirect('https://mygardenllcservices.com/notverified')
            return res.redirect("https://mygardenllcservices.com/notverified");
        }

        user.status = "DISBLOCKED";
        user.intentsFailBlocked = 0;
        user.intentos = 0;
        user.lastIntent = null;
        await user.save();

        // return res.redirect('https://mygardenllcservices.com/recover')
        return res.redirect("https://mygardenllcservices.com/recover");
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al confirmar usuario",
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("refreshToken", {
        path: "/",
        httpOnly: process.env.MODO === "developer",
        secure: process.env.MODO !== "developer",
    });
    res.json({ ok: "logout" });
    try {
        // res.clearCookie('refreshToken')
    } catch (error) {
        console.log(error);
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { token, expiresIn } = getToken(req.uid);
        const { uid } = getTokenData(token);
        const user = await User.findById(uid.id);
        return res.json({
            token,
            expiresIn,
            name: `${user.name} ${user.apellidoP} ${user.apellidoM}`,
            email: user.email,
            rol: user.rol,
            image: user.img
                ? user.img.secure_url
                : "https://cdn-icons-png.flaticon.com/128/5024/5024561.png",
        });
    } catch (error) {
        console.log("error en la funcion refresh token");
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
};

export const infoUser = async (req, res) => {
    try {
        const user = await User.findById(req.uid.id).lean();

        return res.json({
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Error de servidor" });
    }
};

export const addEmpolyed = async (req, res) => {
    try {
        const {
            name,
            apellidoP,
            apellidoM,
            genero,
            cellPhone,
            email,
            password,
            direccion,
            userName,
            rol,
            lade,
        } = req.body;

        let user = await User.findOne({ email });

        if (user !== null) {
            return res.json({
                success: false,
                msg: "Este correo ya esta asociado a otro empleado",
            });
        }

        user = await User.findOne({ cellPhone });

        if (user !== null) {
            return res.json({
                success: false,
                msg: "Este telefono ya esta asociado a otro empleado",
            });
        }

        user = new User({
            name,
            apellidoP,
            apellidoM,
            genero,
            cellPhone,
            direccion,
            email,
            userName,
            password,
            rol,
            lade,
            verified: "VERIFIED",
        });

        await user.save();

        return res.json({
            success: true,
            msg: "Registro de empleado correcto",
        });
    } catch (error) {
        console.log("Error en el  registro del empleado");
        console.log(error);
        return res.json({
            success: false,
            msg: "Error al registrar empleado",
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const updateData = req.body;

        // Verificar si el celular ya existe
        if (updateData.cellphone) {
            const existingCellphoneUser = await User.findOne({
                cellphone: updateData.cellphone,
            });
            if (
                existingCellphoneUser &&
                existingCellphoneUser._id.toString() !== req.uid.id
            ) {
                return res.json({
                    success: false,
                    msg: "Cellphone already exists",
                });
            }
        }

        // Verificar si el email ya existe
        if (updateData.email) {
            const existingEmailUser = await User.findOne({ email: updateData.email });
            if (
                existingEmailUser &&
                existingEmailUser._id.toString() !== req.uid.id
            ) {
                return res.json({
                    success: false,
                    msg: "Email already exists",
                });
            }
        }

        // Verificar si el nombre de usuario ya existe
        if (updateData.userName) {
            const existingUserNameUser = await User.findOne({
                userName: updateData.userName,
            });
            if (
                existingUserNameUser &&
                existingUserNameUser._id.toString() !== req.uid.id
            ) {
                return res.json({
                    success: false,
                    msg: "Username already exists",
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(req.uid.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedUser) {
            return res.json({
                success: false,
                msg: "User not found",
            });
        }

        return res.json({
            success: true,
            msg: "User updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.log("Error updating user", error);

        return res.json({
            success: false,
            msg: "Error updating user",
        });
    }
};
