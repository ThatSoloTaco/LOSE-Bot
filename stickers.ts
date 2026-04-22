import { CommandInteraction, SlashCommandBuilder } from "discord.js";
const fs = require('node:fs');
const path = require('node:path');
import { config } from "../config";

export async function getAllCustomStickers(){
	const picsPath = path.join(__dirname, `../../${config.MEME_FILE_DIR}`);
	const picsFiles = fs.readdirSync(picsPath).filter(file => file.endsWith('.png'));
	let memeList = picsFiles.map(p => {
		const picSplit = p.split('.');
		return picSplit[0];
	});
	return memeList;
}

export const data = new SlashCommandBuilder()
		.setName('show_sticker')
		.setDescription('Post a LOSE sticker')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Sticker to search for')
				.setAutocomplete(true));

export async function autocomplete(interaction) {
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
}

export async function execute(interaction: CommandInteraction) {
	await interaction.deferReply();
	await interaction.deleteReply();
	let stickerName = interaction.options.get('name');
	if (stickerName != null){
		let stickerNameValue = stickerName.value;
		await interaction.channel.send({ files: [{ attachment: `${config.MEME_FILE_DIR}/${stickerNameValue}.png` }] });
	}
}



