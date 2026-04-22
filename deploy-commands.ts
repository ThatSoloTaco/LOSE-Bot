import { REST, Routes } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";


const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);
const commandsData = Object.values(commands).map((command) => command.data);

console.log(commandsData);

rest
  .put(
    Routes.applicationGuildCommands(
      config.DISCORD_CLIENT_ID,
      config.DISCORD_GUILD_ID,
    ),
    {
       body: commandsData,
    },
  )
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
