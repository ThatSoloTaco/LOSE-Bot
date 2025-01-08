const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");

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
			
			
			if(user.username === interaction.user.username){
				if(!chatList[user.id].isAdmin) {
					await interaction.channel.send(`Wow... Can't believe, ${user.username}, tried to change their own nickname to ${nicknameValue}. That's not very "pog champ" of you.`);
				}
				else{
					const nicknameList = chatList[user.id].nicknames.map(n => n.nickname);
					if(!nicknameList.includes(nicknameValue)){
						await interaction.channel.send(`Uh-oh ${user.username}, used their super special admin permissions to change their name to ${nicknameValue}. Cringe, L+Ratio+Weak, not very poggies.`);
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
					await interaction.channel.send(`${user}, ${interaction.user.username} wants you to change your name to ${nicknameValue}`);
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