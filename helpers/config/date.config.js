import { Dates } from "../../arquitecture/models/Dates.js";

export const addDate = async (fecha) =>{
    try {
        const existingDate = await Dates.findOne({ date: fecha });

        if (existingDate) {
            return res.json({
                success: false,
                msg:  req.t('dates.addDate.existDate')
            });
        }

        const newDate = new Dates({
            date : fecha
        })

        await newDate.save()

    } catch (error) {
        console.log(error)
        
    }
}