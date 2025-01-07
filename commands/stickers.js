const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('bowling_for_soup')
		.setDescription('Posts the bowling_for_soup sticker'),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		await interaction.channel.send({ files: [{ attachment: 'memes/bowling_for_soup.png' }] });
	}
};