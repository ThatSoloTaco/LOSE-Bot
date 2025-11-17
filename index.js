const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, AuditLogEvent } = require('discord.js');
const { token, guildId, chatRoleUID, adminRoleUID, afkChannelUID, soundDirectory } = require('./auth.json');
const { SlashCommandBuilder } = require('discord.js');
const { createUsers, updateNickname } = require("./lib/Users.js");
const { voiceChatEnters, calcLoseBucks, getRoles, canStillAfford, buyItem, getMayorOfSweedoville } = require("./lib/WiiShop.js");
const { joinVoiceChannel, createAudioResource, createAudioPlayer, AudioPlayerStatus} = require('@discordjs/voice');
const wiiShop  = require("./data/wii-shop.json");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages] });

async function getMembersByRole(memberUID, roleUID){
  const guild = await client.guilds.fetch(guildId);
  const roleMembers = await guild.roles.cache.get(roleUID).members;
  return await roleMembers.get(memberUID);
}

async function removeRoles(memberUID, roleList){
	const member = await getMembersByRole(memberUID, chatRoleUID);
	const guild = await client.guilds.fetch(guildId);
	await guild.roles.fetch();
	for(const roleUID of roleList){
		const role = await guild.roles.fetch(roleUID);
		await member.roles.remove(role);
	}
	await updateMayor();
}

async function updateMayor(){
	let mayorUID = await getMayorOfSweedoville();

	const guild = await client.guilds.fetch(guildId);
	const members = await guild.members.fetch();
	const chatMembers = await guild.roles.cache.get(chatRoleUID).members.map(m=>m.user.id);
	for(const userUID of chatMembers){
			
		let member = await members.get(userUID);

		if(member.id != mayorUID){
			const role = await guild.roles.fetch(wiiShop.unlockable[0].uid);
			await member.roles.remove(role);
		}
		else{
			const role = await guild.roles.fetch(wiiShop.unlockable[0].uid);
			await member.roles.add(role);
		}
	}
	
}

async function addRoles(memberUID, roleList){
	const member = await getMembersByRole(memberUID, chatRoleUID);
	const guild = await client.guilds.fetch(guildId);
	await guild.roles.fetch();
	for(const roleUID of roleList){
		const role = await guild.roles.fetch(roleUID);
		await member.roles.add(role);
	}
	await updateMayor();
}

async function updateAllUsers(){
	const guild = await client.guilds.fetch(guildId);
	const members = await guild.members.fetch();
	const chatMembers = await guild.roles.cache.get(chatRoleUID).members;
	const adminMembers = await guild.roles.cache.get(adminRoleUID).members;
	const auditLogs = await guild.fetchAuditLogs({
		type: AuditLogEvent.MemberUpdate
	});
	await createUsers(chatMembers, adminMembers, auditLogs);
	await updateMayor();
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c) => {
	console.log(`Loading Instance...`);
	await updateAllUsers();
	console.log(`Ready! Logged in as ${c.user.tag}`);
	

});


// Log in to Discord with your client's token
client.login(token);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && ('execute' in command || 'autocomplete' in command)) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	  const user = await getMembersByRole(interaction.user.id, chatRoleUID);
  
	  if (user != null) {
		if (interaction.isChatInputCommand()){
			try {
				const command = interaction.client.commands.get(interaction.commandName);

				if (!command) {
					console.error(`No command matching ${interaction.commandName} was found.`);
					return
				}
				if(interaction.commandName == 'play-sound'){
					if(user.voice){
						const bought = await buyItem(user.id, "1/1", false);
						const rolesToRemove = await canStillAfford(user.id);
						if(!bought) {
							await interaction.channel.send(`Uh-oh ${interaction.user}, tried playing a silly song without the LOSE Bucks required. Cringe, L+Ratio+Weak, not very poggies.`);
						}
						else {
						
							await interaction.deferReply();
							await interaction.deleteReply();
						
							const guild = await client.guilds.fetch(guildId);
							const connection = await joinVoiceChannel({
								channelId: user.voice.channelId,
								guildId: guildId,
								adapterCreator: guild.voiceAdapterCreator,
							});
							
							
							let subscription;
							let player = createAudioPlayer();
							let soundName = interaction.options.get('name');
							let soundNameValue = soundName.value;
							subscription = connection.subscribe(player);
							const resource = createAudioResource(path.join(__dirname,`./${soundDirectory}/${soundNameValue}.ogg`));
							if(resource){
								player.play(resource);
							}
							
							player.on(AudioPlayerStatus.Idle, () => {
								subscription.unsubscribe();
								player.stop();
								connection.destroy();
							});
						}
						await removeRoles(user.id, rolesToRemove);
					}
				}
				else{
					await command.execute(interaction);
				}
				if(interaction.commandName == 'loser' || interaction.commandName == 'one-meme-in-planning-chat' || interaction.commandName == 'nickname' || interaction.commandName == 'sweedobux-exchange'){	
					const rolesToRemove = await canStillAfford(user.id);
					await removeRoles(user.id, rolesToRemove);
					
					let rolesToGive = await getRoles(user.id);
					await addRoles(user.id, rolesToGive);
				}
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
		else{
			const command = interaction.client.commands.get(interaction.commandName);
			
			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return
			}
			try {
			  await command.autocomplete(interaction);
			} catch (error) {
			  console.error(error);
			}
		}
	  }
	
});


client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  let newUserChannel = newState.channel;
  let oldUserChannel = oldState.channel;
  const user = await getMembersByRole(oldState.id, chatRoleUID);
  if (user != null) {
	  if (oldUserChannel === null && newUserChannel !== null && newUserChannel != afkChannelUID) {
		const usersInChannel = await newUserChannel.members.filter(async (m) => {await getMembersByRole(m.id, chatRoleUID)}).map(m=>m.id);

		if(usersInChannel.length >= 2){

			await voiceChatEnters(usersInChannel);
			
			await usersInChannel.forEach(async (m) =>{
				let rolesToGive = await getRoles(m);
				await addRoles(m, rolesToGive);
			});
		}
	  } 
	  else if (oldUserChannel !== null && newUserChannel === null && oldUserChannel != afkChannelUID) {
		 const usersInChannel = await oldUserChannel.members.filter(async (m) => {await getMembersByRole(m.id, chatRoleUID)}).map(m=>m.id);

		if(usersInChannel.length < 2){
			usersInChannel.push(user.id);
			await calcLoseBucks(usersInChannel, true);
			
			await usersInChannel.forEach(async (m) =>{
				let rolesToGive = await getRoles(m);
				await addRoles(m, rolesToGive);
			});
		}
		else{
			await calcLoseBucks([user], true);
			let rolesToGive = await getRoles(user.id);
			await addRoles(user.id, rolesToGive);
		}
	  }
  }
});


// Commenting out for now, will need to modify it after the patch has been put in.
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	await updateAllUsers();
});

client.on(Events.MessageCreate, async (message) =>{
	if(message.tts) {
		const user = await getMembersByRole(message.author.id, chatRoleUID);
		if (user != null){
			const bought = await buyItem(message.author.id, "Text To Shitpost", true);
			const rolesToRemove = await canStillAfford(message.author.id);
			if(!bought){
				await message.channel.send(`LOSE Bucks?! In this economy?! It's okay, ${message.user}, it happens to the best of us.`);
			}
			else{
				await removeRoles(user.id, rolesToRemove);
			}
		}
	}
});


// Yeah so slash commands will be needed for Soundboard, One Free Meme In Planning, Ravioli-Ravioli, Sweedobux
