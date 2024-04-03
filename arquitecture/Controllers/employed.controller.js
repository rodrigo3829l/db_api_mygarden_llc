        import { User } from "../models/Users.js"
import { ScheduleService } from "../models/ScheduledService.js"


export const getEmployeds = async (req, res) =>{
    try {
        const employeds = await User.find({rol: 'employed'})

        return res.json({
            success : true,
            employeds
        })
    } catch (error) {
        console.log(error)
        console.log("Error al obtener empleados")
    }
}



export const getServicesByEmployee = async (req, res) => {
    try {
        const employeeId = req.uid.id;
        // const employeeId = req.body.id

        const services = await ScheduleService.find({ employeds: employeeId })
                                                .populate('service', {
                                                name : 1,
                                                _id : 0
                                               })
                                            
        if(!services){
            return res.json({
                success: false,
                msg : 'Fallo al traer los servicios'
            });
        }
        
        return res.json({
            success: true,
            services
        });
    } catch (error) {
        console.error(error); // Es importante manejar correctamente los errores
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los servicios del empleado'
        });
    }
};
