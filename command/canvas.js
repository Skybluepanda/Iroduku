const { createCanvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('canvas')
		.setDescription('add border to an image'),
	async execute(interaction) {
		await interaction.reply(`Doesn't work!`);
	},
};
