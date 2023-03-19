const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, Collection } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */

async function embedError(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Creation failed.")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Remember to set description.")
        .setColor(color.failred);
    
    return embed;
}

async function embedCreating(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Creating Card...")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Please be patient")
        .setColor(color.white);
    
    return embed;
}


//Blue Card Zone
//Blue Card Zone
//Blue Card Zone

async function rngImage(cid, interaction) {
    const char = await database.Character.findOne({ where: {characterID: cid}});
    let imageRange;
    if (char.imageCount > 10) {
        imageRange = 10
    } else {
        imageRange = char.imageCount;
    }
    return imageRange;
}

async function rngGif(cid, interaction) {
    const char = await database.Character.findOne({ where: {characterID: cid}});
    let gifRange;
    if (char.gifCount > 5) {
        gifRange = 5
    } else {
        gifRange = char.gifCount;
    }
    return gifRange;
}

async function viewBCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageNumber > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: card.imageNumber}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageNumber)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Lapis
**Quantity:** ${card.quantity}`)
        .setColor(color.blue);
    return await interaction.editReply({embeds: [embedCard]});
}

async function viewPCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
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
**Rarity:** Amethyst
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.purple);    
    return await interaction.editReply({embeds: [embedCard]});
}

async function viewRCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: (card.imageID)}});
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
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -card.imageID}});
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
    return await interaction.editReply({embeds: [embedCard]});
}

async function rngImgID(cid, interaction) {
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const imageCap = await rngImage(cid, interaction);
    const gifCap = await rngGif(cid, interaction);
    const total = await (imageCap + gifCap);
    let imageRng;
    if (total == 0) {
        imageRng = 1;
        return imageRng;
    } else {
        imageRng = ((Math.floor(Math.random() * 100))%total)+1;
        if (imageRng > imageCap) {
            imageRng = -(imageRng-imageCap);
            return imageRng;
        } else {
            return imageRng;
        }
        
    }
   
}

async function viewDiaCard(card, interaction) {
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
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
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -card.imageID}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID
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
    return await interaction.editReply({embeds: [embedCard]});
}

async function viewAzurCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const url = azur.imageURL;
    const artist = azur.artist;
    
    url = await image.imageURL;
    embedCard.setFooter(`Art by ${artist}
*Upload your choice of image of the character using /stellarupload*`).setImage(url)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Stellarite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.stellar);
    return await interaction.editReply({embeds: [embedCard]});
}


async function raritySwitch(cid, rngRarity, interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    player.increment({gems: -10});
    const pity = Math.floor(player.pity*3/10);
    const channel2 = interaction.guild.channels.cache.get('997873272014246018');
    const apityrng = await (rngRarity + player.apity/700);
    console.log(`rng is ${rngRarity}`);
    console.log(`apity is ${apityrng}`);
    const pityrng = await (rngRarity + pity);
    if ((apityrng) >= 99995) {
        channel2.send(`${interaction.user} rolled ${rngRarity} with ${player.apity} pity.`)
        await createAzurCard(interaction);
    } else if ((rngRarity) >= 99900) {
        channel2.send(`${interaction.user} rolled ${rngRarity}.`)
        player.increment({apity: -50});
        await createDiaCard(cid, interaction);
    } else if (pityrng >= 99200) {
        if (player.pity < 400) {
            await player.update({pity: 0});
        } else {
            await player.increment({pity: -400});
        }
        player.increment({apity: -3});
        await createRedCard(cid, interaction);
    } else if (rngRarity >= 95000) {
        player.increment({pity: 1});
        await createPurpleCard(cid, interaction);
    } else if (rngRarity >= 80000) {
        player.increment({pity: 1});
        await createBlueCard(cid, interaction);
    } else if (rngRarity >= 60000) {
        player.increment({pity: 1});
        await createGreenCard(cid, interaction);
    } else {
        player.increment({pity: 1});
        await createWhiteCard(cid, interaction);
    }
}

async function gacha(interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    const sideson = await database.Sideson.findOne({where: {playerID: user}});
    const trashon = await database.Trashon.findOne({where: {playerID: user}});
    if (!sideson && !trashon) {
        await sideofftrashoff(interaction);
    } else if (sideson && !trashon){
        await sideontrashoff(interaction);
    } else {
        await sideontrashon(interaction);
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gacha')
		.setDescription('Spend gems to do gacha'),
	async execute(interaction) {
        try {
            const user = await interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: user}});
            const embedE = await embedError(interaction);
            const embedC = await embedCreating(interaction);
            
            if(player) {
                if (player.gems >= 10){
                    const inventory = await database.Card.count({where: {playerID: user}});
                    if (inventory > 1000) {
                        return await interaction.reply("you have more than 1000 cards. Burn some before doing more gacha.")
                    }
                    const wlist = await database.Wishlist.count({where: {playerID: user}})
                    if (wlist >= 5) {
                        await interaction.reply({embeds: [embedC]});
                        await gacha(interaction);
                    } else {
                        await interaction.reply({embeds: [embedC]});
                        await gacha(interaction);
                        await interaction.channel.send("Characters in your wishlist have a higher chance of appearing in gacha. \nIt is recommended to have at least 5 characters in your wishlist.")
                    }
                } else {
                    //not enough gems embed.
                    embedE.setDescription(`You need 10 gems to gacha. Do dailies, add new series, characters or send images to gain more gems`);
                    return await interaction.reply({embeds: [embedE]});
                }
            } else {
                //embed no player registered.
                (embedE).setDescription("You haven't isekaied yet. Do /isekai to get started.")
                return await interaction.reply({embeds: [embedE]});
            }
        } catch(error) {
            await interaction.channel.send(`Error ${error} has occured.`)
        }        
    }
}