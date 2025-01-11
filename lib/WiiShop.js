const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");
const wiiShop = require("../data/wii-shop.json");

async function voiceChatEnters(userUIDs) {
	let chatList = await getUsers();

	for (let userUID of userUIDs) {
		if(chatList[userUID] == null){
			console.error(`User: ${userUID} does not exist in records. They do not have the chat role.`);
		}
		else{
			chatList[userUID].lastEnteredVoiceChat = getSwatchTime();
		}
	}
	
	await saveUserFile(chatList);
	await calcLoseBucks(userUIDs, false);
}

async function calcLoseBucks(userUIDs, exited){
	
	let chatList = await getUsers();
	for (let userUID of userUIDs) {
		if(chatList[userUID] == null){
			console.error(`User: ${userUID} does not exist in records. They do not have the chat role.`);
		}
		else{
			
			const lastEnteredVoiceChat = chatList[userUID].lastEnteredVoiceChat
			let exitedVoiceChat = getSwatchTime();
			let totalTime = 0;
			
			if (lastEnteredVoiceChat > -1){
				if (exitedVoiceChat < lastEnteredVoiceChat){
					totalTime = (1000 - lastEnteredVoiceChat) + exitedVoiceChat;
				}
				else{
					totalTime = exitedVoiceChat - lastEnteredVoiceChat;
				}
				chatList[userUID].LOSEBucks += totalTime;
				
				if(exited){
					chatList[userUID].lastEnteredVoiceChat = -1;
				}
				else{
					chatList[userUID].lastEnteredVoiceChat = exitedVoiceChat;
				}
			}
		}
	}
	await saveUserFile(chatList);
}

async function canStillAfford(userUID){
	let chatList = await getUsers();
	
	let loseBucks = chatList[userUID].LOSEBucks;
	let roleArr = [];
	
	for (let item of wiiShop.purchasable) {
		if(loseBucks < item.cost){
			roleArr.push(item.uid);
		}
	}
	if(chatList[userUID].Sweedobux < 1000000){
		roleArr.push(wiiShop.unlockable[1].uid);
	}
	return roleArr;
}

async function getMayorOfSweedoville(){
	let chatList = await getUsers();
	const memberUIDs = Object.keys(chatList);
	let highestMemberUID = '';
	let highestValue = -1;
	for (let memberUID of memberUIDs) {
		if(highestValue <= chatList[memberUID].Sweedobux){
			highestMemberUID = memberUID;
			highestValue = chatList[memberUID].Sweedobux;
		}
	}
	
	if (highestValue >= 1000000){
		return highestMemberUID;
	}
	
	return null;
}

async function getRoles(userUID){
	await canStillAfford(userUID);
	let chatList = await getUsers();
	let loseBucks = chatList[userUID].LOSEBucks;
	let roleArr = [];

	for (let item of wiiShop.purchasable) {
		if(loseBucks >= item.cost){
			roleArr.push(item.uid);
		}
	}
	console.log(chatList[userUID].Sweedobux >= 1000000);
	console.log(chatList[userUID]);
	if(chatList[userUID].Sweedobux >= 1000000){
		roleArr.push(wiiShop.unlockable[1].uid);
	}
	return roleArr;
}

async function buyItem(userUID, itemName, isOverride){
	let chatList = await getUsers();
	let loseBucks = chatList[userUID].LOSEBucks;
	let bought = false;
	for (let item of wiiShop.purchasable) {
		if(item.name == itemName){
			if(loseBucks >= item.cost){
				chatList[userUID].LOSEBucks -= item.cost;
				bought = true;
			}
			else if(isOverride){
				chatList[userUID].LOSEBucks -= item.cost;
				bought = false;
			}
			else{
				bought = false;
			}
		}
	}
	await saveUserFile(chatList);
	return bought;
}


function getSwatchTime(){
	const today = new Date();
	const utc = new Date(today.valueOf());
	const swatchTime = Math.floor(((3600 * utc.getUTCHours()) + (60 * utc.getUTCMinutes()) + utc.getUTCSeconds()) / 86.4);
	return swatchTime;
}


module.exports.voiceChatEnters = voiceChatEnters;
module.exports.getSwatchTime = getSwatchTime;
module.exports.calcLoseBucks = calcLoseBucks;
module.exports.getRoles = getRoles;
module.exports.canStillAfford = canStillAfford;
module.exports.buyItem = buyItem;
module.exports.getMayorOfSweedoville = getMayorOfSweedoville;