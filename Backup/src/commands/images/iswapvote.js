const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { createCanvas, loadImage, Canvas } = require('canvas');


async function checktrack(interaction, voteid) {
    const user = interaction.user.id;
    const first = await database.Swapimage.findOne({
        order: [['imageID','ASC']],
        where: {imageID: {[Op.gte]: voteid}
    }});
    const track = await database.Votetrack.findOne({
        where: {playerID: user}
    });
    return first.imageID;
    // for (let i = 0; i < first.length; i++) {
    //     if (first[i].imageID >= track.imageVote) {
    //         return first[i].imageID;
    //     }
    // }
    // return 0;
}

async function start(interaction) {
    const user = interaction.user.id;
    const embed = await createEmbed(interaction);
    const track = await database.Votetrack.findOne({
        where: {playerID: user}
    });  
    const first = await database.Swapimage.findOne({
        order: [['imageID','ASC']],
        where: {imageID: {[Op.gte]: track.imageVote}
    }})
    let image;
    if (track) {
        if (!first) {
            embed.setDescription(`You are done for now as there are no new swaps.
There will be a command in the future to let you know if there are new swaps to vote for.
Thank you so much for doing isvote!`);
            return await interaction.reply({embeds: [embed]});
            //compare it to Vote track and push vote track up to date.
        } else {
            //return no swap available.
        }
    } else {
        await database.Votetrack.create({
            playerID: user
        });
        return start(interaction);
    }
    await interaction.reply({embeds: [embed]});
    await isvote(embed, interaction);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting isvote")
        .setAuthor(interaction.user.username,interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Starting")
        .setColor(color.failred);
    return embed;
}

async function isvote(embed, interaction) {
    try {
        console.log(1)
        const track = await database.Votetrack.findOne({
            where: {playerID: interaction.user.id}
        });  
        console.log(2)
        const swaps = await database.Swapimage.findOne({
            order: [['imageID','ASC']],
            where: {imageID: {[Op.gte]: track.imageVote}
        }});
        console.log(3)
        if (swaps) {
            console.log(4)
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
Small Edit: ${swaps.selfcrop}
Reason: ${swaps.reason}

Vote for image swap.
Once swapped old images will be accessible with old amethyst or ruby cards,
and diamond cards will be able to set the image to them.
Choose yes or no based on your opinion on the image, 
Or another# option is if you think another image slot is a better candidate for the swap.
Or you may choose to abstain.

**NEW LEFT | OLD RIGHT**`)
            .setTitle(`${char.characterName}`)
            .setColor(color.successgreen)
            .setImage(swaps.previewURL);
            console.log("6");
            const row = await createButton();
            console.log("7");
            const msg = await interaction.editReply({embeds: [embed], components: [row], fetchReply: true});
            console.log("8");
            await buttonManager(embed, interaction, msg, swaps.imageID);
            console.log("9");
        } else {
            console.log("10");
            embed.setDescription(`You are done for now as there are no new swaps.
There will be a command in the future to let you know if there are new swaps to vote for.
Thank you so much for doing isvote!`);
            return await interaction.editReply( {embeds: [embed]});
        }
    } catch(error) {
        console.log("error has occured in isvote.");
    }
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('1')
                    .setLabel('yes (LEFT)')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('0')
                    .setLabel('no (RIGHT)')
                    .setStyle('DANGER')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('2')
                    .setLabel('another#')
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

async function buttonManager(embed, interaction, msg, swaps) {
    try {
        const uid = interaction.user.id;
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case '0':
                    await database.Votetrack.update({imageVote: swaps+1}, {where: {playerID: uid}})
                    await database.Player.increment({karma: 2}, {where: {playerID: uid}});
                    await database.Swapimage.increment({no: 1}, {where: {imageID: swaps}});
                    await isvote(embed, interaction);
                    break;
                
                case '1':
                    await database.Votetrack.update({imageVote: swaps+1}, {where: {playerID: uid}})
                    await database.Player.increment({karma: 2}, {where: {playerID: uid}});
                    await database.Swapimage.increment({yes: 1}, {where: {imageID: swaps}});
                    await isvote(embed, interaction);
                    break;
                
                case '2':
                    await database.Votetrack.update({imageVote: swaps+1}, {where: {playerID: uid}})
                    await database.Player.increment({karma: 2}, {where: {playerID: uid}});
                    await database.Swapimage.increment({another: 1}, {where: {imageID: swaps}});
                    await isvote(embed, interaction);
                    break;

                case '3':
                    await database.Votetrack.update({imageVote: swaps+1}, {where: {playerID: uid}})
                    await database.Player.increment({karma: 2}, {where: {playerID: uid}});
                    await database.Swapimage.increment({abstain: 1}, {where: {imageID: swaps}});
                    await isvote(embed, interaction);
                    break;
            };
            i.deferUpdate();
        });
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
                await start(interaction);
            } else {
                await interaction.reply("You are not a registered player. Use /isekai to get started.")
            }
            
        } catch(error) {
            await interaction.reply(`Error ${error} has occured while performing the command.`)
        }        
    }
}