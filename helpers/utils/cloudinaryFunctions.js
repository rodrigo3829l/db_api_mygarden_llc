// cloudinaryFunctions.js
import cloudinary from './cloudinary.js';

export const uploadImage = async (base64Image) => {
    // console.log(base64Image);
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            folder: 'my_garden_images' 
        });
        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Error uploading image to Cloudinary', error);
        throw new Error('Image upload failed');
    }
};

export const updateImage = async (base64Image, public_id) => {
    try {
        const result = await cloudinary.uploader.upload(base64Image, {
            public_id: public_id,
            overwrite: true
        });
        return {
            secure_url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Error updating image on Cloudinary', error);
        throw new Error('Image update failed');
    }
};

export const deleteImage = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return {
            result: result.result // Should return 'ok' if successful
        };
    } catch (error) {
        console.error('Error deleting image from Cloudinary', error);
        throw new Error('Image delete failed');
    }
};