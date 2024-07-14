import mongoose from "mongoose";

const { Schema, model } = mongoose;

const unitSchema = new Schema({
    name: {
        type: String,
        required: true
    },
});

export const Unit = model('Unit', unitSchema);
