import { FeaturedProject } from '../models/FeatureProjects.js';
import { ScheduleService } from '../models/ScheduledService.js';
import { Service } from '../models/Services.js';
// Función para traer todos los proyectos destacados
export const getAllFeaturedProjects = async (req, res) => {
    try {
        const projects = await FeaturedProject.find()
            .populate('scheduleService')
            .populate('service');

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

// Función para traer un proyecto destacado por su ID
export const getFeaturedProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await FeaturedProject.findById(id)
            .populate('scheduleService')
            .populate('service');

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

// Función para editar un proyecto destacado
export const updateFeaturedProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduleService, service, images, description } = req.body;

        const existingScheduleService = await ScheduleService.findById(scheduleService);
        if (!existingScheduleService) {
            return res.json({
                success: false,
                msg: 'Servicio agendado no encontrado'
            });
        }

        const existingService = await Service.findById(service);
        if (!existingService) {
            return res.json({
                success: false,
                msg: 'Servicio no encontrado'
            });
        }

        const updatedProject = await FeaturedProject.findByIdAndUpdate(id, {
            scheduleService,
            service,
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
        console.log("Error al actualizar el proyecto destacado");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al actualizar el proyecto destacado'
        });
    }
};

// Función para eliminar un proyecto destacado
export const deleteFeaturedProject = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProject = await FeaturedProject.findByIdAndRemove(id);

        if (!deletedProject) {
            return res.json({
                success: false,
                msg: 'Proyecto destacado no encontrado'
            });
        }

        return res.json({
            success: true,
            msg: 'Proyecto destacado eliminado exitosamente'
        });
    } catch (error) {
        console.log("Error al eliminar el proyecto destacado");
        console.log(error);
        return res.json({
            success: false,
            msg: 'Error al eliminar el proyecto destacado'
        });
    }
};
