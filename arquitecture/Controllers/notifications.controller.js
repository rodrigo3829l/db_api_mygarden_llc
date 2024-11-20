import { Notification } from "../models/NotificationsServices.js";
import { User } from "../models/Users.js";
import { sendNotification } from "../../helpers/config/firebaseMessagingService.js";

// Controller to create a new notification
export const createNotification = async (req, res) => {
    try {
        const { userId, type, serviceId, message, tittle } = req.body;

        // Crear la nueva notificación
        let notification = new Notification({
            userId,
            type,
            serviceId,
            message,
            tittle,
        });

        // Guardar la notificación
        await notification.save();

        // Realizar populate de los campos necesarios
        const notificationData = await Notification.findById(notification._id)
            .populate({
                path: "userId",
                select: "name apellidoP apellidoM email" // Información del usuario
            })
            .populate({
                path: "serviceId",
                select: "description status quote pending service", // Información del servicio agendado
                populate: {
                    path: "service", // Aquí se hace el populate del campo `service` dentro de `ScheduleService`
                    select: "name description price category" // Campos del servicio que quieres obtener
                }
            }); // Populate service information

        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                msg: "User not found"
            });
        }

        // Filtrar los tokens por plataforma (web y mobile)
        const webTokens = user.fcmTokens
            .filter((tokenObj) => tokenObj.platform === "web")
            .map((tokenObj) => tokenObj.token);

        const mobileTokens = user.fcmTokens
            .filter((tokenObj) => tokenObj.platform === "mobile")
            .map((tokenObj) => tokenObj.token);

        if (webTokens.length === 0 && mobileTokens.length === 0) {
            console.log("No se encontraron tokens FCM para ninguna plataforma.");
            return res.status(404).json({ success: false, msg: "No FCM tokens found for any platform" });
        }

        // Configurar el payload de la notificacion
        const payload = {
            notification: {
                title: tittle,
                body: message,
            },
            data: {
                type,
                serviceId: serviceId.toString(),
            },
        };
        try {
            if (webTokens.length > 0) {
                // console.log("Token movil")
                // console.log(webTokens)
                console.log(`Intentando enciar notificacion a ${webTokens.length} dispositivos móviles.`);
                await sendNotification(webTokens, payload);
                console.log(`Notificación enviada a ${webTokens.length} dispositivos web.`);
            }

            if (mobileTokens.length > 0) {
                console.log(`Intentando enciar notificacion a ${mobileTokens.length} dispositivos móviles.`);
                await sendNotification(mobileTokens, payload);
                console.log(`Notificación enviada a ${mobileTokens.length} dispositivos móviles.`);
            }

            return res.json({
                success: true,
                msg: "Notification created successfully",
                notificationData,
            });
        } catch (error) {
            console.error('Error al enviar notificación:', error.message);
            return res.status(500).json({
                success: false,
                msg: "Error sending notification",
            });
        }
    } catch (error) {
        console.log("Error creating notification", error);
        return res.json({
            success: false,
            msg: "Error creating notification",
        });
    }
};

