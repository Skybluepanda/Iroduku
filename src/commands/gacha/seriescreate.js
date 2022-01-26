const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('screate')
		.setDescription('Creates a new series'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
