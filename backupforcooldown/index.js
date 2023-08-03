const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');
const { token } = require('./data/config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
client.buttons = new Collection();

const functions = fs.readdirSync("./functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync('./commands');

(async () => {
	for (file of functions) {
		require(`./functions/${file}`)(client);
	}
	client.handleEvents(eventFiles, "./events");
	client.handleCommands(commandFolders, "./commands");
	client.login(token);
})();