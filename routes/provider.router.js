import express from 'express';
const router = express.Router();
import { addProvider, toggleUsable, editProvider, getAllProviders, getActiveProviders } from '../arquitecture/Controllers/provider.controller.js';
import { requireToken } from '../helpers/middlewares/JWT.config.js';

// Ruta para agregar un proveedor
router.post('/add', requireToken ,addProvider);

// Ruta para eliminar o cambiar el estado de usable de un proveedor
router.put('/toggle/:id', requireToken, toggleUsable);

// Ruta para editar un proveedor
router.put('/edit/:id', requireToken, editProvider);

// Ruta para obtener todos los proveedores
router.get('/get', getAllProviders);

// Ruta para obtener solo los proveedores activos (usable = true)
router.get('/getActive', getActiveProviders);

export default router;
