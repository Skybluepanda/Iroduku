const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Opens Inventory!'),
	async execute(interaction) {
		await interaction.reply(`Doesn't Work!`);
	},
};
