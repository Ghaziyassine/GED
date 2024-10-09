// config.js
import 'dotenv/config';

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const PORT = process.env.PORT;

const MONGODB_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

export { MONGODB_URI, PORT };

