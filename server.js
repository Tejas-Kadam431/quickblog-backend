import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import adminRouter from './routes/adminRoutes.js';
import blogRouter from './routes/blogRoutes.js';
import errorHandler from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";



const app = express();

await connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
 // Bonus addition


// Routes

app.use('/api/admin', adminRouter)
app.use('/api/blog', blogRouter)
app.use(errorHandler);
app.get('/',(req,res)=> res.send("API is Working"))
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    service: "QuickBlog Backend API",
    timestamp: new Date().toISOString(),
  });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});

export default app;