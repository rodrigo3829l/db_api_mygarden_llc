import { Notification } from "../models/NotificationsServices.js";

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
        notification = await Notification.findById(notification._id)
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

        return res.json({
            success: true,
            msg: "Notification created successfully",
            notification, // Retornar la notificación completa
        });
    } catch (error) {
        console.log("Error creating notification", error);
        return res.json({
            success: false,
            msg: "Error creating notification",
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
