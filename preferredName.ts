import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { loseDatabaseProcess } from "../db";
import { LoseDatabase } from "../db/LoseDatabase";

export const data = new SlashCommandBuilder()
	.setName("preferred_name")
	.setDescription("Use a name to be referred as by the bot.")
	.addStringOption(option =>
			option.setName('preferred_name')
				.setDescription('Name override for yourself')
				.setRequired(true));

export async function execute(interaction: CommandInteraction) {

	const connection: LoseDatabase = loseDatabaseProcess.createNewConnection();
	
	const oldPreferredName = await connection.getPreferredName(interaction.user.id);
	let preferredName = interaction.options.getString('preferred_name');
	connection.updatePreferredName(interaction.user.id, interaction.user.username, preferredName);
	await interaction.deferReply();
	await connection.close();
	if(oldPreferredName != interaction.user.username){
		await interaction.channel.send(`What's this? REDACTED is evolving?!`);
		await interaction.channel.send(`Congratulations! Your REDACTED evolved into ${preferredName}!`);

	}
	else{
		await interaction.channel.send(`Well Acktually, ${interaction.user.username} was ${preferredName} this whole time. Congratulations!!!`);
	}
	return interaction.deleteReply();
	
}