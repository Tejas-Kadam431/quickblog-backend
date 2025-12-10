import express from 'express';
import { addBlog } from '../controllers/blogController.js';
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';
import { addBlog, getAllBlogs, getBlogById, deleteBlog, togglePublishBlog, updateBlog, getUnpublishedBlogs } from "../controllers/blogController.js";




blogRouter.get("/all", getAllBlogs); // ⭐ New route
blogRouter.get("/:id", getBlogById);
blogRouter.put("/:id", auth, upload.single("image"), updateBlog);


blogRouter.delete("/:id", auth, deleteBlog);
blogRouter.patch("/publish/:id", auth, togglePublishBlog);
blogRouter.get("/unpublished/all", auth, getUnpublishedBlogs);







const blogRouter = express.Router();

blogRouter.post("/add", upload.single('image'), auth, addBlog)

export default blogRouter;