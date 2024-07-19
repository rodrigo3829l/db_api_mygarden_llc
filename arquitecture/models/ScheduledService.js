import mongoose from "mongoose";

const {Schema, model} = mongoose;

const scheduleService = new Schema ({
    user: { // id del usuario
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require : true
    },
    service: { //id del servicio que agendo
        type: Schema.Types.ObjectId, 
        ref: 'Service',
        require : true
    },
    description : { //la descripcion que dejo el usuario
        type :  String,
        require : true,
    },
    img:{ // la imagen del servicio
        public_id: String,
        secure_url: String
    },
    status : { //el estatus de su servicio agendado
        type :  String,
        default : 'quoting',
    },
    quote : { //la cotizacion del servicio agendado
        type : Number,
        default : 0
    },
    pending  : { // el pago pendiente del servicio agendado
        type : Number,
        default : 0
    },
    pay : { // si ya pago el servicio agendado y el porcentaje de pagi
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
    products: [{ // los productos usados en el servicio agendado
        product: { // los productos usados en el servicio agendado
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
        },
        quantity: { // la cantiddad del producto
            type: Number,
            required: true
        },
        total: { // el total
            type: Number,
            required: true
        }
    }],

    additionalCosts : { // costos adicionales del producto agendado
        labor: { // Mano de obra
            type: Number,
            
        },
        machinery: { // Maquinaria
            type: Number,
            
        }
    },
    // De momento todas seran en linea 
    typeReserve : { // tipo de reserva
        type : String,
        enum : ['online', 'offline'],
        require : true
    },
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
    typePay : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TypePay',
    },
    visitor: {
        type: Schema.Types.ObjectId, 
        ref: 'User',
        require : true
    },
})

export const ScheduleService = model ('ScheduleService', scheduleService)