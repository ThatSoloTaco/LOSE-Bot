const { SlashCommandBuilder } = require('discord.js');
const { ravioliRavioliKeeperUID } = require('../auth.json');
const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require('../lib/Users.js');
const { buyItem } = require('../lib/WiiShop.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ravioli-ravioli')
		.setDescription('Resets chat nicknames to their original usernames'),
	async execute(interaction) {
		await interaction.deferReply();
		await interaction.deleteReply();
		
		let bought = true
		let chatList;
	
		let ravioliRavioliKeeper;
		
		let ravioliRavioliName;
		
		
		if(interaction.user.id != ravioliRavioliKeeperUID){
			bought = await buyItem(interaction.user.id, "Ravioli-Ravioli", false);
			chatList = await getUsers();
			ravioliRavioliName = chatList[interaction.user.id].preferredName != "" ? chatList[interaction.user.id].preferredName : chatList[interaction.user.id].profileName;
		}
		else{
			 chatList = await getUsers();
			 ravioliRavioliKeeper = chatList[ravioliRavioliKeeperUID].preferredName != "" ? chatList[ravioliRavioliKeeperUID].preferredName : chatList[ravioliRavioliKeeperUID].profileName;
		}
		
		const memberUIDs = Object.keys(chatList);
		
		if(bought){
			await interaction.channel.send(`${ravioliRavioliName}'s beyond disappointed...`);
			
			for (let member of memberUIDs) {
				const dateObj = new Date();
				chatList[member].nicknames.push({
					nickname: chatList[member].profileName,
					date: dateObj.getTime(),
					changedBy: interaction.user.username
				});
				
				if(chatList[member].isAdmin){
					await interaction.channel.send(`<@${member}>, ${ravioliRavioliName} wants you to change your nickname back to ${chatList[member].profileName}`);
				}
				else{
					await interaction.guild.members.edit(member, {nick: chatList[member].profileName});
				}
			}
		}
		else{
			await interaction.channel.send(`Wtf only ${ravioliRavioliKeeper} can do this can do this for free`);
		}
		
		await saveUserFile(chatList);
	}
};