import mongoose from "mongoose";

const {Schema, model} = mongoose;

const dates = new Schema ({
    date : Date
})

export const Dates = model ('Dates', dates)