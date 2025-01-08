const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, AuditLogEvent } = require('discord.js');
const { token, guildId, chatRoleUID, adminRoleUID } = require('./auth.json');
const { SlashCommandBuilder } = require('discord.js');
const { createUsers, updateNickname } = require("./lib/Users.js");
const { voiceChatEnters, calcLoseBucks } = require("./lib/LOSEBucks.js");

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async (c) => {
	console.log(`Loading Instance`)
	
	const guild = await client.guilds.fetch(guildId);
	const members = await guild.members.fetch();
	const chat = await guild.roles.cache.get(chatRoleUID).members;
	const admins = await guild.roles.cache.get(adminRoleUID).members;
	const auditLogs = await guild.fetchAuditLogs({
		type: AuditLogEvent.MemberUpdate
	});
	await createUsers(chat, admins, auditLogs);
	
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	if(file === `stickers.js`){
			const picsPath = path.join(__dirname, 'memes');
			const picsFiles = fs.readdirSync(picsPath).filter(file => file.endsWith('.png'));
			for (const pic of picsFiles){
				const picSplit = pic.split('.');
				client.commands.set(picSplit[0], {
					data: new SlashCommandBuilder()
						.setName(picSplit[0])
						.setDescription(`Posts the ${picSplit[0]} sticker`),
					async execute(interaction) {
						await interaction.deferReply();
						await interaction.deleteReply();
						await interaction.channel.send({ files: [{ attachment: `memes/${pic}` }] });
					}
				});
			}
		}
		else{
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			// Set a new item in the Collection with the key as the command name and the value as the exported module
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  let newUserChannel = newState.channel;
  let oldUserChannel = oldState.channel;
  
  if (oldUserChannel === null && newUserChannel !== null) {
	  
	  const guild = await client.guilds.fetch(guildId);
	  const members = await guild.members.fetch();
	  let user = members.get(oldState.id)
	  voiceChatEnters(user);
	  
    } else if (oldUserChannel !== null && newUserChannel === null) {
		
      const guild = await client.guilds.fetch(guildId);
	  const members = await guild.members.fetch();
	  let user = members.get(oldState.id)
	  calcLoseBucks(user, true);
	  
    }
});

// Commenting out for now, will need to modify it after the patch has been put in.
/*
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
	if(oldMember.nickname != newMember.nickname){
		const guild = await client.guilds.fetch(guildId);
		const fetchedLogs = await guild.fetchAuditLogs({
			type: AuditLogEvent.MemberUpdate,
			limit: 1
			//user: oldMember.user
		});
		const firstEntry = fetchedLogs.entries.first();
		const members = await guild.members.fetch();
		console.log(JSON.stringify(fetchedLogs.entries));
		const executor = members.get(firstEntry.executorId);
		
		let completed = updateNickname(executor, oldMember, newMember);
		if(!completed){
			const chat = await guild.roles.cache.get(chatRoleUID).members;
			await createUsers(chat, guild);
		}
	}
});*/