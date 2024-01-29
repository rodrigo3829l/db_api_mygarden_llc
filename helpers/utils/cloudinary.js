import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dltytaqui', 
  api_key: '556788988246927', 
  api_secret: 'WbSLZFIkOoG3h3IaCfgJN4ZOc0A', 
  secure: true
});

  export const uploadImage = async (filePath) =>{
    return await cloudinary.uploader.upload(filePath,{
        folder: 'images'
    });
  };

  export const deleteImage  = async (publicId) =>{
    return await cloudinary.uploader.destroy(publicId)
  }