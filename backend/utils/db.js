import mongoose from 'mongoose';
import { MONGODB_URI } from '../config/config.js';
import * as mongodb from 'mongodb';

export let gridBucket;

const dbURI = MONGODB_URI;

const conn = mongoose.createConnection(dbURI);

mongoose.connect(dbURI)
  .then(() => {
      const client = new mongodb.MongoClient(dbURI);
      client.connect().then(() => {
          const db = client.db();
          gridBucket = new mongodb.GridFSBucket(db, { bucketName: 'fs' });
          console.log("GridFSBucket initialized successfully");
      }).catch(error => {
          console.error("GridFSBucket initialization error:", error);
          process.exit(1);
      });
  }).catch((err) => {
    console.log("Connection failed: ", err);
  });

export default conn;