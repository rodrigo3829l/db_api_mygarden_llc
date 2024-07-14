import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productsSchema = new Schema({
    product: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'Unit',
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    provider: {
        type: Schema.Types.ObjectId, // Cambiado a ObjectId para guardar el ID del proveedor
        ref: 'Provider', // Referencia al modelo de proveedores
        required: true
    },
    isUsable: {
        type: Boolean,
        default: true
    }
});

export const Products = model('Products', productsSchema);
