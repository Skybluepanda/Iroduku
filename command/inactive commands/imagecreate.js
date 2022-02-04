const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('icreate')
		.setDescription('Creates an image object in the database'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
