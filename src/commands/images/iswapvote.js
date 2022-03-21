const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { createCanvas, loadImage, Canvas } = require('canvas');

async function start(interaction) {
    const user = interaction.user.id;
    const embed = await createEmbed(interaction);
    await interaction.reply({embeds: [embed]});
    await isvote(embed, interaction, 0);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting charvote")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
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
Uploader: ${swaps.uploader}
Artist: ${swaps.artist}
Nsfw: ${swaps.nsfw}
Selfcrop: ${swaps.selfcrop}`).setTitle(`${char.characterName}`)
            .setColor(color.successgreen)
            .setImage(swaps.previewURL);
        const row = await createButton();
        msg = await interaction.editReply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, cid);
        } else {
            await embed.setDescription(`You are done for now as there are no new characters.
There will be a command in the future to let you know if there are new characters to vote for.
Thank you so much for doing cvote!`);
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
                    .setLabel('0')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('1')
                    .setLabel('1')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('2')
                    .setLabel('2')
                    .setStyle('PRIMARY'))
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(embed, interaction, msg, cid) {
    try {
        const uid = interaction.user.id;
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case '0':
                    await database.Votetrack.increment({charVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1}, {where: {characterID: cid}});
                    cvoteID(embed, interaction, cid+1);
                    break;
                
                case '1':
                    await database.Votetrack.increment({charVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1, score: 1}, {where: {characterID: cid}});
                    cvoteID(embed, interaction, cid+1);
                    break;
                
                case '2':
                    await database.Votetrack.increment({charVote: 1}, {where: {playerID: uid}})
                    await database.Player.increment({gems: 4}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1, score: 2}, {where: {characterID: cid}});
                    cvoteID(embed, interaction, cid+1);
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