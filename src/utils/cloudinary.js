import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const UploadOnCloudinary = async (localPathFile) =>{
    try {
        if(!localPathFile){
            return null
        }

        const response = await cloudinary.uploader.upload(localPathFile, {
            resource_type: 'auto'
        })

        console.log("File is uploaded sucessfully" , response.url);
        return response;
        
    } catch (error) {
        fs.unlink(localPathFile)    //remove the locally saved temporary file as the upload operation fails
        return null;
    }
}


export {UploadOnCloudinary}
