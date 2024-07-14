// handleImageUpload.js
import { uploadImage, updateImage } from "../utils/cloudinaryFunctions.js";

export const handleImageUpload = async (req, res, next) => {
    const { img, public_id } = req.body;

    if (!img) {
        return next();
    }

    try {
        let imageDetails;
        if (public_id) { // Aquí deberías agregar tu lógica para decidir si se actualiza o se sube una imagen nueva
            imageDetails = await updateImage(img, public_id ); // Asegúrate de tener `public_id` definido si estás actualizando
        } else {
            imageDetails = await uploadImage(img);
        }

        req.body.img = {
            secure_url: imageDetails.secure_url,
            public_id: imageDetails.public_id
        };

        next();
    } catch (error) {
        return res.json({
            success: false,
            msg: 'Image upload/update failed'
        });
    }
};
