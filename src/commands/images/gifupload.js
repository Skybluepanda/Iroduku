const { createCanvas, loadImage, Canvas } = require('canvas');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, IntegrationApplication } = require('discord.js');
const database = require('../../database.js');

async function checkIDS(interaction) {
	const cid = await interaction.options.getInteger('cid');
	const gNumber = await interaction.options.getInteger('gif_number')
	try {
		if (1 <= gNumber < 4) {
			const count = await database.Gif.count({ where: {characterID: cid, gifNumber: gNumber}})
			if (count != 0) {
				await interaction.reply(`Character ${cid} already has an gif ${gNumber}, maximum is 2.`)
			} else {
				upload(interaction);
			};
		} else {
			await interaction.reply("Range of gif number is 0-2.")
		}
	} catch(error){
        console.log("failed in id check.")
	}
}

function imageFilename(interaction) {
	const nsfw = interaction.options.getBoolean('nsfw');
    const cid = interaction.options.getInteger('cid');
    const char = database.Character.findOne({where: {characterID: cid}});
    const charname = char.characterName
	if (nsfw) {
		const imgName = 'SPOILER_'+ charname + '.gif';
		return imgName;
	} else {
		const imgName = charname + '.gif';
		return imgName;
	}
}

async function check(interaction) {
    try {
        const url = await interaction.options.getString('gif_link');
        if (url.endsWith(".gif")) {
            const imgName = await imageFilename(interaction);
            const attachment = await new MessageAttachment(url, imgName);
            console.log(imgName);
            if (attachment) {await interaction.reply({ files: [attachment] });} else {
                interaction.reply("Gif error.")
            }
            //add it to database
        } else {
            //fucking die u moron.
            return interaction.reply("That's not a gif.")
        }
    } catch(error) {
        console.log(error + "error in gifupload/check");
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
        const iNumber = await interaction.options.getInteger('gif_number');
        const art = await interaction.options.getString('artist_name');
        const sauce = await interaction.options.getString('source');
        const isnsfw = await interaction.options.getBoolean('nsfw');
        const uploader = await interaction.user.username;
        // await check(interaction);
        const url = await interaction.options.getString('gif_link');

        // const message = await interaction.fetchReply();

        // const link = await message.attachments.first().url;
        if (url.endsWith(".gif")) {
            await database.Gif.create({
                characterID: cid,
                gifNumber: iNumber,
                gifURL: url,
                artist: art,
                source: sauce,
                nsfw: isnsfw, 
                uploader: uploader,
            });
        } else {
            return interaction.channel.send("Thats not a gif.")
        }
	
		await database.Character.increment({gifCount: 1}, {where: {characterID: cid}})
		// const char = await database.Character.findOne({where: {characterID:cid}});
		// await char.increment('imageCount', {by: 1});
		await database.Player.increment({gems: 125, karma: 5}, {where: {playerID: interaction.user.id}})
        return await interaction.reply(`Gif for ${char.characterName} has been added!
GifID: ${iNumber}. You've been rewarded 125 gems and karma, thanks for your hard work!`)
	} catch(error) {
        console.log("upload failed.")
	}
	
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gupload')
		.setDescription('Adding gif to the database for the character, gif should be 225x350px in size.')
		.addIntegerOption(option => option
			.setName('cid')
			.setDescription('Id of the character')
			.setRequired(true))
		.addIntegerOption(option => option
			.setName('gif_number')
			.setDescription('id number for characters gif slot. Pick an empty one.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('gif_link')
			.setDescription('link of the gif to upload.')
			.setRequired(true))
		.addStringOption(option => option
			.setName('artist_name')
			.setDescription('name of the artist')
			.setRequired(true))
		.addStringOption(option => option
			.setName('source')
			.setDescription('gif source link.')
			.setRequired(true))
		.addBooleanOption(option => option
			.setName('nsfw')
			.setDescription('is this an nsfw gif?')
			.setRequired(true)),
	async execute(interaction) {
		//check if character exists, and image number is empty
		//than create the image in database with all details.
		if (!interaction.member.roles.cache.has('947640668031975465')) {
			return interaction.reply("You don't have the photoshopper role!", {ephemeral: true});
		};
		if (interaction.channel.id === '947123054570512395') {
			try {
            // interaction.reply("Uploading gif.");
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
			interaction.reply("use #send-image to send gifs please.")
		}
	}
}
