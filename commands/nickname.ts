import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { loseDatabaseProcess } from "../db";
import { LoseDatabase } from "../db/LoseDatabase";

export const data = new SlashCommandBuilder()
	.setName("nickname_change")
	.setDescription("Change anyone's nickname")
	.addUserOption(option =>
		option.setName('username')
			.setDescription('Username of discord person')
			.setRequired(true))
	.addStringOption(option =>
			option.setName('nickname')
				.setDescription('New nickname for this person')
				.setRequired(true));

export async function execute(interaction: CommandInteraction) {

	const connection: LoseDatabase = loseDatabaseProcess.createNewConnection();
	const preferredName = await connection.getPreferredName(interaction.user.id);
	
	let user = interaction.options.getUser('username');
	const isAdmin = await connection.getIsAdmin(user.id);
	const targetName = await connection.getPreferredName(user.id);
	let nickname = interaction.options.getString('nickname');
	
	await connection.insertNickname(user, nickname.substring(0,32), Date.now(), interaction.user);
	
	await interaction.deferReply();
	if(isAdmin){
		await user.send(`${targetName}, ${preferredName} wants you to change your name to ${nickname.substring(0,32)}`);
	}
	else{
		await interaction.guild.members.edit(user.id, {nick:nickname.substring(0,32)});
	}
	
	await connection.close();
	return interaction.deleteReply();
	
	
	
}