const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');

async function checkIDS(interaction) {
	const cid = interaction.options.getInteger('cid');
	const iNumber = interaction.options.getInteger('image_number')
	try {
		
		if (1 <= iNumber < 10) {
			const count = await database.Image.count({ where: {characterID: cid, imageNumber: iNumber}})
			if (count != 0) {
				await interaction.reply(`Character ${cid} already has an image ${iNumber}, maximum is 10.`)
			} else {
				upload(interaction);
			};
		} else {
			await interaction.reply("Range of image number is 1-10.")
		}
	} catch(error){
		await interaction.reply("Error has occured");
	}
}

function imageFilename(interaction) {
	try {
		const cid = interaction.options.getInteger('cid');
		const char = database.Character.findOne({where: {characterID: cid}});
		const charname = char.characterName
		const nsfw = interaction.options.getBoolean('nsfw');
		if (nsfw) {
			const imgName = 'SPOILER_'+ charname + '.png';
			return imgName;
		} else {
			const imgName = charname + '.png';
			return imgName;
		}
	} catch(error) {
		console.log(error + " @imageupload/imagefilename.");
	}

}

async function border(interaction) {
	try {
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
		const imgName = await imageFilename(interaction);
		
		const attachment = await new MessageAttachment(canvas.toBuffer(), imgName);
		if (attachment) {
			await interaction.reply({ files: [attachment] });
			return true;
	} else {
			await interaction.reply("Image error.")
			return false;
		}
	} catch(error) {
		console.log("Error with border funciton");
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
	try {
		const cid = await interaction.options.getInteger('cid');
		const char = await database.Character.findOne({where: {characterID: cid}})
		const iNumber = await interaction.options.getInteger('image_number');
		const art = await interaction.options.getString('artist_name');
		const isnsfw = await interaction.options.getBoolean('nsfw');
		const uploader = await interaction.user.username;
		const bordered = await border(interaction);
		if (!bordered) {
			return interaction.channel.send("image failed.")
		}
		const message = await interaction.fetchReply();
			

		const link = await message.attachments.first().url;
		const image = await database.Image.create({
			characterID: cid,
			imageNumber: iNumber,
			imageURL: link,
			artist: art,
			nsfw: isnsfw, 
			uploader: uploader,
		});
		await database.Character.increment({imageCount: 1}, {where: {characterID: cid}})
		// const char = await database.Character.findOne({where: {characterID:cid}});
		// await char.increment('imageCount', {by: 1});
		await database.Player.increment({gems: 75, karma: 3}, {where: {playerID: interaction.user.id}})
		
		return await interaction.channel.send(`Image for ${char.characterName} added!
Image ID (One u use for delete and edit): ${image.imageID}
Image Number: ${iNumber}
Artist: ${art}
You've been rewarded 75 gems and karma, thanks for your hard work!`)
	} catch(error) {
		interaction.channel.send("Something went wrong. Dw if image got uploaded u got the rewards.");
	}
	
	
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('iupload')
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
		.addBooleanOption(option => option
			.setName('nsfw')
			.setDescription('is this an nsfw image or gif?')
			.setRequired(true)),
	async execute(interaction) {
		//check if character exists, and image number is empty
		//than create the image in database with all details.
		if (interaction.channel.id === '947123054570512395') {
            if (!interaction.member.roles.cache.has('947640668031975465')) {
                return interaction.reply("You don't have the photoshopper role!", {ephemeral: true});
            };
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
		} else {
			interaction.reply("use #send-image to send images please.")
		}
	}
}
