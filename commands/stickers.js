const { SlashCommandBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { memeDirectory } = require('../auth.json');



async function getAllCustomStickers(){
	const picsPath = path.join(__dirname, `../${memeDirectory}`);
	const picsFiles = fs.readdirSync(picsPath).filter(file => file.endsWith('.png'));
	let memeList = picsFiles.map(p => {
		const picSplit = p.split('.');
		return picSplit[0];
	});
	return memeList;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('show-sticker')
		.setDescription('Post a LOSE sticker')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Sticker to search for')
				.setAutocomplete(true)),
	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		let choices;

		if (focusedOption.name === 'name') {
			let savedChoices = await getAllCustomStickers();
			if(focusedOption.value == '' || focusedOption.value == ' '){
				focusedOption.value = ''
				const choiceFloor = Math.floor(Math.random()*(savedChoices.length - 25))
				choices = savedChoices.slice(choiceFloor,choiceFloor + 25);
			}
			else{
				choices = savedChoices;
			}
		}
		const filtered = choices.filter(choice => choice.startsWith(focusedOption.value) || choice.includes(focusedOption.value) || choice.endsWith(focusedOption.value));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		let stickerName = interaction.options.get('name');
		if (stickerName != null){
			let stickerNameValue = stickerName.value;
			await interaction.channel.send({ files: [{ attachment: `${memeDirectory}/${stickerNameValue}.png` }] });
		}
	}
};