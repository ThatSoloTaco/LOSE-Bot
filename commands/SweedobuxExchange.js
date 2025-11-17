const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sweedobux-exchange')
		.setDescription('Converts your LOSE bucks to sweedobux at a rate of 1:1600')
		.addIntegerOption(option =>
			option.setName('lose-bucks')
				.setDescription('How many LOSE bucks you wish to convert')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		let chatList = await getUsers();

		
		try{
			let user = interaction.user;
			let convertAmount = interaction.options.get('lose-bucks').value;
			
			if(chatList[user.id] != null){
				if(convertAmount <= chatList[user.id].LOSEBucks && convertAmount > 0){
					if(!chatList[user.id].Sweedobux){
						chatList[user.id].Sweedobux = 0;
					}
					chatList[user.id].Sweedobux += convertAmount * 1600;
					chatList[user.id].LOSEBucks -= convertAmount;
					saveUserFile(chatList);
				}
			}
			
		}
		catch(e){
			console.error(e);
		}
	}
};