import mongoose from "mongoose";

const {Schema, model} = mongoose;

const providerSchema = new Schema({
    providerName: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    usable: {
        type: Boolean,
        default: true
    }
});

export const Provider = model('Provider', providerSchema);
