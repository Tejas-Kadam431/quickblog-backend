import express from 'express';
import { addBlog } from '../controllers/blogController.js';
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';
import { searchBlogs } from "../controllers/blogController.js";
import adminOnly from "../middleware/adminOnly.js";

import {
  addBlog,
  getAllBlogs,
  getBlogById,
  deleteBlog,
  togglePublishBlog,
  updateBlog,
  getUnpublishedBlogs,
  searchBlogs,
  getPublishedBlogs
} from "../controllers/blogController.js";
import { getBlogBySlug } from "../controllers/blogController.js";






blogRouter.get("/all", getAllBlogs); // ⭐ New route
blogRouter.get("/search", searchBlogs);
blogRouter.get("/published/all", getPublishedBlogs);
blogRouter.get("/slug/:slug", getBlogBySlug);
blogRouter.get("/search", searchBlogs);
blogRouter.post("/add", auth, adminOnly, upload.single("image"), addBlog);

blogRouter.put("/:id", auth, adminOnly, upload.single("image"), updateBlog);

blogRouter.delete("/:id", auth, adminOnly, deleteBlog);

blogRouter.patch("/publish/:id", auth, adminOnly, togglePublishBlog);

blogRouter.get("/unpublished/all", auth, adminOnly, getUnpublishedBlogs);








const blogRouter = express.Router();


export default blogRouter;