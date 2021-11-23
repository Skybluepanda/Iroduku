const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pung')
		.setDescription('Replies with Pung! after 4 seconds.'),
	async execute(interaction) {
		await interaction.deferReply();
        await wait(4000);
        await interaction.editReply('Pung!')
	},
};
