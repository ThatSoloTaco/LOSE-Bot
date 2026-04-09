'use strict';

import Database from 'better-sqlite3';
import * as fs from 'fs';
import LoseDatabase from './LoseDatabase';
import LUser from './models/LUser';
import Nickname from './models/Nickname';


export default class LoseDatabaseProcess{
	database: Database;
	filename: String;
	backupDirectory: String;
	current_version: String;
	
	constructor(filename: String, backupDirectory: String){
		this.filename = filename;
		this.backupDirectory = backupDirectory;
		this.current_version = Date.now();
	}
	
	async reopen(){
		this.database = new Database(`${this.filename}-${this.current_version}.db`);
		this.database.pragma('journal_mode = WAL');
	}
	
	async close(){
		await this.database.close();
	}
	
	async run(){
		const backupExists = await this.getLatestBackup(this.backupDirectory, this.filename, this.getTimestamp(), `${this.current_version}`);
		if(backupExists)
			console.log('Reloading from latest backup');
		
		this.database = new Database(`${this.filename}-${this.current_version}.db`);
		this.database.pragma('journal_mode = WAL');
		
		const hasSqlUpdates = await this.initateDatabase(this.backupDirectory, !backupExists);
		if(hasSqlUpdates)
			console.log('sql updates found.');
		
		this.cleanupOldDatabases(`${this.filename}-${this.current_version}.db`);
		if(hasSqlUpdates){
			console.log('Sql Updates found, creating backup');
			await this.backupDatabase();
			
			await this.close();
			console.log('closed connect');
		}
		else{
			this.close();
			console.log('closed connect');
		}

	}
	
	 backupDatabase(): boolean {
		 const backupSuccess = this.database.backup(`${this.backupDirectory}/${this.filename}-${this.getTimestamp()}.db`)
		.then(() => {
			console.log('backup complete!');
			return true;
		 })
		 .catch((err) => {
			 console.log('backup failed:', err);
			 return false;
		 });
		 return backupSuccess;
	}
	
	getTimestamp(timestamp?: Integer): String{
		let date;
		if(!timestamp)
			date = new Date();
		else
			date = new Date(timestamp);
		return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1)}-${date.getUTCDate()}`;
	}
	
	async getLatestBackup(backupDirectory: String, filename: String, timestamp: String, now: String): boolean {
		const dbFiles = fs.readdirSync(backupDirectory).filter(file => file.endsWith('.db'));
		let todayFile = false;
		
		if(dbFiles && dbFiles.length > 0){
			 await fs.copyFile(`${backupDirectory}/${dbFiles[dbFiles.length-1]}`,`${filename}-${now}.db`, (err) =>{
				if (err) throw err;
			});
			todayFile = dbFiles[dbFiles.length-1] != `${filename}-${timestamp}.db`;
		}
		
		return dbFiles.length > 0 || todayFile;
	}
	
	 cleanupOldDatabases(currentDb: String){
		const oldDbFiles = fs.readdirSync('.').filter(file => file.endsWith('.db') || file.endsWith('.db-wal') || file.endsWith('.db-shm'));
		for (const file of oldDbFiles) {
			if(!file.includes(currentDb)){
				 fs.unlink(`./${file}`, (err)=>{
					if (err) throw err;
				});
			}
		}
		console.log('Old database cleanup successful!');
	}
	
	 async initateDatabase(backupDirectory: String, isNew: boolean): boolean{
		let lusers = 0;
		let nicknames = 0;
		if(!isNew) {
			lusers =  await this.getTableCount('lusers');
			nicknames =  await this.getTableCount('nicknames');
		}
		
		const sqlFiles = fs.readdirSync(backupDirectory).filter(file => file.endsWith('.sql'));
		for(const file of sqlFiles){
			const migration = fs.readFileSync(`${backupDirectory}/${file}`, 'utf8');
			await this.database.exec(migration);
		}
		const newLusers =  await this.getTableCount('lusers');
		const newNicknames = await this.getTableCount('nicknames');
		console.log(`Updates with Migration Changes, LUsers changes: ${(newLusers - lusers)}, Nicknames changes: ${(newNicknames - nicknames)}`);

		return (newLusers - lusers) > 0 || (newNicknames - nicknames) > 0;
	}
	
	 async getTableCount(tableName: String): int{
		const statement =  this.database.prepare(`SELECT * FROM ${tableName}`);
		return statement.all().length;
	}
	
	createNewConnection(): Database{
		const newConnection = new LoseDatabase(`${this.filename}-${this.current_version}.db`);
		return newConnection;
	}
}