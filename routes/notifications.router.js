import express from "express";
import {
    createNotification,
    getNotificationsByUser,
    deleteNotification,
    deleteAllNotificationsByUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../arquitecture/Controllers/notifications.controller.js";
import { requireToken } from "../helpers/middlewares/JWT.config.js";

const router = express.Router();

// Modificación: Pasar `io` al controlador de notificaciones

router.get("/notifications", requireToken, getNotificationsByUser);

router.post("/create", (req, res) => createNotification(req, res, io)); // Modificado para incluir io

router.delete("/delete/:id", deleteNotification);

router.put("/mark/:id", markNotificationAsRead);

router.delete("/delete-all", requireToken, deleteAllNotificationsByUser);
router.put("/read-all", requireToken, markAllNotificationsAsRead);

export default router
