import mongoose from "mongoose";

const {Schema, model} = mongoose;

const answerSchema = new Schema({
    // question es la prergunta
    question: {
        type : String, 
        require : true},
    // anwer es la resopuesta
    answer: {
        type : String, 
        require : true},
})

 export const Answer = model('Answer', answerSchema) 