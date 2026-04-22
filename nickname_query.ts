import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { loseDatabaseProcess } from "../db"
import { LoseDatabase } from "../db/LoseDatabase"

export const data = new SlashCommandBuilder()
	.setName("nickname_query")
	.setDescription("Queries Nicknames")
	.addUserOption(option =>
		option.setName('username')
			.setDescription('Username of discord person')
			.setRequired(true))
	.addIntegerOption(option =>
		option.setName('limit')
			.setDescription('Number of previous nicknames')
			.setRequired(false))
	.addBooleanOption(option =>
		option.setName('changed_by')
			.setDescription('shows the latest changes by this person when true')
			.setRequired(false));

export async function execute(interaction: CommandInteraction) {

	const connection: LoseDatabase = loseDatabaseProcess.createNewConnection();
	const preferredName = await connection.getPreferredName(interaction.user.id);
	let user = interaction.options.getUser('username');
	const targetName = await connection.getPreferredName(user.id);

	let limit = interaction.options.getInteger('limit');
	if(!limit){
		limit = 10;
	}
	let changedBy = interaction.options.getBoolean('changed_by');
	if(!changedBy){
		changedBy = false;
	}
	
	let result;
	if(changedBy)
		result = await connection.queryNicknames(`SELECT lusers.profile_name, nicknames.nickname, nicknames.date FROM nicknames, lusers WHERE nicknames.changed_by = ${user.id} AND nicknames.discord_uid = lusers.discord_uid ORDER BY date DESC LIMIT ${limit};`);
	else
		result = await connection.queryNicknames(`SELECT lusers.profile_name, nicknames.nickname, nicknames.date FROM nicknames, lusers WHERE nicknames.discord_uid = ${user.id} AND nicknames.changed_by = lusers.discord_uid ORDER BY date DESC LIMIT ${limit};`);
	await connection.close();

	let prettyResult = await queryPrettier(preferredName, targetName, limit, result, changedBy);
	
	await interaction.deferReply();
	await interaction.user.send(prettyResult);
	return interaction.deleteReply();
}

async function queryPrettier(preferredName, userProfile, limit, results, changed): String{
	let result;
	if(changed){
		result = `${preferredName}, here are the last ${limit} nickname changes that ${userProfile} did:`;
		results.forEach((entry) =>{
			result += `\n ${entry.profile_name}'s nickname, ${entry.nickname}, on ${loseDatabaseProcess.getTimestamp(entry.date)}`;
		});
	}
	else{
		result = `${preferredName}, here are the ${limit} most recent nicknames for ${userProfile}:`;
		results.forEach((entry) =>{
			result += `\n nickname: ${entry.nickname}, changed by: ${entry.profile_name} on ${loseDatabaseProcess.getTimestamp(entry.date)}`;
		});
	}
	return result;
}