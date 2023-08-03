const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');

function imageFilename(interaction) {
	try {
		const cid = interaction.options.getInteger('cid');
		const char = database.Character.findOne({where: {characterID: cid}});
		const charname = char.characterName
		const imgName = charname + '.png';
		return imgName;
	} catch(error) {
		console.log(error + " @imageupload/imagefilename.");
	}
}

async function border(interaction) {
	try {
		const imagelink = await interaction.options.getString('imagelink')
		const canvas = await createCanvas(450, 700);
		const context = await canvas.getContext('2d');
		const pic = await loadImage(imagelink);
		context.drawImage(pic, 0, 0, canvas.width, canvas.height);
		context.strokeStyle = '#ffffff';
		context.lineWidth = 8;

	// Draw a rectangle with the dimensions of the entire canvas
		context.strokeRect(0, 0, canvas.width, canvas.height);
		const imgName = await imageFilename(interaction);
		
		const attachment = await new MessageAttachment(canvas.toBuffer(), imgName);
		if (attachment) {
			await interaction.reply({ files: [attachment] });
			return true;
		} else {
			await interaction.reply("Something went wrong with the image link, make sure your image is jpeg or png.")
			return false;
		}
	} catch(error) {
		console.log("Error with border funciton");
	}
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ireplace')
		.setDescription('Edits image Details')
        .addIntegerOption(option => option
            .setName("id")
            .setDescription("The id of the image")
            .setRequired(true))
        .addStringOption(option => option
            .setName("imagelink")
            .setDescription("The link to the image.")
            .setRequired(true)),
	async execute(interaction) {
        if (!interaction.member.roles.cache.has('947640668031975465')) {
            return interaction.reply("You don't have the photoshopper role!", {ephemeral: true});
        };
        if (interaction.channel.id === '947123054570512395') {
            try {
                const id = interaction.options.getInteger('id');
                const imageID = interaction.options.getString('imagelink')
                console.log("1");
                console.log("1");
            } catch (error) {
                console.log("u fucked up");
                return interaction.reply({embeds: [embedError(interaction)]});
            }
        } else {
			interaction.reply("use #send-image to edit images please.")
		}
	},
};