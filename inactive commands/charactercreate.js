const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ccreate')
		.setDescription('creates a new character in the database'),
	async execute(interaction) {
		await interaction.reply(`Doesn't Work!`);
	},
};
