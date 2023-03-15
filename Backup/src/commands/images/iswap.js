const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');

async function checkIDS(interaction) {
	const cid = interaction.options.getInteger('cid');
	const edit = await interaction.options.getBoolean('edit');
	const iNumber = interaction.options.getInteger('image_number')
	const char = database.Character.findOne({where: {characterID:cid}});
	try {
		if (char) {
			const imageCount = await database.Image.count({where: {characterID: cid}});
			if (imageCount >= 10 && !edit) {
				//check if there's already a swap for the same image slot
				const exist = await database.Swapimage.findOne({ where: {characterID: cid, imageNumber: iNumber}});
				if (exist) {
					await interaction.reply(`Character ${cid} already has an image ${iNumber} swap request.`)
				} else {
					upload(interaction);
				};
			} else if (edit) {
				const exist = await database.Swapimage.findOne({ where: {characterID: cid, imageNumber: iNumber}});
				if (exist) {
					await interaction.reply(`Character ${cid} already has an image ${iNumber} swap request.`)
				} else {
					upload(interaction);
				};
			} else {
				await interaction.reply("You can only swap images if they have maxed out slots.")
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
		const canvas = await createCanvas(450, 700);
		const context = await canvas.getContext('2d');
		const pic = await loadImage(imagelink);
		const nsfw = await interaction.options.getBoolean('nsfw');
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


async function previewswap(interaction) {
	try {
		const imagelink = await interaction.options.getString('image_link')
		const cid = await interaction.options.getInteger('cid');
		const iNumber = await interaction.options.getInteger('image_number');
        const previous = await database.Image.findOne({
            where: {
                characterID: cid,
                imageNumber: iNumber
            }
        });
		const canvas = await createCanvas(900, 700);
		const context = await canvas.getContext('2d');
		const pic1 = await loadImage(imagelink);
        const pic2 = await loadImage(previous.imageURL);
		const nsfw = await interaction.options.getBoolean('nsfw');
		context.drawImage(pic1, 0, 0, 450, canvas.height);
        context.drawImage(pic2, 451, 0, 450, canvas.height);
		
		const attachment = await new MessageAttachment(canvas.toBuffer(), 'swap.png');
		if (attachment) {
			const msg = await interaction.followUp({ files: [attachment] });
			return msg;
		} else {
			await interaction.followUp("Image error.")
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
		const imagelink = await interaction.options.getString('image_link')
		const cid = await interaction.options.getInteger('cid');
		const char = await database.Character.findOne({where: {characterID: cid}})
		const iNumber = await interaction.options.getInteger('image_number');
		const art = await interaction.options.getString('artist_name');
		let selfcrop = await interaction.options.getBoolean('edit');
		const uploader = await interaction.user.username;
		const uploaderid = await interaction.user.id;
		const bordered = await border(interaction);
		const player = await database.Player.findOne({where: {playerID: interaction.user.id}});
		const reason = await interaction.options.getString('reason');
		
		
		
		if (!bordered) {
			return interaction.channel.send("image failed.")
		}
		const message = await interaction.fetchReply();
		const preview = await previewswap(interaction);

		const link = await message.attachments.first().url;
		const link2 = await preview.attachments.first().url;
		const image = await database.Swapimage.create({
			characterID: cid,
			imageNumber: iNumber,
			imageURL: link,
			previewURL: link2,
			artist: art,
			nsfw: false,
			selfcrop: selfcrop, 
			uploader: uploader,
			uploaderid: player.id,
			reason: reason
		});
		// await database.Character.increment({imageCount: 1}, {where: {characterID: cid}})
		// const char = await database.Character.findOne({where: {characterID:cid}});
		// await char.increment('imageCount', {by: 1});
		// await database.Player.increment({gems: 75, karma: 3}, {where: {playerID: interaction.user.id}})
// 		const channel = await interaction.guild.channels.cache.get('950318845430726686');
// 		await channel.send(`${cid} | ${char.characterName}'s image ${iNumber}
// uploaded by ${uploader} and art by ${art}.
// Small Edit: ${selfcrop}`);
// 		await channel.send(`${imagelink}`);
		return await interaction.channel.send(`Image for ${char.characterName} added!
Image ID (One u use for delete and edit): ${image.imageID}
Image Number: ${iNumber}
Artist: ${art}
Image has entered the send queue and will be reviewed by players and image mods.
Once the swap has enough votes, it'll be approved or declined by an image mod.
You will recieve minimum of 50 gems and 1 karma for a successful swap, and bonuses for selfcrop and quality.`);
	} catch(error) {
		interaction.channel.send("Something went wrong.");
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
		.setName('iswap')
		.setDescription('Replacing an image in the database for the character, image should be 450x700px in size.')
		.addIntegerOption(option => option
			.setName('cid')
			.setDescription('Id of the character')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('image_number')
			.setDescription('id number for characters image slot. Pick a desired slot number between 1 and 10.')
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
			.setName('reason')
			.setDescription('SHORT reason for the swap (no emotes, limit 256 chars.)')
			.setRequired(true))
		.addBooleanOption(option => option
			.setName('edit')
			.setDescription('Is this swap a small edit to the existing image?')
			.setRequired(true)),
	async execute(interaction) {
		//check if character exists, and image number is empty
		//than create the image in database with all details.
		await checkIDS(interaction);
		// if (interaction.channel.id === '947123054570512395') {
        //     if (!interaction.member.roles.cache.has('947640668031975465')) {
        //         return interaction.reply("You don't have the image sender role!", {ephemeral: true});
        //     };
		// 	try {
		// 		checkIDS(interaction);
		// 		// if (checkNSFW(interaction)){
		// 		// 	checkIDS(interaction);
		// 		// } else {
		// 		// 	return await interaction.reply("None NSFW images have number 0-9, NSFW images have number 10-24")
		// 		// }
		// 	} catch(error){
		// 		await interaction.channel.send("Error has occured");
		// 	}
		// } else {
		// 	interaction.reply("use #send-image to send images please.")
		// }
	}
}
