import {Types, mongo,mongoose} from 'mongoose';
import conn, {gridBucket} from '../utils/db.js';
import File from '../models/files.js';
import {gfs} from '../middleware/upload.js';


export const getFileById = async (req, res) => {
    try {
        const fileId = new Types.ObjectId(req.params.id);

        const bucket = new mongo.GridFSBucket(conn.db, {
            bucketName: 'fs'
        });

        const downloadStream = bucket.openDownloadStream(fileId);

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', (err) => {
            console.error(err);
            res.status(404).json({error: 'File not found'});
        });

        downloadStream.on('end', () => {
            res.end();
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
};




export const uploadFile = async (req, res) => {
    try {

        const files = req.files.map(file => ({
            _id: file.id,
            uploadOwner: req.body.uploadOwner
        }));

        if (!gridBucket) {
            throw new Error("GridFSBucket is not initialized");
        }

        for (const file of files) {
            const fileId = file._id;

            const fileData = await gridBucket.find({ _id: fileId }).toArray();

            if (fileData.length === 0) {
                throw new Error(`File with ID ${fileId} not found`);
            }

            await gridBucket.s.db.collection('fs.files').updateOne(
                { _id: fileId },
                { $set: { "metadata.uploadOwner": file.uploadOwner } }
            );
        }

        console.log("upload owner : ",req.body.uploadOwner)




        if (!req.files) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        const oldFile = req.files;
        res.status(201).json(oldFile);


    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
};


export const deleteFile = async (req, res) => {
    try {
        const fileId = new Types.ObjectId(req.params.id);

        await gfs.files.deleteOne({_id: fileId});
        await conn.db.collection('fs.chunks').deleteMany({files_id: fileId});


        res.status(200).json({message: "file deleted successfully"});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};




export const getAllFiles = async (req, res) => {
  try {
    const bucket = new mongo.GridFSBucket(conn.db, {
      bucketName: 'fs',
    });

    // Fetch all files' IDs from the files collection
    const files = await bucket.find({}, { projection: { _id: 1 } }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found' });
    }

    // Extract just the IDs
    const fileIds = files.map(file => file._id);

    res.status(200).json({ fileIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
export const getFileMetadata = async (req, res) => {
  try {
    const fileId = new Types.ObjectId(req.params.id);
    const file = await conn.db.collection('fs.files').findOne({ _id: fileId });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const markFileAsRecovered = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const recoveryStatus = req.body.recovery;

    // Update the file's recovery status in the database
    const result = await conn.db.collection("fs.files").updateOne(
      { _id: fileId },
      { $set: { "metadata.recovery": recoveryStatus } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "File not found or already in the desired state" });
    }

    res.status(200).json({ message: `File recovery status updated to ${recoveryStatus}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
