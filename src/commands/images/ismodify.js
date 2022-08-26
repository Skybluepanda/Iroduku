const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ismodify')
		.setDescription('Modifying swap request.')
		.addIntegerOption(option => option
			.setName('swapid')
			.setDescription('Id of the swap')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('image_number')
			.setDescription('id number for characters image slot. Pick a desired slot number between 1 and 10.')
			.setRequired(false))
		.addStringOption(option => option
			.setName('artist_name')
			.setDescription('name of the artist')
			.setRequired(false))
		.addBooleanOption(option => option
			.setName('edit')
			.setDescription('Is this swap a small edit to the existing image?')
			.setRequired(false)),
	async execute(interaction) {
		const swapid = await interaction.options.getInteger('swapid');
		const edit = await interaction.options.getBoolean('edit');
		if (swapid) {
			const swap = await database.Swapimage.findOne({where: {imageID: swapid}});
			await interaction.reply("swapID found\n");
			await swap.update({selfcrop: edit});
			
		} else {
			await interaction.reply("The swap ID you used is not valid.")
		}
		
	}
}
