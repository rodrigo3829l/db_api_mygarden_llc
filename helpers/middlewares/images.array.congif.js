import { uploadImage, deleteImage } from "../utils/cloudinaryFunctions.js";

export const handleImagesUpload = async (req, res, next) => {
    const { images, publicIdsToRemove, uploadImages } = req.body;
    // Si no hay imágenes para subir ni para eliminar, pasa al siguiente middleware
    if ((!images || !Array.isArray(images) || images.length === 0) && (!publicIdsToRemove || !Array.isArray(publicIdsToRemove) || publicIdsToRemove.length === 0)) {
        if (uploadImages && Array.isArray(uploadImages) && uploadImages.length > 0) {
            const sanitizedUploadImages = uploadImages.map(img => ({
                secure_url: img.secure_url,
                public_id: img.public_id
            }));
            req.body.images = sanitizedUploadImages;
        }
        return next();
    }

    try {
        // Eliminar imágenes si hay publicIdsToRemove
        if (publicIdsToRemove && Array.isArray(publicIdsToRemove) && publicIdsToRemove.length > 0) {
            for (const public_id of publicIdsToRemove) {
                await deleteImage(public_id);
            }
        }

        // Array para almacenar los detalles de las imágenes subidas
        const uploadedImages = [];

        // Subir nuevas imágenes si hay imágenes
        if (images && Array.isArray(images) && images.length > 0) {
            for (const image of images) {
                const imageDetails = await uploadImage(image);
                // Push uploaded image details to the array
                uploadedImages.push({
                    secure_url: imageDetails.secure_url,
                    public_id: imageDetails.public_id
                });
            }
        }
        // Añadir imágenes previamente subidas al array de imágenes subidas
        if (uploadImages && Array.isArray(uploadImages) && uploadImages.length > 0) {
            console.log("entro al if de upload images");
            // Filtrar las imágenes que no están en publicIdsToRemove
            const filteredUploadImages = uploadImages.filter(img => !publicIdsToRemove.includes(img.public_id));
            console.log('Filtered uploadImages:', filteredUploadImages);
            // Agregar solo secure_url y public_id a uploadedImages
            const sanitizedUploadImages = filteredUploadImages.map(img => ({
                secure_url: img.secure_url,
                public_id: img.public_id
            }));
            uploadedImages.push(...sanitizedUploadImages);
        }

        // Actualizar req.body.images con el array de imágenes subidas
        req.body.images = uploadedImages;

        next();
    } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        return res.status(500).json({
            success: false,
            msg: 'Image upload failed'
        });
    }
};
