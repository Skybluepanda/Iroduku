const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pong')
		.setDescription('Replies with Ping!'),
	async execute(interaction) {
		await interaction.reply('Ping!');
        await wait(2000);
        await interaction.editReply('PONG!')
	},
};
