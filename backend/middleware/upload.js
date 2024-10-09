import multer from 'multer';
import { GridFsStorage } from '@lenne.tech/multer-gridfs-storage';
import { randomBytes } from 'crypto';
import { extname } from 'path';
import mongoose from 'mongoose';
import conn from '../utils/db.js';
import Grid from 'gridfs-stream';
import { MONGODB_URI } from '../config/config.js';
import {keycloak} from "./keycloak.js";

// Ensure GridFS uses the correct MongoDB driver
Grid.mongo = mongoose.mongo;

let gfs;
conn.once('open', () => {
  gfs = new Grid(conn.db, mongoose.mongo);
  gfs.collection('fs');
});

// Configure GridFsStorage
const storage = new GridFsStorage({
  url: MONGODB_URI,
  file: async (req, file) => {

    return {
      filename: file.originalname,
      metadata: {
        recovery: false // Adding the recovery flag as metadata
      }
    };

  }
});

// Set up multer with the GridFsStorage configuration
const upload = multer({ storage });

export default upload;
export { gfs };


// Ensure GridFS uses the correct MongoDB driver
// Grid.mongo = mongoose.mongo;
//
// let gfs;
// conn.once('open', () => {
//   gfs = new Grid(conn.db, mongoose.mongo);
//   gfs.collection('uploads');
// });
//
// // Configure GridFsStorage
// const storage = new GridFsStorage({
//
//
//   url: MONGODB_URI,
//   options: { useNewUrlParser: true, useUnifiedTopology: true },  // Add any connection options here
//   file: async (req, file) => {
//     const uploadOwner = await req.body;
//
//     console.log("OWNER IS : ",uploadOwner)
//     console.log("body",req.body)
//
//
//     return new Promise((resolve, reject) => {
//       randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//
//         const filename = buf.toString('hex') + extname(file.originalname);
//         const fileInfo = {
//
//
//
//           filename: filename,
//           bucketName: 'uploads',
//           chunkSizeBytes: 1024 * 1024*1024 * 1024*1024 * 1024, // 1MB chunks
//           metadata: {
//             bucketName: 'uploads',
//             fieldname: file.fieldname,
//             originalname: file.originalname,
//             encoding: file.encoding,
//             uploadOwner: uploadOwner,
//
//           },
//
//         };
//         resolve(fileInfo);
//       });
//     });
//   }
//
// });
//
// const upload = multer({ storage });
//
// export default upload;
// export { gfs };
