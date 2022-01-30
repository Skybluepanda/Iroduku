const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slist')
		.setDescription('Lists series')
		.addIntegerOption(option => 
			option.setName('sID')
			.setDescription('Enter the series ID'))
		.addStringOption(option => 
			option.setName('sName')
			.setDescription('Enter the new series name')),
		
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
