/**
 * Authentication Constants
 * Shared paths and constants for authentication setup
 */

import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path where authenticated state will be stored
export const STORAGE_STATE_PATH = path.join(__dirname, '../../.auth/user.json');

// Auth directory path
export const AUTH_DIR = path.join(__dirname, '../../.auth');
