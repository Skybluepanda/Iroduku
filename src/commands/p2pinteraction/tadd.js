const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, IntegrationApplication } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()



async function tradeidcheck(interaction) {
    const user = await interaction.user.id
    const target = await interaction.options.getUser('targetuser');
    var notfound = true;
    var i = 1;
    while (notfound) {
        const number1 = await database.Trade.findOne({where: {tradeID: i, player1ID: user, player2ID: target.id}})
        const number2 = await database.Trade.findOne({where: {tradeID: i, player2ID: user, player1ID: target.id}})
        if (number1 || number2) {
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
                    .setCustomId('add')
                    .setLabel('add')
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


async function buttonManager(interaction, msg, card) {
    try {
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
       
        collector.on('collect', async i => {
            switch (i.customId){
                case 'add':
                    const tid = await tradeidcheck(interaction)
                    const uid = await interaction.user.id
                    const target = await interaction.options.getUser('targetuser');
                    await database.Trade.create({
                        tradeID: tid,
                        player1ID: uid,
                        player2ID: target.id,
                        inventoryID: card.cardID
                    })
                    await database.Card.update({playerID: 0}, {where: {playerID: uid, inventoryID: card.inventoryID}});
                    await database.Trade.update({lock: false}, {where: {player1ID: uid, player2ID: target.id}});
                    await database.Trade.update({lock: false}, {where: {player1ID: target.id, player2ID: uid}});
                    await interaction.channel.send(`${interaction.user} added card (cardID:${card.cardID}) to the trade with ${target} with trade id ${tid}.`)
                    break;
                
                case 'cancel':
                    await interaction.channel.send("Trade Add Cancelled");
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function viewPurpleCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
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
**Rarity:** Amethyst
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.purple);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, card);
}

async function viewRedCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
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
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);
    const row = await createButton();
    
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, card);
}

async function viewDiaCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
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
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, card);
}

async function viewPinkCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
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
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, card);
}

async function viewAzurCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const Azurite = database.Azurite.findOne({where: {cardID: card.cardID}});
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    embedCard.setFooter(`Art by ${Azurite.artist}
*Upload with /azuriteupload*`).setImage(Azurite.imageURL)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Azurite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.azur);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, card);
}


async function switchRarity(card, rarity, interaction) {
    switch (rarity) {
        case 1:
            interaction.reply("You cannot trade quartz cards.");
            //white
        case 2:
            interaction.reply("You cannot trade jade cards.");
            //green
        case 3:
            interaction.reply("You cannot trade lapis cards.");
            //Blue
        case 4:
            return viewPurpleCard(card, interaction);
            //Purple
        case 5:
            return viewRedCard(card, interaction);
        //red
        case 6:
            return viewDiaCard(card, interaction);

        case 7:
            return viewPinkCard(card, interaction);

        case 9:
            return viewAzurCard(card, interaction);

        case 10:
            interaction.reply("You cannot trade special cards.");
        default:
            return "error";
            //wtf?
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tadd')
		.setDescription('Adds a card to a trade.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The list id for the card you want to add")
                .setRequired(true)
                )
        .addUserOption(option => 
            option
                .setName("targetuser")
                .setDescription("The person you want to trade it with.")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const user = await interaction.user.id
            console.log(1);
            const lid = await interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: user, inventoryID: lid}});
            const target = await interaction.options.getUser('targetuser');
            const player = await database.Player.findOne({where: {playerID: user}});
            const targetplayer = await database.Player.findOne({where: {playerID: target.id}});
            if (card && targetplayer && player) {
                const tcount = await database.Trade.count({where: {player1ID: user, player2ID: target.id}});
                if (tcount >= 10) {
                    interaction.reply("You already have 10 items in the trade. Remove items or make multiple trades.");
                }
                switchRarity(card, card.rarity, interaction);
                
            } else if (!card) {
                interaction.reply("Error Invalid list ID");
            } else if (!targetplayer) {
                interaction.reply("Invalid user");
            }
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}