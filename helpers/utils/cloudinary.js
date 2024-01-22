import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure : true
  });

  export const uploadImage = async (filePath) =>{
    return await cloudinary.uploader.upload(filePath,{
        folder: 'images'
    });
  };

  export const deleteImage  = async (publicId) =>{
    return await cloudinary.uploader.destroy(publicId)
  }