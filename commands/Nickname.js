const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");
const { buyItem } = require("../lib/WiiShop.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nickname')
		.setDescription('Changes chat nicknames for people in discord')
		.addUserOption(option =>
			option.setName('username')
				.setDescription('Username of discord person')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('New nickname for this person')
				.setRequired(true)),
	async execute(interaction) {
		
		await interaction.deferReply();
		await interaction.deleteReply();
		
		let nickname = interaction.options.get('nickname');
		let nicknameValue = nickname.value;
		
		if(nicknameValue.length > 32){
			await interaction.channel.send(`Hey ${interaction.user}, ${nicknameValue} is too long of a nickname, please shorten it.`);
		}
		
		let user;
		try{
			let chatList = await getUsers();
			
			user = interaction.options.getUser('username');
			if(!user){
				user = interaction.user;
			}
			
			const userPreferredName = chatList[user.id].preferredName != "" ? chatList[user.id].preferredName : user.username;
			const commandUserPreferredName  = chatList[interaction.user.id].preferredName != "" ? chatList[interaction.user.id].preferredName : interaction.user.username;
			
			if(user.username === interaction.user.username){
				const bought = await buyItem(user.id, "Weak, But Allowed", false);
				chatList = await getUsers();
				if(!bought){
					await interaction.channel.send(`Wow... Can't believe, ${userPreferredName}, tried to change their own nickname to ${nicknameValue} without the LOSE Bucks. That's not very "pog champ" of you.`);
				}
				else{
					if(chatList[user.id].isAdmin){
					await interaction.channel.send(`${commandUserPreferredName} has changed their own nickname to ${nicknameValue}, and spent some amount of time in voice chat to do it.`);
					}
					else{
						await interaction.guild.members.edit(user.id, {nick:nicknameValue});
					}
				}
			}
			else{
				const dateObj = new Date();
				chatList[user.id].nicknames.push({
					nickname: nicknameValue,
					date: dateObj.getTime(),
					changedBy: interaction.user.username
				});
				
				saveUserFile(chatList);
				if(chatList[user.id].isAdmin){
					await interaction.channel.send(`${user}, ${commandUserPreferredName} wants you to change your name to ${nicknameValue}`);
				}
				else{
					await interaction.guild.members.edit(user.id, {nick:nicknameValue});
				}
			}
		}
		catch(e){
			console.error(e);
		}

	}
};