import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';

export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // current page
    const limit = parseInt(req.query.limit) || 10; // blogs per page
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments();

    return res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalBlogs / limit),
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error("Get All Blogs Error:", error);
    return res.status(500).json({ success: false, message: "Cannot fetch blogs" });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    return res.status(500).json({ success: false, message: "Invalid blog ID" });
  }
};
export const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if (!deletedBlog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting blog"
    });
  }
};



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
    console.error("Add Blog Error:", error);
return res.status(500).json({
  success: false,
  message: "Server error while uploading blog"
});


  }
}