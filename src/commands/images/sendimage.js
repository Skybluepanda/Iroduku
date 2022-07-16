const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');

async function checkIDS(interaction) {
	const cid = interaction.options.getInteger('cid');
	const iNumber = interaction.options.getInteger('image_number')
	const char = database.Character.findOne({where: {characterID:cid}});
	try {
		if (char) {
			if (1 <= iNumber) {
				const exist = await database.Image.findOne({ where: {characterID: cid, imageNumber: iNumber}});
				const queue = await database.Sendqueue.findOne({ where: {characterID: cid, imageNumber: iNumber}});
				if (exist || queue) {
					await interaction.reply(`Character ${cid} already has an image ${iNumber} or sent image is queued, maximum is 10.`)
				} else {
					upload(interaction);
				};
			} else {
				await interaction.reply("Range of image number is 1-10.")
			}
		} else {
			await interaction.reply("Cid doesn't exist.");
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
		const imgName = charname + '.png';
		return imgName;
	} catch(error) {
		console.log(error + " @imageupload/imagefilename.");
	}
}

async function border(interaction) {
	try {
		const imagelink = await interaction.options.getString('image_link')
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
			await interaction.reply("Image error.")
			return false;
		}
	} catch(error) {
		console.log("Error with border funciton");
	}
}



async function upload(interaction) {
	try {
		const imagelink = await interaction.options.getString('image_link')
		const cid = await interaction.options.getInteger('cid');
		const char = await database.Character.findOne({where: {characterID: cid}})
		const iNumber = await interaction.options.getInteger('image_number');
		const art = await interaction.options.getString('artist_name');
		const uploader = await interaction.user.username;
		const uploaderid = await interaction.user.id;
		const bordered = await border(interaction);
		const player = await database.Player.findOne({where: {playerID: interaction.user.id}});
		if (!bordered) {
			return interaction.channel.send("image failed.")
		}
		const message = await interaction.fetchReply();
			

		const link = await message.attachments.first().url;
		const image = await database.Sendqueue.create({
			characterID: cid,
			imageNumber: iNumber,
			imageURL: link,
			artist: art,
			nsfw: false,
			selfcrop: true, 
			uploader: uploader,
			uploaderid: player.id
		});
		// await database.Character.increment({imageCount: 1}, {where: {characterID: cid}})
		// const char = await database.Character.findOne({where: {characterID:cid}});
		// await char.increment('imageCount', {by: 1});
		// await database.Player.increment({gems: 75, karma: 3}, {where: {playerID: interaction.user.id}})
		const channel = await interaction.guild.channels.cache.get('950318845430726686');
		await channel.send(`${cid} | ${char.characterName}'s image ${iNumber}
uploaded by ${uploader} and art by ${art}.`);
		await channel.send(`${imagelink}`);
		return await interaction.channel.send(`Image for ${char.characterName} added!
Image ID (used for delete and edit): ${image.imageID}
Image Number: ${iNumber}
Artist: ${art}
Image has entered the send queue and will be reviewed by image mods.
You will recieve minimum of 50 gems and 1 karma and more depending on submition quality!`);
	} catch(error) {
		interaction.channel.send("Something went wrong. Ask an image mod if the image got uploaded.");
	}
}

async function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Art Archived")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Followup should be the card embed.")
        .setColor(color.successgreen);
    
    return embed;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isend')
		.setDescription('Adding image to the database for the character, image should be 450x700px in size.')
		.addIntegerOption(option => option
			.setName('cid')
			.setDescription('Id of the character')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('image_number')
			.setDescription('id number for characters image slot. Pick an empty slot number between -5 and 10 and not 0.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('image_link')
			.setDescription('link of the image or upload.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('artist_name')
			.setDescription('name of the artist')
			.setRequired(true)),
	async execute(interaction) {
		//check if character exists, and image number is empty
		//than create the image in database with all details.
		if (interaction.channel.id === '947123054570512395') {
            if (!interaction.member.roles.cache.has('947640668031975465')) {
                return interaction.reply("You don't have the image sender role!", {ephemeral: true});
            };
			try {
				checkIDS(interaction);
			} catch(error){
				await interaction.channel.send("Error has occured");
			}
		} else {
			interaction.reply("use #send-image to send images please.")
		}
	}
}