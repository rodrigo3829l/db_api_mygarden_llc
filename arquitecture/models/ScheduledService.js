import mongoose from "mongoose";

const {Schema, model} = mongoose;

const scheduleService = new Schema ({
    user: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require : true
    },
    service: {
        type: Schema.Types.ObjectId, 
        ref: 'Service',
        require : true
    },
    description : {
        type :  String,
        require : true,
    },
    img:{
        public_id: String,
        secure_url: String
    },
    status : {
        type :  String,
        default : 'quoting',
    },
    quote : {
        type : Number,
        default : 0
    },
    pending  : {
        type : Number,
        default : 0
    },
    pay : {
        porcentage : {
            type : Number,
            default : 0
        },
        totalPay : {
            type : Boolean,
            default : false
        }
    },
    // Esto se usa cuando se hace la cotizacion
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        quantity: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        }
    }],

    additionalCosts : {
        labor: { // Mano de obra
            type: Number,
            
        },
        machinery: { // Maquinaria
            type: Number,
            
        }
    },
    // De momento todas seran en linea 
    typeReserve : {
        type : String,
        enum : ['online', 'offline'],
        require : true
    },
    // De momento no se ocupa pero esta pendiente la tabla de empleados
    employeds : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    dates : {
        reserved : {
            type: Date,
            default : new Date ()
        },
        scheduledTime : Date,
        quoted : Date,
        start : Date,
        finish : Date
    },
    // De momento no se ocupa peor queda pendiente hacer la tabla
    typePay : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypePay',
    }
})

export const ScheduleService = model ('ScheduleService', scheduleService)