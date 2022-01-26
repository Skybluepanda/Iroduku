const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slist')
		.setDescription('Lists series'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
