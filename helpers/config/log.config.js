import { Logs } from "../../arquitecture/models/Logs.js";

export const newLog = async (description, ipDirection, user) =>{
    try {
        const log = new Logs({
            description, ipDirection, user
        })
        await log.save()
    } catch (error) {
        console.log(error)
    }
}
