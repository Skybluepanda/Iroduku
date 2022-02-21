const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');

async function checkIDS(interaction) {
	const cid = interaction.options.getInteger('cid');
	const iNumber = interaction.options.getInteger('image_number')
	try {
		if (0 <= iNumber < 25) {
			const count = await database.Image.count({ where: {characterID: cid, imageNumber: iNumber}})
			if (count != 0) {
				await interaction.reply(`Character ${cid} already has an image ${iNumber}, maximum is 24.`)
			} else {
				upload(interaction);
			};
		} else {
			await interaction.reply("Range of image number is 0-24.")
		}
	} catch(error){
		await interaction.reply("Error has occured");
	}
}

function imageFilename(interaction, name) {
	const nsfw = interaction.options.getBoolean('nsfw');
	if (nsfw) {
		const imgName = 'SPOILER_'+ name + '.png';
		return imgName;
	} else {
		const imgName = name + '.png';
		return imgName;
	}

}

async function border(interaction) {
	const imagelink = await interaction.options.getString('image_link')
	const canvas = await createCanvas(225, 350);
	const context = await canvas.getContext('2d');
	const pic = await loadImage(imagelink);
	const nsfw = await interaction.options.getBoolean('nsfw');
	context.drawImage(pic, 0, 0, canvas.width, canvas.height);
	context.strokeStyle = '#ffffff';
	context.lineWidth = 4;

// Draw a rectangle with the dimensions of the entire canvas
	context.strokeRect(0, 0, canvas.width, canvas.height);
	const cid = interaction.options.getInteger('cid');
	const char = database.Character.findOne({where: {characterID: cid}});
	const charname = char.characterName;
	const imgName = await imageFilename(interaction, charname);
	
	const attachment = await new MessageAttachment(canvas.toBuffer(), imgName);
	if (attachment) {await interaction.reply({ files: [attachment] });} else {
		interaction.reply("Image error.")
	}
	
	
}

// function checkNSFW(interaction){
// 	const nsfw = interaction.options.getBoolean('nsfw');
// 	const iNumber = interaction.options.getInteger('image_number');
// 	if ((nsfw && 25 > iNumber > 9) || (!nsfw && 0 <= iNumber < 10)) {
// 		return true;
// 	} else {
// 		return false;
// 	}
// }


async function upload(interaction) {
	const cid = await interaction.options.getInteger('cid');
	const iNumber = await interaction.options.getInteger('image_number');
	const art = await interaction.options.getString('artist_name');
	const sauce = await interaction.options.getString('source');
	const isnsfw = await interaction.options.getBoolean('nsfw');
	const uploader = await interaction.user.username;
	await border(interaction);
	const message = await interaction.fetchReply();

	const link = await message.attachments.first().url;
	await database.Image.create({
		characterID: cid,
		imageNumber: iNumber,
		imageURL: link,
		artist: art,
		source: sauce,
		nsfw: isnsfw, 
		uploader: uploader,
	});
	try {
		await database.Character.increment({imageCount: 1}, {where: {characterID: cid}})
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
		try {
			checkIDS(interaction);
			// if (checkNSFW(interaction)){
			// 	checkIDS(interaction);
			// } else {
			// 	return await interaction.reply("None NSFW images have number 0-9, NSFW images have number 10-24")
			// }
		} catch(error){
			await interaction.channel.send("Error has occured");
		}
	}
}
