import { Client, Partials, GatewayIntentBits, AuditLogEvent, Events } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { loseDatabaseProcess } from "./db";
import Backup from './cron/backup';


const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildModeration],
	partials: [Partials.GuildMember, Partials.User]
});

client.once("clientReady", async(guild) => {
	console.log("Discord client is ready.");

	await loseDatabaseProcess.run();
	const backupJob = new Backup(loseDatabaseProcess, config.CRON_DB_BACK);
});

client.on("guildCreate", async (guild) => {
  
  await deployCommands({ guildId: guild.id });
  await deploySchedules({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  console.log(commandName as keyof typeof commands);
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});


client.login(config.DISCORD_TOKEN);
