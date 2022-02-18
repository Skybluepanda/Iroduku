const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('iedit')
		.setDescription('Edits image detail'),
	async execute(interaction) {
		await interaction.reply(`Doesn't Work!`);
	},
};
