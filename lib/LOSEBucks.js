const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { getUsers, saveUserFile } = require("../lib/Users.js");

async function voiceChatEnters(user) {
	let chatList = await getUsers();
	
	chatList[user.id].lastEnteredVoiceChat = getSwatchTime();
	saveUserFile(chatList);
}

async function calcLoseBucks(user, exited){
	let chatList = await getUsers();
	
	const lastEnteredVoiceChat = chatList[user.id].lastEnteredVoiceChat
	let exitedVoiceChat = getSwatchTime();
	let totalTime = 0;
	
	if (lastEnteredVoiceChat > -1){
		if (exitedVoiceChat < lastEnteredVoiceChat){
			totalTime = (1000 - lastEnteredVoiceChat) + exitedVoiceChat;
		}
		else{
			totalTime = exitedVoiceChat - lastEnteredVoiceChat;
		}
	}
	
	chatList[user.id].LOSEBucks += totalTime;
	if(exited){
		chatList[user.id].lastEnteredVoiceChat = -1;
	}
	else{
		chatList[user.id].lastEnteredVoiceChat = exitedVoiceChat;
	}
	saveUserFile(chatList);
}


function getSwatchTime(){
	const today = new Date();
	const utc = new Date(today.valueOf());
	const swatchTime = Math.floor(((3600 * utc.getUTCHours()) + (60 * utc.getUTCMinutes()) + utc.getUTCSeconds()) / 86.4);
	return swatchTime;
}


module.exports.voiceChatEnters = voiceChatEnters
module.exports.getSwatchTime = getSwatchTime
module.exports.calcLoseBucks = calcLoseBucks