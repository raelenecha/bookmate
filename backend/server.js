import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import usersRoutes from "./routes/users.js";
import booksRoutes from "./routes/books.js";
import reservationsRoutes from "./routes/reservations.js";
import rewardsRoutes from "./routes/rewards.js";

// Load environment variables and connect to MongoDB
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ quiet: true });

const app = express();

app.use(cors({
    origin: ["https://bookmate.onrender.com", "http://localhost:5173"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger options and setup
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "BookMate API",
            version: "1.0.0",
            description: "API documentation for BookMate project"
        }
    },
    apis: ["./docs/**/*.yaml"]
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));

// Routes
app.use("/users", usersRoutes);
app.use("/books", booksRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/rewards", rewardsRoutes);

// Basic route
app.get("/", (req, res) => {
    return res.send("Welcome to BookMate API. The server is running!");
});

const PORT = 5050;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
