import express from 'express';
import { addBlog } from '../controllers/blogController.js';
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';
import { addBlog, getAllBlogs } from "../controllers/blogController.js";

blogRouter.get("/all", getAllBlogs); // ⭐ New route


const blogRouter = express.Router();

blogRouter.post("/add", upload.single('image'), auth, addBlog)

export default blogRouter;