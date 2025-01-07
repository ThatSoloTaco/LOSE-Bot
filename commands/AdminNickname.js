const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nickname-override')
		.setDescription('Changes chat nicknames for admins')
		.addUserOption(option =>
			option.setName('username')
				.setDescription('Username of admin')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('nickname')
				.setDescription('New nickname for this admin')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		let chatList = await getUsers();
		
		let user, nicknameValue;
		try{
			user = interaction.options.getUser('username');
			if(!user){
				user = interaction.user;
			}
			let nickname = interaction.options.get('nickname');
			nicknameValue = nickname.value;
			if(chatList[user.id].isAdmin) {
				if(user.username === interaction.user.username){
					await interaction.channel.send(`Wow... Can't believe, ${user.username}, tried to change their own nickname to ${nicknameValue}. That's not very "pog champ" of you.`);
				}
				else if(nicknameValue.length > 32){
					await interaction.channel.send(`Hey ${interaction.user}, ${nicknameValue} is too long of a nickname, please shorten it.`);
				}
				else{
					const dateObj = new Date();
					chatList[user.id].nicknames.push({
						nickname: nicknameValue,
						date: dateObj.getTime(),
						changedBy: interaction.user.username
					});
					saveUserFile(chatList);
					await interaction.channel.send(`${user}, ${interaction.user.username} wants you to change your name to ${nicknameValue}`);
				}
				
			}
			else{
				await interaction.channel.send(`Hey ${interaction.user}, ${user.username} isn't an admin.`);
			}
		}
		catch(e){
			console.error(e);
		}

	}
};