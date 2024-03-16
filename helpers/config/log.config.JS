import { Logs } from "../../arquitecture/models/Logs";

export const newLog = async (description, ipDirection, date, user) =>{
    try {
        const log = new Logs({
            description, ipDirection, date, user
        })
        await log.save()
        return log
    } catch (error) {
        console.log(error)
    }
}