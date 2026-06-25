import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../data');
const tokenFilePath = path.join(dataDir, 'tokens.json');

const ensureDataFile = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(tokenFilePath);
  } catch {
    await fs.writeFile(tokenFilePath, '[]', 'utf8');
  }
};

export const readTokens = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(tokenFilePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeTokens = async (tokens) => {
  await ensureDataFile();
  await fs.writeFile(tokenFilePath, JSON.stringify(tokens, null, 2), 'utf8');
};
