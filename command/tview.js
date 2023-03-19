const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, Collection} = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

const tviewCooldown = new Collection();

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('remove')
                    .setLabel('remove')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('cancel')
                    .setStyle('DANGER')
            )
        return row;
    } catch(error) {
        console.log("error has occured in createButton");
    }
}

async function buttonManager(interaction, msg, card, trade) {
    const user = interaction.user;
    const uid = interaction.user.id;
    try {
        
        const target = await interaction.options.getUser('targetuser');
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
       
        collector.on('collect', async i => {
            switch (i.customId){
                case 'remove':
                    
                    const lastCard = await database.Card.max('inventoryID', {where: {playerID: uid}});
                    await interaction.followUp(`Trade id ${trade.tradeID} was removed in the trade between ${user} and ${target}
Card returned to ${player1}'s inventory id ${lastCard}.`)
                    await database.Card.update({playerID: uid, inventoryID: lastCard+1},{
                        where: {
                            cardID: trade.inventoryID,
                        }
                    })
                    await trade.destroy();
                    
                    break;
                
                case 'cancel':
                    break;

            };
            i.deferUpdate();
        }
        );

        collector.on(`end`, (collected, reason) => {
            tviewCooldown.delete(uid);
        });
    } catch(error) {
        tviewCooldown.delete(uid);
        console.log("Error has occured in button Manager");
    }
}

//TODO FIX BUTTON MANAGER AND MAKE SURE TVIEW COOLDOWN WORKS. AND I THINK THAT'S IT!

async function viewRedCard(card, interaction, own, trade) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const uid = interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*you can update image with /amethystupdate*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*you can update image with /amethystupdate*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);

    if (own) {
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, card, trade);
    } else {
        await interaction.reply({embeds: [embedCard]});
        tviewCooldown.delete(uid);
    }
}

async function viewDiaCard(card, interaction, own, trade) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const uid = interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond);
    if (own) {
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, card, trade);
    } else {
        await interaction.reply({embeds: [embedCard]});
        tviewCooldown.delete(uid);
    }
}

async function viewPinkCard(card, interaction, own, trade) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const uid = interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Pink Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.pink);
    if (own) {
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, card, trade);
    } else {
        await interaction.reply({embeds: [embedCard]});
        tviewCooldown.delete(uid);
    }
}

async function viewAzurCard(card, interaction, own, trade) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const uid = interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const Azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${Azurite.artist}
*Upload your choice of image of the character using /stellarupload*`).setImage(Azurite.imageURL)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Stellarite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.stellar);
    if (own) {
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, card, trade);
    } else {
        await interaction.reply({embeds: [embedCard]});
        tviewCooldown.delete(uid);
    }
}

async function switchRarity(card, rarity, interaction, own, trade) {
    switch (rarity) {
        case 5:
            return viewRedCard(card, interaction, own, trade);
            //red
        case 6:
            return viewDiaCard(card, interaction, own, trade);

        case 7:
            return viewPinkCard(card, interaction, own, trade);

        case 9:
            return viewAzurCard(card, interaction, own, trade);

        default:
            return "error";
            //wtf?
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tview')
		.setDescription('views a card in the trade')
        .addUserOption(option => 
            option
                .setName("targetuser")
                .setDescription("The list you want to view card from.")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("tid")
                .setDescription("The trade item id in the list.")
                .setRequired(true)
                ),
	async execute(interaction) {
        const user = interaction.user;
        const uid = interaction.user.id;
        try {
            
            if (tviewCooldown.get(uid)) {
                return interaction.reply('You already have a trade view window open.')
            } else {
                tviewCooldown.set(uid, true);
            }
            const target = await interaction.options.getUser('targetuser');
            const tid = await interaction.options.getInteger('tid');
            const tradeCard1 = await database.Trade.findOne({where: {player1ID: uid, player2ID: target.id, tradeID: tid}});
            const tradeCard2 = await database.Trade.findOne({where: {player1ID: target.id, player2ID: uid, tradeID: tid}});
            let tradeCard;
            let own;
            let trade;
            if (tradeCard1) {
                tradeCard = tradeCard1.inventoryID;
                trade = tradeCard1;
                own = true;

            } else if (tradeCard2) {
                tradeCard = tradeCard2.inventoryID;
                trade = tradeCard2;
                own = false;
            } else {
                tviewCooldown.delete(uid);
                return interaction.reply(`Card with trade ID ${tid} was not found in the trade.`);
            }
            const card = await database.Card.findOne({where: {cardID: tradeCard}});
            console.log(card);
            if (card) {
                await switchRarity(card, card.rarity, interaction, own, trade);
            } else {
                tviewCooldown.delete(uid);
                interaction.reply("Error Invalid list ID");
            }
        } catch(error) {
            tviewCooldown.delete(uid);
            await interaction.channel.send(`Error ${error} has occured while performing the command.`)
        }        
    }
}