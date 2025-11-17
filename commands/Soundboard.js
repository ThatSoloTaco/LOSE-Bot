const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { soundDirectory } = require('../auth.json');


async function getAllCustomSounds(){
	const soundsPath = path.join(__dirname, `../${soundDirectory}`);
	const soundFiles = fs.readdirSync(soundsPath).filter(file => file.endsWith('.ogg'));
	let soundBoard = soundFiles.map(s => {
		const soundSplit = s.split('.');
		return soundSplit[0];
	});
	return soundBoard;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('play-sound')
		.setDescription('Play a LOSE sound')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Sound to search for')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (focusedOption.name === 'name') {
			choices = await getAllCustomSounds();
		}
		
		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value) || choice.includes(focusedOption.value) || choice.endsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction, guild) {
		let soundName = interaction.options.get('name');
		let soundNameValue = soundName.value;
		
		return true;
	}
};