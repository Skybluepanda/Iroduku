const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ilist')
		.setDescription('Lists images for the character!'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
