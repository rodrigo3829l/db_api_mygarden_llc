import { User } from "../models/Users.js"
import { ScheduleService } from "../models/ScheduledService.js"
import { deleteImage } from '../../helpers/utils/cloudinaryFunctions.js';

export const getEmployeds = async (req, res) =>{
    try {
        const roles = ['employed', 'finance', 'visitor'];
        const employeds = await User.find({ rol: { $in: roles } });
        // const employeds = await User.find({rol: 'employed'})

        return res.json({
            success : true,
            employeds
        })
    } catch (error) {
        console.log(error)
        console.log("Error al obtener empleados")
    }
}

export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id)
        const employee = await User.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        return res.json({
            success: true,
            employee
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el empleado'
        });
    }
};



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

export const registerEmployee = async (req, res) => {
    try {
        const {
            name,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            genero,
            cellPhone,
            lade,
            img,
            direccion,
            userName,
            email,
            password,
            rol
        } = req.body;
        console.log(req.body)
        // Verificar que todos los campos requeridos están presentes
        if (!name || !apellidoP || !apellidoM || !userName || !email || !password || !rol) {
            await deleteImage(img.public_id);
            return res.json({
                success: false,
                message: 'Por favor, provea todos los campos requeridos'
            });
        }

        // Verificar si el userName ya existe
        const userNameExists = await User.findOne({ userName });
        if (userNameExists) {
            await deleteImage(img.public_id);
            return res.json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        // Verificar si el email ya existe
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            await deleteImage(img.public_id);
            return res.json({
                success: false,
                message: 'El correo electrónico ya está en uso'
            });
        }

        // Verificar si el cellPhone ya existe
        const cellPhoneExists = await User.findOne({ cellPhone });
        if (cellPhoneExists) {
            await deleteImage(img.public_id);
            return res.json({
                success: false,
                message: 'El número de teléfono ya está en uso'
            });
        }

        // Crear un nuevo usuario
        const newUser = new User({
            name,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            genero,
            cellPhone,
            lade,
            img,
            direccion,
            userName,
            email,
            password,
            rol,
            // Campos que se establecen automáticamente con valores por defecto
            status: 'hired',
            userStatus: 'ENABLED',
            verified: 'VERIFIED',
        });

        // Guardar el nuevo usuario en la base de datos
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: 'Empleado registrado exitosamente',
            employee: newUser
        });
    } catch (error) {
        await deleteImage(img.public_id);
        console.error(error);
        return res.json({
            success: false,
            message: 'Error al registrar el empleado'
        });
    }
};


export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Opciones para devolver el documento actualizado y ejecutar validaciones
        const options = { new: true, runValidators: true };

        // Actualizar el empleado
        const updatedEmployee = await User.findByIdAndUpdate(id, updates, options);

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        return res.json({
            success: true,
            message: 'Empleado actualizado exitosamente',
            employee: updatedEmployee
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el empleado'
        });
    }
};

export const toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await User.findById(id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }
        
        if (employee.status !== 'fired' && employee.status !== 'hired') {
            employee.status = 'hired';
        } else if (employee.status === 'hired') {
            employee.status = 'fired';
        } else if (employee.status === 'fired') {
            employee.status = 'hired';
        }

        await employee.save();

        return res.json({
            success: true,
            message: 'Estado del empleado actualizado',
            status: employee.status
        });
    } catch (error) {
        console.error(error); // Es importante manejar correctamente los errores
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado del empleado'
        });
    }
};