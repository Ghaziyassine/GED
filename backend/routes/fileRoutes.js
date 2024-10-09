import express from 'express';
import { getFileById, uploadFile ,deleteFile,getAllFiles,getFileMetadata  ,markFileAsRecovered,
} from '../controllers/fileController.js';
import upload from '../middleware/upload.js';
import { keycloak } from "../middleware/keycloak.js";


const router = express.Router();

router.get('/upload/:id', keycloak.protect(), getFileById);
router.post('/upload', keycloak.protect(), upload.any(), uploadFile);
router.delete('/upload/:id', keycloak.protect(), deleteFile);
// New route to get all files
router.get('/upload', keycloak.protect(), getAllFiles);
router.get('/upload/metadata/:id', keycloak.protect(), getFileMetadata);
router.patch("/upload/recovery/:id", keycloak.protect(), markFileAsRecovered); // Add the route for recovery status

export default router;