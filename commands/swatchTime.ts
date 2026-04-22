import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { loseDatabaseProcess } from "../db"
import { LoseDatabase } from "../db/LoseDatabase"

export const data = new SlashCommandBuilder()
  .setName("swatch")
  .setDescription("Gets the current time in beats");


export async function execute(interaction: CommandInteraction) {
	const connection: LoseDatabase = loseDatabaseProcess.createNewConnection();
	const preferredName = await connection.getPreferredName(interaction.user.id);
  const today = new Date();
  const utc = new Date(today.valueOf());
  const currentTime = Math.floor(((3600 * utc.getUTCHours()) + (60 * utc.getUTCMinutes()) + utc.getUTCSeconds()) / 86.4);
  connection.close();
  
  return interaction.reply(`${preferredName}, the current time is ${currentTime} beats.`);
}