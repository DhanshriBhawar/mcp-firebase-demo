import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, '../serviceAccount.json');
const serviceAccountData = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const adminApp = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccountData),
    })
  : admin.app();

export default adminApp;
