import { TypePay } from "../models/TypePay.js";

export const addTypePay = async (req, res) =>  {
    try {
        const {type} = req.body
        const newType = new TypePay({
            type
        })

        await newType.save()

        return res.json({
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.json({
            success: false
        })
    }
}


export const  getTypePay = async (req, res) =>{
    try {
        const type = await TypePay.find()

        if(!type){
            return res.json({
                success : false,
                msg: "No hay datos"
            })
        }

        return res.json({
            success : true,
            type
        })
    } catch (error) {
        console.log("Error al obtener los tipos de servicios")
        console.log(error)
        return res.json({
            success : false,
            msg : "Error al obtener los tipos de datos"
        })

    }
}