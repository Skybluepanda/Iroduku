const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents, CommandInteractionOptionResolver } = require('discord.js');
const { clientId, guildId, token } = require('./data/config.json');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const fishCommandFiles = fs.readdirSync('./fishcommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);	
}

for (const file of fishCommandFiles) {
	const command = require(`./fishcommands/${file}`);
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
		console.log(`Event ${file} sucessfully triggered once.`)
	} else {
		client.on(event.name, (...args) => event.execute(...args));
		console.log(`Event ${file} sucessfully added to events.`)
	}
}
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
})
client.login(token);