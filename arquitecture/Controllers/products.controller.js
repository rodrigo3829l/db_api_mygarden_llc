import { Products } from "../models/Products.js";
import { Unit } from "../models/Unit.js";
import { Provider } from "../models/Provider.js"; // Importa el modelo de proveedores

// Función para agregar un nuevo producto
export const addProduct = async (req, res) => {
    try {
        const { product, price, provider, unit, quantity } = req.body;

        // Verificar si todos los campos necesarios están presentes
        if (!product || !price || !provider || !unit || !quantity) {
            return res.json({
                success: false,
                msg: 'Todos los campos son obligatorios'
            });
        }

        // Verificar si el producto ya existe en la base de datos
        const existProduct = await Products.findOne({ product });
        if (existProduct) {
            return res.json({
                success: false,
                msg: 'El producto ya existe en la base de datos'
            });
        }

        // Buscar el proveedor por su nombre
        const providerData = await Provider.findOne({ providerName: provider });
        if (!providerData) {
            return res.json({
                success: false,
                msg: 'El proveedor especificado no existe'
            });
        }

        // Verificar si la unidad existe en la base de datos por su nombre
        const unitData = await Unit.findOne({ name: unit });
        if (!unitData) {
            return res.json({
                success: false,
                msg: 'La unidad especificada no existe'
            });
        }

        const newProduct = new Products({
            product,
            price,
            provider: providerData._id, // Guarda el ID del proveedor
            unit: unitData._id,
            quantity
        });

        await newProduct.save();

        return res.json({
            success: true,
            msg: 'Producto agregado exitosamente'
        });

    } catch (error) {
        console.log("Error al agregar un nuevo producto:", error);
        return res.json({
            success: false,
            msg: 'Error al agregar un nuevo producto'
        });
    }
};

// Función para establecer la usabilidad de un producto por su ID
export const setProductUsability = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);

        if (!product) {
            return res.json({
                success: false,
                msg: 'Producto no encontrado'
            });
        }

        product.isUsable = !product.isUsable;
        await product.save();

        return res.json({
            success: true,
            msg: 'Estado de usabilidad del producto actualizado exitosamente',
            data: product
        });

    } catch (error) {
        console.log("Error al establecer la usabilidad del producto:", error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el estado de usabilidad del producto'
        });
    }
};


// Función para actualizar un producto por su ID
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Buscar el proveedor por su nombre si se está actualizando
        if (updateData.provider) {
            const providerData = await Provider.findOne({ providerName: updateData.provider });
            if (!providerData) {
                return res.json({
                    success: false,
                    msg: 'El proveedor especificado no existe'
                });
            }
            updateData.provider = providerData._id; // Actualiza con el ID del proveedor
        }

        // Buscar la unidad por su nombre si se está actualizando
        if (updateData.unit) {
            const unitData = await Unit.findOne({ name: updateData.unit });
            if (!unitData) {
                return res.json({
                    success: false,
                    msg: 'La unidad especificada no existe'
                });
            }
            updateData.unit = unitData._id; // Actualiza con el ID de la unidad
        }

        const updatedProduct = await Products.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedProduct) {
            return res.json({
                success: false,
                msg: 'Producto no encontrado'
            });
        }

        return res.json({
            success: true,
            msg: 'Producto actualizado exitosamente',
            data: updatedProduct
        });

    } catch (error) {
        console.log("Error al actualizar el producto:", error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el producto'
        });
    }
};

// Función para obtener todos los productos utilizables
export const getAllUsableProducts = async (req, res) => {
    try {
        const usableProducts = await Products.find({ isUsable: true })
            .populate({
                path: 'unit',
                select: 'name -_id' // Selecciona solo el campo `name` y omite `_id`
            })
            .populate({
                path: 'provider',
                select: 'providerName contact -_id' // Trae providerName y contact del proveedor
            });

        return res.json({
            success: true,
            usableProducts
        });

    } catch (error) {
        console.log("Error al obtener los productos utilizables:", error);
        return res.json({
            success: false,
            msg: 'Error al obtener los productos utilizables'
        });
    }
};

// Función para obtener todos los productos
export const getAllProducts = async (req, res) => {
    try {
        const allProducts = await Products.find()
            .populate({
                path: 'unit',
                select: 'name -_id' // Selecciona solo el campo `name` y omite `_id`
            })
            .populate({
                path: 'provider',
                select: 'providerName contact -_id' // Trae providerName y contact del proveedor
            });

        return res.json({
            success: true,
            allProducts
        });

    } catch (error) {
        console.log("Error al obtener todos los productos:", error);
        return res.json({
            success: false,
            msg: 'Error al obtener todos los productos'
        });
    }
};
