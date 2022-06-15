const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');

async function start(interaction) {
    const user = interaction.user.id;
    let vid;
    const track = await database.Votetrack.findOne({
        where: {playerID: user}
    });
    if (track) {
        vid = await track.charVote2;
    } else {
        await database.Votetrack.create({
            playerID: user
        });
        await interaction.channel.send(`Thanks for doing cvote.
    This is a voting system for characters.
    You'll be able to vote a score between 0 and 2 inclusive,
    with 2 being the highest rating you can give.
    Each vote will reward you with 1 karma, and all votes
    will be considered for calculating a characters rank!
    Be honest as it is annonymous.`);
        vid = 1;
    }
    
    const embed = await createEmbed(interaction);
    await interaction.reply({embeds: [embed]});
    await cvoteID(embed, interaction, vid);
}

function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Starting charvote2")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Starting")
        .setColor(color.failred);
    return embed;
}

async function viewImage(embed, interaction, cid, inumber) {
    try {
        let art;

        art = await database.Image.findOne({
        where: {
            characterID: cid,
            imageNumber: inumber,
        }})
        if (!art && inumber > 11) {
            return await viewImage(embed, interaction, cid, inumber+1);
        } else {
            const url = art.imageURL;
            const artist = art.artist;
            const uploader = art.uploader;
            const footer = `
            #${art.imageNumber} Art by ${artist} | Uploaded by ${uploader}\nImage ID is ${art.imageID} report any errors using ID.
            `;
            await embed
                .setImage(url)
                .setFooter({text: `${footer}`});
            await interaction.editReply({embeds: [embed]});
        }
        
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function cvoteID(embed, interaction, vid) {
    try {
        const vote = await database.Cvotetrack.findOne({where: {id: vid}});        
        if (vote) {
            const cid = vote.characterID;
        const char = await database.Character.findOne({
            where: {
                characterID: cid
            }
        });
            const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
            if (char.imageCount > 0){
                await viewImage(embed, interaction, cid, 1);
                await embed.setDescription(`
Character ID: ${char.characterID}
Character Alias: ${char.alias}
Series: ${char.seriesID} | ${series.seriesName}

This Character has image(s).
Try refresh if image or name doesn't match.
`)
            } else {
                await embed.setDescription(`
Character ID: ${char.characterID}
Character Alias: ${char.alias}
Series: ${char.seriesID} | ${series.seriesName}

This Character doesn't have an image.
Try refresh if image or name doesn't match.
`)
            }
            await embed.setTitle(`${char.characterName}`)
                .setColor(color.successgreen);
            const row = await createButton();
            msg = await interaction.editReply( {embeds: [embed], components: [row], fetchReply: true});
            console.log(7);
            await buttonManager(embed, interaction, msg, vid);
        } else {
            console.log(8);
            await embed.setDescription(`You are done for now as there are no new characters.
There will be a command in the future to let you know if there are new characters to vote for.
Thank you so much for doing cvote!`);
console.log(9);
            return await interaction.editReply( {embeds: [embed]});
        }
    } catch(error) {
        console.log("error has occured in cvote2.");
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
            .addComponents(
                new MessageButton()
                    .setCustomId('refresh')
                    .setLabel('refresh')
                    .setStyle('SECONDARY'))
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(embed, interaction, msg, vid) {
    try {
        console.log(1);
        const uid = interaction.user.id;
        const filter = i => i.user.id === interaction.user.id;
        console.log(2);
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        console.log(3);
        collector.on('collect', async i => {
            switch (i.customId){
                case '0':
                    console.log(4);
                    await database.Votetrack.increment({charVote2: 1}, {where: {playerID: uid}});
                    console.log(5);
                    await database.Player.increment({karma: 1}, {where: {playerID: uid}});
                    console.log(6);
                    await database.Character.increment({votes: 1}, {where: {characterID: vid}});
                    console.log(7);
                    cvoteID(embed, interaction, vid+1);
                    console.log(8);
                    break;
                
                case '1':
                    await database.Votetrack.increment({charVote2: 1}, {where: {playerID: uid}})
                    await database.Player.increment({karma: 1}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1, score: 1}, {where: {characterID: vid}});
                    cvoteID(embed, interaction, vid+1);
                    break;
                
                case '2':
                    await database.Votetrack.increment({charVote2: 1}, {where: {playerID: uid}})
                    await database.Player.increment({karma: 1}, {where: {playerID: uid}});
                    await database.Character.increment({votes: 1, score: 2}, {where: {characterID: vid}});
                    cvoteID(embed, interaction, vid+1);
                    break;
                
                case 'refresh':
                    await cvoteID(embed, interaction, vid);
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
		.setName('cvote2')
		.setDescription('vote for the character pools to earn gems!'),
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