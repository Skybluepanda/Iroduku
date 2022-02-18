const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment } = require('discord.js');
const database = require('../../database.js');

async function checkIDS(interaction) {
	const cid = interaction.options.getInteger('cid');
	const iNumber = interaction.options.getInteger('image_number')
	console.log("10");
	try {
		console.log("10.1");
		if (0 <= iNumber < 25) {
			console.log("10.2");
			const count = await database.Image.count({ where: {characterID: cid, imageNumber: iNumber}})
			console.log(count);
			if (count != 0) {
				console.log("10.3");
				await interaction.reply(`Character ${cid} already has an image ${iNumber}, maximum is 24.`)
			} else {
				console.log("10.4");
				upload(interaction);
			};
		} else {
			await interaction.reply("Range of image number is 0-24.")
		}
	} catch(error){
		await interaction.reply("Error has occured");
	}
}

async function border(interaction) {
	const imagelink = await interaction.options.getString('image_link')
	const canvas = await createCanvas(225, 350);
	const context = await canvas.getContext('2d');
	const pic = await loadImage(imagelink);
	context.drawImage(pic, 0, 0, canvas.width, canvas.height);
	context.strokeStyle = '#ffffff';
	context.lineWidth = 4;

// Draw a rectangle with the dimensions of the entire canvas
	context.strokeRect(0, 0, canvas.width, canvas.height);

	const attachment = await new MessageAttachment(canvas.toBuffer(), 'ayaka.png');
	
	await interaction.reply({ files: [attachment] });
	
	console.log("9");
}

function checkNSFW(interaction){
	const nsfw = interaction.options.getBoolean('nsfw');
	const iNumber = interaction.options.getInteger('image_number');
	console.log("7");
	if ((nsfw && 25 > iNumber > 9) || (!nsfw && 0 <= iNumber < 10)) {
		console.log("7.1");
		return true;
	} else {
		console.log("7.2");
		return false;
	}
}


async function upload(interaction) {
	const cid = await interaction.options.getInteger('cid');
	const iNumber = await interaction.options.getInteger('image_number');
	const art = await interaction.options.getString('artist_name');
	const sauce = await interaction.options.getString('source');
	const isnsfw = await interaction.options.getBoolean('nsfw');
	const uploader = await interaction.user.id;
	await border(interaction);
	const message = await interaction.fetchReply();
	console.log("8");

	const link = await message.attachments.first().url;
	// const link = await message.attachments.getString(attachment => {
	// 	const link = attachment.proxyURL;
	// 	console.log(link);
	// })
	console.log("5");
	console.log(cid);
	console.log(iNumber);
	console.log(art);
	console.log(sauce);
	console.log(isnsfw);
	await database.Image.create({
		characterID: cid,
		imageNumber: iNumber,
		imageURL: link,
		artist: art,
		source: sauce,
		nsfw: isnsfw, 
		uploader: uploader,
	});
	console.log("6");
	await database.Character.increment({imageCount: 1}, {where:{ characterID: cid}})
	try {
		await database.Player.increment({gems: 10}, {where: {playerID: interaction.user.id}})
	} catch(error) {
		interaction.followUp("You are not a registered player");
	}
	return await interaction.followUp("Image added to the database.")
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('imageupload')
		.setDescription('Adding image to the database for the character, image should be 225x350px in size.')
		.addIntegerOption(option => option
			.setName('cid')
			.setDescription('Id of the character')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('image_number')
			.setDescription('id number for characters image slot. Pick an empty one.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('image_link')
			.setDescription('link of the image or upload.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('artist_name')
			.setDescription('name of the artist')
			.setRequired(true))
		.addStringOption(option => option
			.setName('source')
			.setDescription('image source link.')
			.setRequired(true))
		.addBooleanOption(option => option
			.setName('nsfw')
			.setDescription('is this an nsfw image or gif?')
			.setRequired(true)),
	async execute(interaction) {
		//check if character exists, and image number is empty
		//than create the image in database with all details.
		console.log("0");
		try {
			if (checkNSFW(interaction)){
				console.log("1");
				checkIDS(interaction);
				console.log("2");
			} else {
				console.log("3");
				return await interaction.reply("None NSFW images have number 0-9, NSFW images have number 10-24")
			}
		} catch(error){
			return await interaction.channel.send("Error has occured");
		}
		
	}
}
