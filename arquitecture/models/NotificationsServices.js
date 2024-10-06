import mongoose from "mongoose";

const {Schema, model} = mongoose;

const notificationSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // El usuario que recibe la notificación
  type: { 
    type: String, 
    enum: ['serviceScheduled', 'serviceQuoted', 'serviceCancelled', 'serviceRescheduled', 'servicePaid', 'upcomingVisit'],
    required: true 
  }, // Tipo de evento
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduleService', required: true }, // Servicio relacionado a la notificación
  message: { type: String, required: true }, // Mensaje personalizado de la notificación
  tittle: { type: String, required: true }, // Mensaje personalizado de la notificación
  read: { type: Boolean, default: false }, // Estado de lectura de la notificación
  createdAt: { type: Date, default: Date.now }, // Fecha de creación
});

export const Notification = model('Notification', notificationSchema);
