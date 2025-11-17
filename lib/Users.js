const fs = require('node:fs');
const path = require('node:path');
const util = require('util');
const { dataDirectory, userFile } = require('../auth.json');

async function createUsers(chat, admins, auditLogs) {
	let chatList = await getUsers();

	try{
		const adminList = admins.map(a => a.user.id)
		
		// Updates missing Users
		await chat.forEach(async(member) => {
			if(chatList[member.user.id] == null){
				chatList[member.user.id] = {
					profileName: member.user.username,
					isAdmin: adminList.includes(member.user.id),
					nicknames:[],
					LOSEBucks:0,
					Sweedobux: 0,
					preferredName:"",
					lastEnteredVoiceChat:-1};
			}
			
			// Updates missing nicknames, limited by the audit log
			const auditEntries = auditLogs.entries.filter(l => l.targetId == member.user.id);
			const nicknameList = chatList[member.user.id].nicknames.map(n => n.nickname);
			
			const missingNicknames = auditEntries.filter(f => !nicknameList.includes(f.changes[0]["new"])).map((f) => ({
				nickname: f.changes[0]["new"],
				date: f.createdTimestamp,
				changedBy: f.executorId
			}));
			
			if (missingNicknames.length > 0){
				chatList[member.user.id].nicknames = chatList[member.user.id].nicknames.concat(missingNicknames);
			}
			saveUserFile(chatList);
		});
	}
	catch(e){
		console.error(e);
		console.log("Something has gone wrong. Please read logs and restart.");
	}
}

async function saveUserFile(chatList){
	const chatFilePath = await getUserFile();
	try{
		await fs.writeFileSync(chatFilePath, JSON.stringify(chatList));
	}catch(e){
		console.error(e);
	}
}

function getUserFile(){
	const dateObj = new Date();
	const year    = dateObj.getUTCFullYear();
	const userFileName = userFile + "-" + year + ".json";
	const userFilePath = path.join(__dirname, dataDirectory, userFileName);
	return userFilePath;
}

async function getUsers(){
	
	const readFile = util.promisify(fs.readFile);
	let chatFileDir = path.join(__dirname, dataDirectory);
	const chatFilePath = getUserFile();
	
	if (!fs.existsSync(chatFileDir)) {
		fs.mkdirSync(chatFileDir, { recursive: true });
		console.info(`Created Directory: ${chatFileDir}`);
		return {};
	}

	if (!fs.existsSync(chatFilePath)) {
		return {};
	}

	function getJsonFile(userFile) {
		return readFile(userFile, 'utf8');
	}

	let userList;
	await getJsonFile(chatFilePath).then(data => {
		userList = JSON.parse(data);
	});
	
	return userList;
}

async function revertNickname(){

	
}


async function updateNickname(executor, oldMember, newMember) {
	let fully_completed = true;
	let chatList = await getUsers();
	
	let user, newNickname;
	try{
		user = oldMember.user.id
		newNickname = newMember.nickname
		
		if(chatList[user] == null || chatList[executor.user.id] == null){
			fully_completed = false
		}
		if (chatList[user] != null && executor.user.id != user){
			chatList[user].nicknames.push({
				nickname: newNickname,
				date: getEpochTime(),
				changedBy: executor.user.id
			});
		}
		else if(chatList[user] != null && executor.user.id == user){
			const nicknameList = chatList[member.user.id].nicknames.map(n => n.nickname);
			if(!nicknameList.contains(newNickname)){
				await interaction.guild.members.edit(user, {nick:oldMember.nickname});
			}
		}
		saveUserFile(chatList);
	}
	catch(e){
		console.error(e);
		fully_completed = false
	}
	return fully_completed;
}



function getEpochTime(){
	const today = new Date();
	return today.getTime();
}


module.exports.createUsers = createUsers
module.exports.getUsers = getUsers
module.exports.getUserFile = getUserFile
module.exports.updateNickname = updateNickname
module.exports.saveUserFile = saveUserFile
module.exports.getEpochTime = getEpochTime