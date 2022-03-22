const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { createCanvas, loadImage, Canvas } = require('canvas');

async function start(interaction) {
    const user = interaction.user.id;
    const embed = await createEmbed(interaction);
    const track = await database.Votetrack.findOne({
        where: {playerID: user}
    });
    if (track) {
        image = await track.imageVote;
    } else {
        await database.Votetrack.create({
            playerID: user
        });
        cid = 2;
    }
    await interaction.reply({embeds: [embed]});
    await isvote(embed, interaction, image);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting isvote")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription("Starting")
        .setColor(color.failred);
    return embed;
}

async function isvote(embed, interaction, queue) {
    try {
        const swaps = await database.Swapimage.findOne({
            order: [['imageID','ASC']],
            offset: queue
        });
        if (swaps) {
            console.log("3");
            const char = await database.Character.findOne({
                where: {
                    characterID: swaps.characterID
                }
            });
            const series = await database.Series.findOne({ where: { seriesID: char.seriesID}});
            console.log("5");
        await embed.setDescription(`
Image ID: ${swaps.imageID}
Character ID: ${swaps.characterID}
Character Alias: ${char.alias}
Series: ${char.seriesID} | ${series.seriesName}
Image Number: ${swaps.imageNumber}
Artist: ${swaps.artist}
Nsfw: ${swaps.nsfw}
Selfcrop: ${swaps.selfcrop}`).setTitle(`${char.characterName}

Vote for image swap. Left is the new image and right is the image being replaced.
Once swapped old images will be accessible with old amethyst or ruby cards,
and diamond cards will be able to set the image to them.
Choose yes or no based on your opinion on the image, 
Or anotheri# option is if you think another image slot is a better candidate for the swap.
Or you may choose to abstain.
`)
            .setColor(color.successgreen)
            .setImage(swaps.previewURL);
        const row = await createButton();
        msg = await interaction.editReply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, queue);
        } else {
            await embed.setDescription(`You are done for now as there are no new swaps.
There will be a command in the future to let you know if there are new swaps to vote for.
Thank you so much for doing isvote!`);
            return await interaction.editReply( {embeds: [embed]});
        }
    } catch(error) {
        console.log("error has occured in cinfoID.");
    }
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('0')
                    .setLabel('no')
                    .setStyle('DANGER')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('1')
                    .setLabel('yes')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('2')
                    .setLabel('anotheri#')
                    .setStyle('PRIMARY'))
            .addComponents(
                new MessageButton()
                    .setCustomId('3')
                    .setLabel('abstain')
                    .setStyle('PRIMARY'))
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(embed, interaction, msg, imageid) {
    try {
        const uid = interaction.user.id;
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case '0':
                    await database.Votetrack.increment({imageVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Swapimage.increment({yes: 1}, {where: {imageID: imageid}});
                    cvoteID(embed, interaction, imageid+1);
                    break;
                
                case '1':
                    await database.Votetrack.increment({imageVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Swapimage.increment({no: 1}, {where: {imageID: imageid}});
                    cvoteID(embed, interaction, imageid+1);
                    break;
                
                case '2':
                    await database.Votetrack.increment({imageVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Swapimage.increment({another: 1}, {where: {imageID: imageid}});
                    cvoteID(embed, interaction, imageid+1);
                    break;

                case '3':
                    await database.Votetrack.increment({imageVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Swapimage.increment({abstain: 1}, {where: {imageID: imageid}});
                    cvoteID(embed, interaction, imageid+1);
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}




module.exports = {
	data: new SlashCommandBuilder()
		.setName('isvote')
		.setDescription('vote for swaps!'),
	async execute(interaction) { 
        try {
            const uid = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: uid}});
            if (player) {
                start(interaction);
            } else {
                await interaction.reply("You are not a registered player. Use /isekai to get started.")
            }
            
        } catch(error) {
            await interaction.reply("Error has occured while performing the command.")
        }        
    }
}