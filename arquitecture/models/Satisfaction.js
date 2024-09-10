import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Definir el esquema de satisfacción
const satisfactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // Referencia al usuario
  question1: { type: Number, required: true },  // Respuesta a la pregunta 1
  question2: { type: Number, required: true },  // Respuesta a la pregunta 2
  question3: { type: Number, required: true },  // Respuesta a la pregunta 3
  satisfactionLevel: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },  // Nivel de satisfacción calculado
  createdAt: { type: Date, default: Date.now }  // Fecha de creación
});

// Crear el modelo de Satisfacción
export const Satisfaction = model('Satisfaction', satisfactionSchema);
