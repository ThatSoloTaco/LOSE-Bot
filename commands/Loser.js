const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers } = require("../lib/Users.js");
const { calcLoseBucks } = require("../lib/LOSEBucks.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('loser')
		.setDescription('Checks your LOSE Bucks balance'),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		try{
			const commandUser = interaction.user;
			await calcLoseBucks(commandUser, false);
			
			let chatList = await getUsers();
			const loseBucks = chatList[commandUser.id].LOSEBucks;
			
			await interaction.channel.send(`Hey ${commandUser} you're worth ${loseBucks} LOSE Bucks`);
		}
		catch(e){
			console.error(e);
		}

	}
};