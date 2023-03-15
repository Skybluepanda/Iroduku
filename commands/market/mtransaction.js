const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, IntegrationApplication } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()


async function inventorycheck(uid) {
    var notfound = true;
    var i = 1;
    while (notfound) {
        const number = await database.Card.findOne({where: {playerID: uid, inventoryID: i}})
        if (number) {
            i += 1;
        } else {
            notfound = false;
        }
    }
    return i;
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('buy')
                    .setLabel('buy')
                    .setStyle('SUCCESS')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('cancel')
                    .setLabel('cancel')
                    .setStyle('DANGER')
            )
            // .addComponents(
            //     new MessageButton()
            //         .setCustomId('search')
            //         .setLabel('search')
            //         .setStyle('PRIMARY')
            // )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}


async function buttonManager3(interaction, msg, coins) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = await msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'buy':
                    await interaction.followUp("Processing...");
                    const mid = '903935562208141323'
                    const uid = await interaction.user.id;
                    const buyer = await database.Player.findOne({where: {playerID: uid}});
                    if (buyer.money < coins) {
                        return interaction.channel.send(`${interaction.user} doesn't have enough money.`)
                    }
                    const lid = await interaction.options.getInteger('lid');
                    const newlid = await inventorycheck(uid);
                    await database.Card.update(
                        {
                            playerID: uid, inventoryID: newlid, tag: null
                        },
                        {
                            where: {playerID: '903935562208141323', inventoryID: lid}
                        }
                    )
                    await database.Player.increment({money: -coins}, {where: {playerID: uid}});
                    await interaction.followUp(`Card ${lid} purchased from market for ${coins} coins.
The card id is ${newlid} in your inventory.`)
                    break;
                
                case 'cancel':
                    await interaction.followUp("Purchase Cancelled")
                    break;
            };
            
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function viewRedCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
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
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
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
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 30000

**Your Balance**
**Money:** ${player.money}`)
        .setColor(color.red);
    const row = await createButton();
    
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 30000);
}

async function viewDiaCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
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
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 200000

**Your Balance**
**Money:** ${player.money}`)
        .setColor(color.diamond);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 200000);
}

async function viewPinkCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
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
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 60000

**Your Balance**
**Money:** ${player.money}
`)
        .setColor(color.pink);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 60000);
}

async function viewStellarCard(card, interaction) { 
    const Azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    
    embedCard.setTitle(`${char.characterName}`)
        .setFooter(`Art by ${Azurite.artist}
*Upload your choice of image of the character using with /stellarupload*`).setImage(Azurite.imageURL)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Stellarite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 2,000,000

**Your Balance**
**Money:** ${player.money}
`)
        .setColor(color.stellar);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 2000000);
}

async function switchRarity(card, rarity, interaction) {
    switch (rarity) {
        case 5:
            return viewRedCard(card, interaction);
        //red
        case 6:
            return viewDiaCard(card, interaction);

        case 7:
            return viewPinkCard(card, interaction);

        case 9:
            return viewStellarCard(card, interaction);

        default:
            return "error";
            //wtf?
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mbuy')
		.setDescription('buys a card from market.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The list id for the card you want to view")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const uid = await interaction.user.id;
            const player = await database.Player.findOne({where:{playerID: uid}});
            if (!player) {
                return interaction.reply(`You are not registered use command /isekai to get started.`);
            }
            const mid = '903935562208141323'
            const lid = await interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: mid, inventoryID: lid}});
            if (card) {
                await switchRarity(card, card.rarity, interaction);
            } else if (!card) {
                interaction.reply("Error Invalid list ID");
            }
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}