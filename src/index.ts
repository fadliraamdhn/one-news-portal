import express from "express";
import dotenv from "dotenv"
dotenv.config()

import routes from "~/routes"
import cors from "cors"
import { errorHandler } from "~/middlewares/errorHandler";
import "~/worker/news.worker"

const allowedOrigin = {
    origin: process.env.CORS_ORIGIN
}

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors(allowedOrigin))
app.use("/", routes);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
