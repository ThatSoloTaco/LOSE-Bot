const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers } = require("../lib/Users.js");
const { getSwatchTime } = require("../lib/WiiShop.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('swatch-time')
		.setDescription('Gets the current time in beats'),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		const currentTime = getSwatchTime();
		
		let chatList = await getUsers();
		
		let preferredName = chatList[interaction.user.id].preferredName != "" ? chatList[interaction.user.id].preferredName : interaction.user.username; 
		await interaction.channel.send(`${preferredName}, the current time is ${currentTime} beats.`);
	}
};