import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    file: {
      fieldname: { type: String, required: true },
      originalname: { type: String, required: true },
      encoding: { type: String, required: true },
      mimetype: { type: String, required: true },
      filename: { type: String, required: true },
      metadata: { type: mongoose.Schema.Types.Mixed, default: null },
      bucketName: { type: String, required: true },
      chunkSize: { type: Number, required: true },
      size: { type: Number, required: true },
      uploadDate: { type: Date, default: Date.now, required: true },
      contentType: { type: String, required: true },
    }
  },
  {
    strict: false, 
    collection: 'fs.files'
  }
);

const File = mongoose.model('File', FileSchema);
export default File;
