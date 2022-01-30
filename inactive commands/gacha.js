const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gacha')
		.setDescription('tests your luck and pulls a character.'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
