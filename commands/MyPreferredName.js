const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('my-preferred-name')
		.setDescription('Changes actual name associated with list')
		.addStringOption(option =>
			option.setName('new-name')
				.setDescription('New name of the person')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		let chatList = await getUsers();

		
		try{
			let user = interaction.user;
			let newName = interaction.options.get('new-name');
			
			let username, nicknameValue;
			let previousName = chatList[user.id].preferredName
			
			if(chatList[user.id] != null){
				chatList[user.id].preferredName = newName.value
			
				saveUserFile(chatList);
				if(previousName != ""){
					await interaction.channel.send(`What's this? ${previousName} is evolving?!`);
					await interaction.channel.send(`Congratulations! Your REDACTED evolved into ${chatList[user.id].preferredName}!`);
				}
				else{
					await interaction.channel.send(`Well Acktually, ${user.username} was ${chatList[user.id].preferredName} this whole time.`);
				}
				
			}
			
		}
		catch(e){
			console.error(e);
		}
	}
};