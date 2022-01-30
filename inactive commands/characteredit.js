const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cedit')
		.setDescription('Edits a character Detail.'),
	async execute(interaction) {
		await interaction.reply(`Doesn't Work!`);
	},
};