export const createNewNotification = async (userId, type, serviceId, message, tittle) => {
    try {
        // Crear la nueva notificación
        const notification = new Notification({
            userId,
            type,
            serviceId,
            message,
            tittle,
        });

        // Guardar la notificación en la base de datos
        await notification.save();

        // Realizar populate de los campos necesarios
        const notificationData = await Notification.findById(notification._id)
            .populate({
                path: "userId",
                select: "name apellidoP apellidoM email", // Información del usuario
            })
            .populate({
                path: "serviceId",
                select: "description status quote pending service", // Información del servicio agendado
                populate: {
                    path: "service", // Populate del campo `service` dentro de `ScheduleService`
                    select: "name description price category", // Campos del servicio
                },
            });

        // Buscar al usuario
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                msg: "User not found",
            };
        }

        // Filtrar los tokens por plataforma (web y mobile)
        const webTokens = user.fcmTokens
            .filter((tokenObj) => tokenObj.platform === "web")
            .map((tokenObj) => tokenObj.token);

        const mobileTokens = user.fcmTokens
            .filter((tokenObj) => tokenObj.platform === "mobile")
            .map((tokenObj) => tokenObj.token);

        if (webTokens.length === 0 && mobileTokens.length === 0) {
            console.log("No se encontraron tokens FCM para ninguna plataforma.");
            return {
                success: false,
                msg: "No FCM tokens found for any platform",
            };
        }

        // Configurar el payload de la notificación
        const payload = {
            notification: {
                title: tittle,
                body: message,
            },
            data: {
                type,
                serviceId: serviceId.toString(),
            },
        };

        try {
            if (webTokens.length > 0) {
                console.log(`Intentando enviar notificación a ${webTokens.length} dispositivos web.`);
                await sendNotification(webTokens, payload);
                console.log(`Notificación enviada a ${webTokens.length} dispositivos web.`);
            }

            if (mobileTokens.length > 0) {
                console.log(`Intentando enviar notificación a ${mobileTokens.length} dispositivos móviles.`);
                await sendNotification(mobileTokens, payload);
                console.log(`Notificación enviada a ${mobileTokens.length} dispositivos móviles.`);
            }

            return {
                success: true,
                msg: "Notification created successfully",
                notificationData,
            };
        } catch (error) {
            console.error('Error al enviar notificación:', error.message);
            return {
                success: false,
                msg: "Error sending notification",
            };
        }
    } catch (error) {
        console.error("Error creating notification", error);
        return {
            success: false,
            msg: "Error creating notification",
        };
    }
};

// Controller to get all notifications for a specific user
export const getNotificationsByUser = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.uid.id })
            .populate({
                path: "userId",
                select: "name apellidoP apellidoM email" // Información del usuario
            })
            .populate({
                path: "serviceId",
                select: "description status quote pending service", // Información del servicio agendado
                populate: {
                    path: "service", // Aquí se hace el populate del campo `service` dentro de `ScheduleService`
                    select: "name description price category" // Campos del servicio que quieres obtener
                }
            });

        if (!notifications.length) {
            return res.json({
                success: false,
                msg: "No notifications found for this user",
            });
        }

        return res.json({
            success: true,
            notifications,
        });
    } catch (error) {
        console.log("Error fetching notifications", error);
        return res.json({
            success: false,
            msg: "Error fetching notifications",
        });
    }
};

// Controller to delete a specific notification by its ID
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);

        if (!notification) {
            return res.json({
                success: false,
                msg: "Notification not found",
            });
        }

        return res.json({
            success: true,
            msg: "Notification deleted successfully",
        });
    } catch (error) {
        console.log("Error deleting notification", error);
        return res.json({
            success: false,
            msg: "Error deleting notification",
        });
    }
};

// Controller to delete all notifications for a specific user
export const deleteAllNotificationsByUser = async (req, res) => {
    try {
        const userId = req.uid.id;
        const deleted = await Notification.deleteMany({ userId });

        if (deleted.deletedCount === 0) {
            return res.json({
                success: false,
                msg: "No notifications found for this user to delete",
            });
        }

        return res.json({
            success: true,
            msg: "All notifications for the user have been deleted",
        });
    } catch (error) {
        console.log("Error deleting notifications", error);
        return res.json({
            success: false,
            msg: "Error deleting notifications",
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the notification by ID and update the "read" status
        const notification = await Notification.findByIdAndUpdate(
            id,
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.json({
                success: false,
                msg: "Notification not found",
            });
        }

        return res.json({
            success: true,
            msg: "Notification marked as read",
            notification,
        });
    } catch (error) {
        console.log("Error marking notification as read", error);
        return res.json({
            success: false,
            msg: "Error marking notification as read",
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.uid.id;

        // Update all notifications for the given user to "read: true"
        const result = await Notification.updateMany(
            { userId, read: false },
            { read: true }
        );

        if (result.nModified === 0) {
            return res.json({
                success: false,
                msg: "No unread notifications found for this user",
            });
        }

        return res.json({
            success: true,
            msg: "All notifications marked as read",
        });
    } catch (error) {
        console.log("Error marking all notifications as read", error);
        return res.json({
            success: false,
            msg: "Error marking all notifications as read",
        });
    }
};
