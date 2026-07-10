import express, { Application, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';

//importing and initializing the env file 
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: "./config/config.env" });

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

export default app;