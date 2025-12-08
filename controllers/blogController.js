import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';

export const addBlog = async (req, res)=>{
  try {
    const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
    const imageFile = req.file;

    //Check if all fields are present
    // Validate mandatory fields
if (!title || !description || !category || !imageFile) {
  return res.status(400).json({
    success: false,
    message: "Please fill all required fields"
  });
}

    const fileBuffer = fs.readFileSync(imageFile.path)
    //Upload image to imagekit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs"
    });
    // optimization through imagekit url transformation
    const optimizedImageUrl = imagekit.baseURL({
      path: response.filePath,
      transformation: [
        {quality: 'auto'}, //Auto compression
        {format: 'webp'}, //Convert to modern format
        {width: '1280'} //widht resizing
      ]
    });
    const image = optimizedImageUrl;

    await Blog.create({title, subTitle, description, category, image, isPublished})

    return res.status(201).json({
  success: true,
  message: "Blog added successfully",
  image
});

  } catch (error) {
    res.json({success: false, message: error.message});

  }
}