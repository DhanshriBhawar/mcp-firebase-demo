import express from 'express';
import { getStatus, saveToken, sendPush } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/status', getStatus);
router.post('/save-token', saveToken);
router.post('/send-push', sendPush);

export default router;
