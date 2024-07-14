import mongoose from "mongoose";

const { Schema, model } = mongoose;

const featuredProjectSchema = new Schema({
    scheduleService: {
        type: Schema.Types.ObjectId,
        ref: 'ScheduleService',
        required: true
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    images: [{
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true }
    }],
    description: {
        type: String,
        required: true
    }
});

export const FeaturedProject = model('FeaturedProject', featuredProjectSchema);
