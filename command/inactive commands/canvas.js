const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('canvas')
		.setDescription('add border to an image'),
	async execute(interaction) {
        const canvas = createCanvas(225, 350);
		const context = canvas.getContext('2d');
        const image = await loadImage('src/images/ayayac.png');
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		context.strokeStyle = '#ffffff';
		context.lineWidth = 4;

	// Draw a rectangle with the dimensions of the entire canvas
		context.strokeRect(0, 0, canvas.width, canvas.height);

		const attachment = new MessageAttachment(canvas.toBuffer(), 'ayaka.png');

		interaction.reply({ files: [attachment] });
	},
};
