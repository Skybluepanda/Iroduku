const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clist')
		.setDescription('Lists all characters'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
