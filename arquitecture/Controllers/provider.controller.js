import { Provider } from "../models/Provider.js";
// Agregar un proveedor
export const addProvider = async (req, res, next) => {
    try {
        const { providerName, contact } = req.body;
        const provider = new Provider({
            providerName,
            contact
        });
        await provider.save();
        res.json({ success: true, data: provider });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Eliminar un proveedor o cambiar su estado de usable
export const toggleUsable = async (req, res, next) => {
    try {
        const id = req.params.id;
        const provider = await Provider.findById(id);
        if (!provider) {
            return res.json({
                success: false,
                msg: 'Proveedor no encontrado'
            });
        }
        provider.usable = !provider.usable;
        await provider.save();
        res.json({ success: true, data: provider });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Editar un proveedor
export const editProvider = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { providerName, contact } = req.body;
        const provider = await Provider.findByIdAndUpdate(id, { providerName, contact }, { new: true });
        if (!provider) {
            return res.json({
                success: false,
                msg: 'Proveedor no encontrado'
            });
        }
        res.json({ success: true, data: provider });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Obtener todos los proveedores
export const getAllProviders = async (req, res, next) => {
    try {
        const providers = await Provider.find();
        res.json({ success: true, data: providers });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};

// Obtener proveedores activos (usable = true)
export const getActiveProviders = async (req, res, next) => {
    try {
        const activeProviders = await Provider.find({ usable: true });
        res.json({ success: true, data: activeProviders });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
};