const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('../data/config.json');
const fs = require('fs');

const commands = [];
const commandFiles = fs.readdirSync('./fishcommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`../fishcommands/${file}`);
	commands.push(command.data.toJSON());
    console.log(`Command ${file} sucessfully added to list of commands.`)
}

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();