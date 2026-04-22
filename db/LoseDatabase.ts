'use strict';
import Database from 'better-sqlite3';
import * as fs from 'fs';

export default class LoseDatabase{
	database: Database;
	
	constructor(fileName){
		this.database = new Database(`${fileName}`);
	}
	
	getIsAdmin(discord_uid): boolean {
		const statement = this.database.prepare('SELECT is_admin FROM lusers WHERE discord_uid = ?');
		const users = statement.get(discord_uid);
		if(!users) return 0;
		return users.is_admin;
		
	}
	
	getPreferredName(discord_uid): String{
		const statement = this.database.prepare('SELECT preferred_name, profile_name FROM lusers WHERE discord_uid = ?');
		const users = statement.get(discord_uid);
		if(!users) return 'User';
		return users.preferred_name ? users.preferred_name : users.profile_name;
	}
	
	async insertNickname(target, newNickname, createdTimestamp, executor){
		const insertMissingUsers = this.database.prepare('INSERT INTO lusers (discord_uid, profile_name) SELECT :discordUid, :profileName WHERE NOT EXISTS(SELECT discord_uid, profile_name FROM lusers WHERE discord_uid = :discordUid AND profile_name = :profileName)');
		insertMissingUsers.run({discordUid: target.id, profileName: target.username});
		insertMissingUsers.run({discordUid: executor.id, profileName: executor.username});
		
		const insertMissingNickname = this.database.prepare('INSERT INTO nicknames (discord_uid, nickname, date, changed_by) SELECT :discordUser, :nickname, :date, :changedBy WHERE NOT EXISTS(SELECT discord_uid, nickname, date, changed_by FROM nicknames WHERE discord_uid = :discordUser AND nickname = :nickname AND date = :date AND changed_by = :changedBy)');
		console.log(`${target.id}, ${newNickname}, ${createdTimestamp}, ${executor.id}`);

		
		const info = await insertMissingNickname.run({discordUser: target.id, nickname: newNickname, date: createdTimestamp, changedBy: executor.id});
		console.log(info);
	}
	
	async queryNicknames(query): []{
		const result: [] = await this.database.prepare(query).all();
		return result;
	}
	
	async updatePreferredName(discordUid, profileName, preferredName){
		const insertMissingUsers = this.database.prepare('INSERT INTO lusers (discord_uid, profile_name) SELECT :discordUid, :profileName WHERE NOT EXISTS(SELECT discord_uid, profile_name FROM lusers WHERE discord_uid = :discordUid AND profile_name = :profileName)');
		insertMissingUsers.run({discordUid: discordUid, profileName: profileName});
		
		const updatePreferredName = this.database.prepare('UPDATE lusers SET preferred_name = :preferredName WHERE discord_uid = :discordUid');
		updatePreferredName.run({discordUid: discordUid, preferredName: preferredName});
	}
	
	close(){
		this.database.close();
	}
}