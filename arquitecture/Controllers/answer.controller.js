import { Answer } from "../models/Answers.js";


export const getAnswers = async (request, response) => {
    try {
        const asnwers = await Answer.find()

        if(!asnwers){
            return response.json({
                success : false,
                msg : 'No se pudo obtener las preguntas'
            })
        }

        return response.json({
            success : true,
            msg : 'Preguntas obtenidas',
            asnwers
        })

    } catch (error) {
        console.log('error asl obteber las preguntas')
        console.log(error)
    }
}

export const addAnwer = async (request, response) => {
    try {
        const {pregunta, respuesta} = request.body

        // const existAnswer = await Answer.find({question :  pregunta})
        // si existe la pregunta lo retrono y le digo con un mensaje que ya existe es apregunta
        
        const newAsnwer = new Answer({
            question : pregunta,
            answer : respuesta
        })

        await newAsnwer.save()

        return response.json({
            success :  true,
            msg : 'Pregunta agregada'
        })
    } catch (error) {
        console.log('error asl agregar una pregunta')
        console.log(error)
    }
}

export const removeAnswer = async (request, response) => {
    try {
        const {id} = request.params

        const deleteAnswer = await Answer.findByIdAndDelete(id)

        if(!deleteAnswer){
            return response.json({
                success : false,
                msg : 'No se pudo eliminar'
            })
        }

        return response.json({
            success : true,
            msg : 'Pregunta elimnada con exito'
        })

    } catch (error) {
        console.log('error asl eliminar una pregunta')
        console.log(error)
    }
}

export const updateAnswer = async (request, response) => {
    try {
        const {id} = request.params
        const datos = request.body
        // el vody trae la preungta y la respuesta
        const answer = await Answer.findByIdAndUpdate(id, datos)
        // null
        if(!answer){
            return response.json({
                success : false,
                msg : 'No se pudo editar'
            })
        }

        return response.json({
            success : true,
            msg : 'Pregunta editada con exito'
        })
    } catch (error) {
        console.log('error asl editar una pregunta')
        console.log(error)
    }
}