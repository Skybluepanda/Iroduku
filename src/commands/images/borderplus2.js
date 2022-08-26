const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('borderhd')
		.setDescription('adding the border to the desired image. Image should be 225x350px in size.')
		.addStringOption(option => option
			.setName('imagelink')
			.setDescription('link of the image or upload.')
			.setRequired(true)),
	async execute(interaction) {
		const imagelink = await interaction.options.getString('imagelink')
		const canvas = createCanvas(900, 1400);
		const context = canvas.getContext('2d');
        const image = await loadImage(`${imagelink}`);
		context.drawImage(image, 0, 0, canvas.width, canvas.height);
		context.strokeStyle = '#ffffff';
		context.lineWidth = 8;

	// Draw a rectangle with the dimensions of the entire canvas
		context.strokeRect(0, 0, canvas.width, canvas.height);

		const attachment = await new MessageAttachment(canvas.toBuffer(), 'ayaka.png');
		
		interaction.reply({ files: [attachment] });
		const message = await interaction.fetchReply();
		message.attachments.forEach(attachment => {
			const link = attachment.proxyURL;
			console.log(link)
		})
		
		
		//interaction.followUp("Copy link of the bordered image and update image into the database using /imageupload command. If the image looks wierd, it's possible it's been rescaled automatically to 225x350px.");
	}
}
