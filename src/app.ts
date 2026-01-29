import express, { Application } from "express";
import { toNodeHandler } from "better-auth/node";
import cors from 'cors';
import { auth } from "./lib/auth";

const app: Application = express();

app.use(cors({
    origin: process.env.APP_URL || "http://localhost:3000", // client side url
    credentials: true
}))

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req, res) => {
    res.send("Skill Bridge!");
});


export default app;