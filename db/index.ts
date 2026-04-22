'use strict';
import Database from 'better-sqlite3';
import LoseDatabaseProcess from './LoseDatabaseProcess';
import { config } from "../config";


export const loseDatabaseProcess = new LoseDatabaseProcess(config.FILENAME, config.BACKUP_FILE_DIR);