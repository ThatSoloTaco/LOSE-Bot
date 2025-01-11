const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers } = require("../lib/Users.js");
const { getSwatchTime, buyItem } = require("../lib/WiiShop.js");
const { seriousChannelUID } = require('../auth.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('one-meme-in-planning-chat')
		.setDescription('Allows Users To Witness A Meme In Planning Chat'),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		const commandUser = interaction.user;	
		
		if(interaction.channel.id == seriousChannelUID){	
			let chatList = await getUsers();

			
			const bought = await buyItem(interaction.user.id, "You Get One As A Treat", false);
			let preferredName = chatList[interaction.user.id].preferredName != "" ? chatList[interaction.user.id].preferredName : interaction.user.username; 
			
			if(!bought){
				await interaction.channel.send(`Woooooooooooow... Y'all, ${preferredName}, just tried to do a very silly meme in planning chat, and doesn't even have the bucks for it.`);
			}
			else{
				await interaction.channel.send(`# EXCUSE ME! EXCUSE ME! EVERYONE! @here! SHHHH! SHHHH! SHHHH! ${commandUser}, HAS A VERY IMPORTANT THING TO SAY! ${preferredName}, please enlighten us with your meme.`);
			}
		}
		else{
			await interaction.channel.send(`${commandUser}, You can only use that command in the serious channel <#${seriousChannelUID}>`);
		}
		
	}
};