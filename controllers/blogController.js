import fs from "fs";
import Blog from "../models/Blog.js";
import imagekit from "../configs/imageKit.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { validateBlogInput } from "../utils/validators.js";

/* ----------------------------------
   Helper: Generate Unique Slug
-----------------------------------*/
const generateUniqueSlug = async (title) => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let finalSlug = slug;
  let counter = 1;

  while (await Blog.findOne({ slug: finalSlug })) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }

  return finalSlug;
};

/* ----------------------------------
   Add Blog
-----------------------------------*/
export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog
    );
    const imageFile = req.file;

    if (!imageFile) {
      return errorResponse(res, 400, "Image is required");
    }

    const validationError = validateBlogInput({ title, description, category });
    if (validationError) {
      return errorResponse(res, 400, validationError);
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const uploadResponse = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    const image = imagekit.url({
      src: uploadResponse.url,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    fs.unlinkSync(imageFile.path);

    const slug = await generateUniqueSlug(title);

    const blog = await Blog.create({
      title,
      subTitle,
      description,
      category,
      image,
      isPublished,
      slug,
    });

    return successResponse(res, blog, "Blog added successfully", 201);
  } catch (error) {
    console.error("Add Blog Error:", error);
    return errorResponse(res, 500, "Failed to add blog");
  }
};

/* ----------------------------------
   Get All Blogs (Pagination + Filter)
-----------------------------------*/
export const getAllBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = req.query.category
      ? { category: req.query.category }
      : {};

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBlogs = await Blog.countDocuments(filter);

    return successResponse(res, {
      page,
      totalPages: Math.ceil(totalBlogs / limit),
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Get All Blogs Error:", error);
    return errorResponse(res, 500, "Cannot fetch blogs");
  }
};

/* ----------------------------------
   Get Published Blogs (Public)
-----------------------------------*/
export const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({
      createdAt: -1,
    });

    return successResponse(res, blogs, "Published blogs fetched");
  } catch (error) {
    console.error("Get Published Blogs Error:", error);
    return errorResponse(res, 500, "Failed to fetch published blogs");
  }
};

/* ----------------------------------
   Get Unpublished Blogs (Admin)
-----------------------------------*/
export const getUnpublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: false }).sort({
      createdAt: -1,
    });

    return successResponse(res, blogs, "Unpublished blogs fetched");
  } catch (error) {
    console.error("Get Unpublished Blogs Error:", error);
    return errorResponse(res, 500, "Cannot fetch unpublished blogs");
  }
};

/* ----------------------------------
   Get Blog by ID
-----------------------------------*/
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    return successResponse(res, blog);
  } catch (error) {
    console.error("Get Blog By ID Error:", error);
    return errorResponse(res, 400, "Invalid blog ID");
  }
};

/* ----------------------------------
   Get Blog by Slug
-----------------------------------*/
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    return successResponse(res, blog);
  } catch (error) {
    console.error("Get Blog By Slug Error:", error);
    return errorResponse(res, 400, "Invalid slug");
  }
};

/* ----------------------------------
   Update Blog (Text + Image)
-----------------------------------*/
export const updateBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = req.body;
    const imageFile = req.file;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    if (title || description || category) {
      const validationError = validateBlogInput({
        title: title ?? "temp",
        description: description ?? "temp",
        category: category ?? "temp",
      });

      if (validationError) {
        return errorResponse(res, 400, validationError);
      }
    }

    if (title) blog.title = title;
    if (subTitle !== undefined) blog.subTitle = subTitle;
    if (description) blog.description = description;
    if (category) blog.category = category;
    if (isPublished !== undefined) blog.isPublished = isPublished;

    if (imageFile) {
      try {
        const oldFile = await imagekit.getFileDetails(blog.image);
        await imagekit.deleteFile(oldFile.fileId);
      } catch (err) {
        console.warn("Old image deletion failed:", err.message);
      }

      const buffer = fs.readFileSync(imageFile.path);

      const upload = await imagekit.upload({
        file: buffer,
        fileName: imageFile.originalname,
        folder: "/blogs",
      });

      blog.image = imagekit.url({
        src: upload.url,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });

      fs.unlinkSync(imageFile.path);
    }

    await blog.save();

    return successResponse(res, blog, "Blog updated successfully");
  } catch (error) {
    console.error("Update Blog Error:", error);
    return errorResponse(res, 500, "Failed to update blog");
  }
};

/* ----------------------------------
   Delete Blog
-----------------------------------*/
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    return successResponse(res, null, "Blog deleted successfully");
  } catch (error) {
    console.error("Delete Blog Error:", error);
    return errorResponse(res, 500, "Failed to delete blog");
  }
};

/* ----------------------------------
   Toggle Publish / Unpublish
-----------------------------------*/
export const togglePublishBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return errorResponse(res, 404, "Blog not found");
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    return successResponse(
      res,
      { isPublished: blog.isPublished },
      `Blog is now ${blog.isPublished ? "Published" : "Unpublished"}`
    );
  } catch (error) {
    console.error("Toggle Publish Error:", error);
    return errorResponse(res, 500, "Failed to toggle publish status");
  }
};
