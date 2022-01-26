const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addgem')
		.setDescription('adds gem to player account'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
