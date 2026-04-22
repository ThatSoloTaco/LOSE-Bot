import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID, CRON_DB_BACK, FILENAME, BACKUP_FILE_DIR, MEME_FILE_DIR} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID || !CRON_DB_BACK || !FILENAME || !BACKUP_FILE_DIR || !MEME_FILE_DIR) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  CRON_DB_BACK,
  FILENAME,
  BACKUP_FILE_DIR,
  MEME_FILE_DIR,
};