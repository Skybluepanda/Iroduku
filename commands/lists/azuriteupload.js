const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()


async function checkImage(interaction, card){
    const art = await interaction.options.getString('artist');
    const isnsfw = await interaction.options.getBoolean('isnsfw');
    if (art) {
        await database.Azurite.update({artist: art}, {where: {cardID: card.cardID}})
    }
    const imageURL = await interaction.options.getString('imageurl');
    if (imageURL) {
        console.log("10");
        if (imageURL.endsWith('.png') || imageURL.endsWith('.jpg') || imageURL.endsWith('.gif')) {
            console.log("11");
            const prev = await database.Azurite.findOne({where: {cardID: card.cardID}});
            const channel = interaction.guild.channels.cache.get('996650197008515142');
            await channel.send(`${interaction.user} modified their ${card.characterID} stellarite card.\n${prev.imageURL}\n ${imageURL}`);
            await database.Azurite.update({imageURL: imageURL}, {where: {cardID: card.cardID}});
            if (isnsfw) {
                await database.Azurite.update({season: 2}, {where: {cardID: card.cardID}});
            } else {
                await database.Azurite.update({season: 1}, {where: {cardID: card.cardID}});
            }
            console.log("12");
        } else {
            await interaction.channel.send("Image must be PNG, JPG or GIF format.")
        }
    }
    
    await viewSpeCard(card, interaction);
    return;
}

async function viewSpeCard(card, interaction) { 
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    embedCard.setFooter({text: `Art by ${azur.artist}
*Upload your choice of image of the character using /stellarupload*`}).setImage(azur.imageURL);
        embedCard.setTitle(`${char.characterName}`)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
            .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Stellarite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.stellar);
    if (azur.season == 2) {
        await interaction.reply(`||${azur.imageURL}||`)
        return await interaction.editReply({embeds: [embedCard]});
    } else {
        return await interaction.reply({embeds: [embedCard]});
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('stellarupload')
		.setDescription('Upload a new image and the artist for your Stellarite card.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the Stellarite card.")
                .setRequired(true)
                )
        .addStringOption(option => 
            option
                .setName("imageurl")
                .setDescription("The image of the Stellarite card. Send URL of a bordered image or gif.")
                .setRequired(true)
                )
        .addStringOption(option => 
            option
                .setName("artist")
                .setDescription("The artist of the Stellarite card.")
                .setRequired(true)
                )
        .addBooleanOption(option => 
            option
                .setName("isnsfw")
                .setDescription("Is the image nsfw?")
                .setRequired(true)),
	async execute(interaction) {
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            console.log("1");
            const uid = interaction.user.id;
            const lid = interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
            console.log("2");
            if (card) {
                console.log("3");
                if (card.rarity == 9) {
                    await checkImage(interaction, card);
                    
                } else {
                    return interaction.reply(`Card ${lid} is not an Azurite Card. Check your list.`)
                }
            } else {
                return interaction.reply(`Card ${lid} doesn't exist. Check your list.`)
            }
        } catch (error) {
            return interaction.channel.send(`Error has occured\n${error}`);
        }
	},
};