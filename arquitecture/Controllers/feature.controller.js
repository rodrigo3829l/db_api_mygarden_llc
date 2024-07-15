import { FeaturedProject } from '../models/FeatureProjects.js';
import { ScheduleService } from '../models/ScheduledService.js';
import { Service } from '../models/Services.js';
import { deleteImage } from '../../helpers/utils/cloudinaryFunctions.js';
// Función para traer todos los proyectos destacados

export const addFeaturedProject = async (req, res) => {
    try {
        const { scheduleService, description, images } = req.body;

        // Ensure required fields are provided
        if (!scheduleService || !description || !images) {
            for (const img of images) {
                await deleteImage(img.public_id);
            }
            return res.json({
                success: false,
                msg: 'Se requieren todos los campos: scheduleService, service, description y al menos una imagen'
            });
        }

        // Check if scheduleService exists
        const existingScheduleService = await ScheduleService.findOne({ description: scheduleService });
        if (!existingScheduleService) {
            for (const img of images) {
                await deleteImage(img.public_id);
            }
            return res.json({
                success: false,
                msg: 'Servicio agendado no encontrado'
            });
        }

        // Check if a featured project already exists with this scheduleService
        const existingFeaturedProject = await FeaturedProject.findOne({ scheduleService: existingScheduleService._id });
        if (existingFeaturedProject) {
            for (const img of images) {
                await deleteImage(img.public_id);
            }
            return res.json({
                success: false,
                msg: 'Ya existe un proyecto destacado con este servicio agendado'
            });
        }

        // Create new featured project
        const newFeaturedProject = new FeaturedProject({
            scheduleService: existingScheduleService._id,
            service: existingScheduleService.service,
            images,
            description
        });

        // Save the new featured project
        const savedProject = await newFeaturedProject.save();

        return res.json({
            success: true,
            msg: 'Proyecto destacado agregado exitosamente',
            project: savedProject
        });
    } catch (error) {
        for (const img of images) {
            await deleteImage(img.public_id);
        }
        console.error('Error al agregar el proyecto destacado:', error);
        return res.json({
            success: false,
            msg: 'Error al agregar el proyecto destacado'
        });
    }
};

// Función para editar un proyecto destacado
export const updateFeaturedProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduleService, images, description } = req.body;

        const existingScheduleService = await ScheduleService.findOne({ description: scheduleService });
        if (!existingScheduleService) {
            return res.json({
                success: false,
                msg: 'Servicio agendado no encontrado'
            });
        }

        // Check if another featured project already exists with this scheduleService
        const existingFeaturedProject = await FeaturedProject.findOne({ 
            scheduleService: existingScheduleService._id,
            _id: { $ne: id } // Exclude the current project being updated
        });
        if (existingFeaturedProject) {
            return res.json({
                success: false,
                msg: 'Ya existe otro proyecto destacado con este servicio agendado'
            });
        }

        const updatedProject = await FeaturedProject.findByIdAndUpdate(id, {
            scheduleService: existingScheduleService._id,
            service: existingScheduleService.service,
            images,
            description
        }, { new: true, runValidators: true });

        if (!updatedProject) {
            return res.json({
                success: false,
                msg: 'Proyecto destacado no encontrado'
            });
        }

        return res.json({
            success: true,
            msg: 'Proyecto destacado actualizado exitosamente',
            project: updatedProject
        });
    } catch (error) {
        console.log("Error al actualizar el proyecto destacado:", error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el proyecto destacado'
        });
    }
};


export const getAllFeaturedProjects = async (req, res) => {
    try {
        const projects = await FeaturedProject.find()
            .populate({
                path: 'scheduleService',
                populate: { path: 'user' } // Poblar el usuario dentro de scheduleService
            })
            .populate({
                path : 'service',
                populate : { path: 'tipoDeServicio'}
            });

        return res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.log("Error al obtener los proyectos destacados");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener los proyectos destacados'
        });
    }
};

export const getFeaturedProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        const project = await FeaturedProject.findById(id)
            .populate({
                path: 'scheduleService',
                populate: [
                    { path: 'user' }, // Poblar el usuario dentro de scheduleService
                    { path: 'products.product' } // Poblar los productos dentro de scheduleService
                ]
            })
            .populate({
                path: 'service',
                populate : { path: 'tipoDeServicio'}
            });

        if (!project) {
            return res.json({
                success: false,
                msg: 'Proyecto destacado no encontrado'
            });
        }

        return res.json({
            success: true,
            project
        });
    } catch (error) {
        console.log("Error al obtener el proyecto destacado");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al obtener el proyecto destacado'
        });
    }
};




// Función para eliminar un proyecto destacado
export const deleteFeaturedProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Encontrar el proyecto destacado por su ID
        const project = await FeaturedProject.findById(id);

        // Verificar si el proyecto existe
        if (!project) {
            return res.json({
                success: false,
                msg: 'Proyecto destacado no encontrado'
            });
        }

        // Eliminar todas las imágenes asociadas al proyecto en Cloudinary
        for (const img of project.images) {
            await deleteImage(img.public_id);
        }

        // Eliminar el proyecto destacado de la base de datos
        await FeaturedProject.findByIdAndDelete(id);

        return res.json({
            success: true,
            msg: 'Proyecto destacado e imágenes eliminados exitosamente'
        });
    } catch (error) {
        console.log("Error al eliminar el proyecto destacado", error);
        return res.status(500).json({
            success: false,
            msg: 'Error al eliminar el proyecto destacado'
        });
    }
};
