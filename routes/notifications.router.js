import express from 'express';
import { createNotification, getNotificationsByUser, deleteNotification, deleteAllNotificationsByUser, markNotificationAsRead, markAllNotificationsAsRead } from '../arquitecture/Controllers/notifications.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';

const router = express.Router();

// Modificación: Pasar `io` al controlador de notificaciones
export default (io) => {
  router.get('/notifications', getNotificationsByUser);

  router.post('/create', (req, res) => createNotification(req, res, io)); // Modificado para incluir io

  router.delete('/notifications/:id', deleteNotification);

  router.delete('/notifications/user', requireToken, deleteAllNotificationsByUser);

  router.put('/notifications/:id', markNotificationAsRead);

  router.put('/notifications/read-all', requireToken, markAllNotificationsAsRead);

  return router;
};
