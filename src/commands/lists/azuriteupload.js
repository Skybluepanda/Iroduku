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
    if (art) {
        await database.Azurite.update({artist: art}, {where: {cardID: card.cardID}})
    }
    const imageURL = await interaction.options.getString('imageurl');
    console.log(imageURL);
    if (imageURL) {
        console.log("10");
        if (imageURL.endsWith('.png') || imageURL.endsWith('.gif')) {
            console.log("11");
            await database.Azurite.update({imageURL: imageURL}, {where: {cardID: card.cardID}});
            console.log("12");
        } else {
            await interaction.channel.send("that's not a image or a gif.")
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
Upload your choice of image using /azuriteupload`}).setImage(azur.imageURL);
        embedCard.setTitle(`${char.characterName}`)
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
            .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Azurite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.azur);
    return await interaction.reply({embeds: [embedCard]});
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('azuriteupload')
		.setDescription('Upload a new image and the artist for your Azurite card.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the Special card.")
                .setRequired(true)
                )
        .addStringOption(option => 
            option
                .setName("imageurl")
                .setDescription("The image of the Special card. Send URL of a bordered image or gif.")
                .setRequired(true)
                )
        .addStringOption(option => 
            option
                .setName("artist")
                .setDescription("The artist of the Special card.")
                .setRequired(true)
                ),
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