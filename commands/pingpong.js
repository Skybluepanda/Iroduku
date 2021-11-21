const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pingpong')
		.setDescription('Replies with Ping! then Pong!'),
	async execute(interaction) {
		await interaction.reply('Ping!');
        await wait(1000);
        await interaction.followUp('Pong!')
	},
};
