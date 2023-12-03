const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');
const { Op } = require("sequelize");
const { createCanvas, loadImage, Canvas } = require('canvas');
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

async function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle(`${interaction.user.username}'s 10 Gacha results`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Description will reset if successful.")
        .setColor(color.successgreen);
    
    return embed;
}

async function inventorycheck(uid) {
    const number = await database.Card.findOne({
        order: [['inventoryID', 'DESC']],
        where: {playerID: uid}
    })
    if (!number) {
        return 1;
    } else {
        return (number.inventoryID)+1;
    }
}

async function rngImage(char) {
    let imageRange;
    if (char.imageCount > 10) {
        imageRange = 10
    } else {
        imageRange = char.imageCount;
    }
    return await imageRange;
}

async function rngGif(char) {
    let gifRange;
    if (char.gifCount > 5) {
        gifRange = 5
    } else {
        gifRange = char.gifCount;
    }
    return await gifRange;
}

//Blue Card Zone
//Blue Card Zone
//Blue Card Zone

async function ranktext(rank) {
    if(rank == 1) {
        return "Core";
    } else {
        return "Extra"
    }
}


async function createBlueCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char) {
    const uid = await interaction.user.id;
    const imageCap = await rngImage(char);
    const gifCap = await rngGif(char);
    const total = await (imageCap + gifCap);
    let imageRng;
    if (total == 0) {
        imageRng = 1;
    } else {
        imageRng = ((Math.floor(Math.random() * 100))%total)+1;
        if (imageRng > imageCap) {
            imageRng =- (imageRng-imageCap);
        }
    }

    let newcard;
    const inumber = await inventorycheck(uid)
    newcard = await database.Card.create({
        playerID: uid,
        characterID: char.characterID,
        inventoryID: inumber,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 3,
    });
    list[cardIndex] = newcard;
    if(skip) {
        if (cardIndex < 9) {
            await nextCard(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
        } else {
            await endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip);
        }
    } else {
        await viewBCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, newcard);
    }
}

async function viewBCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, card) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.jade)
    //     .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138072025714409492/just-stars.gif`);
    // await msg.edit({embeds: [embedCard], files: []});
    // setTimeout(async () => {
    //     const row = await createButton();
    //     await msg.edit({embeds: [embedCard], components: [row]});
    //     await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
    // }, 2500);
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const simps = await database.Wishlist.count({where: {characterID: cid}});
    const ranktxt = await ranktext(char.rank);
    let image;
    let url;
    if (card.imageNumber > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: card.imageNumber}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter({text: `#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    } else {
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(card.imageNumber)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter({text: `#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity:** Jade`)
        .setColor(color.jade);
    const row = await createButton();
    await msg.edit({embeds: [embedCard], components: [row]});
    await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
}

///Purple Zone
///Purple Zone
///Purple Zone

async function createPurpleCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char) {
    const uid = await interaction.user.id;
    const imageCap = await rngImage(char, interaction);
    const gifCap = await rngGif(char, interaction);
    const total = await (imageCap + gifCap);
    let imageRng;
    if (total == 0) {
        imageRng = 1;
    } else {
        imageRng = ((Math.floor(Math.random() * 100))%total)+1;
        if (imageRng > imageCap) {
            imageRng = -(imageRng-imageCap);
        }
    }
    
    let image;
    let imgID;
    if (imageRng > 0) {
        image = await database.Image.findOne({where: {characterID: char.characterID, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID;} 
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: char.characterID, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID);}
    } else {
        imgID = 0;
    }
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: char.characterID,
        inventoryID: inumber,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 4,
    });
    list[cardIndex] = newcard;
    if(skip) {
        if (cardIndex < 9) {
            await nextCard(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
        } else {
            await endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip);
        }
    } else {
        await viewPCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, newcard);
    }
}

async function viewPCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, card) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.purple)
    //     .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138072025714409492/just-stars.gif`);
    // await msg.edit({embeds: [embedCard], files: []});
    // setTimeout(async () => {
    //     const row = await createButton();
    //     await msg.edit({embeds: [embedCard], components: [row]});
    //     await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
    // }, 2500);
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const simps = await database.Wishlist.count({where: {characterID: cid}});
    const ranktxt = await ranktext(char.rank);
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
            image = await database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -card.imageID}});
        if (image){
            url = await image.gifURL;
            embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*you can update image with /amethystupdate*`).setImage(url)
        } else {
            image = await database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    } else {
        image = await database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
            .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png')
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity:** Amethyst
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.purple);
    const row = await createButton();
    await msg.edit({embeds: [embedCard], components: [row]});
    await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
}


//red zone
//red zone
//red zone

async function createRedCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char) {
    const uid = await interaction.user.id;
    const imageCap = await rngImage(char, interaction);
    const gifCap = await rngGif(char, interaction);
    const total = await (imageCap + gifCap);
    let imageRng;
    if (total == 0) {
        imageRng = 1;
    } else {
        imageRng = ((Math.floor(Math.random() * 100))%total)+1;
        if (imageRng > imageCap) {
            imageRng = -(imageRng-imageCap);
        }
    }
    let image;
    let imgID;
    if (imageRng > 0) {
        image = await database.Image.findOne({where: {characterID: char.characterID, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID;} 
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: char.characterID, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID);}
    } else {
        imgID = 0;
    }
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: char.characterID,
        inventoryID: inumber,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 5,
    });
    list[cardIndex] = newcard;
    await viewRCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, newcard);
}


async function viewRCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, card) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.red)
        .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138072025714409492/just-stars.gif`);
    await msg.edit({embeds: [embedCard], files: []});
    setTimeout(async () => {
        if (skip) {
            await msg.edit({embeds: [embedCard]});
            if (cardIndex < 9) {
                await nextCard(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
            } else {
                await endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip);
            }
        } else {
            const row = await createButton();
            await msg.edit({embeds: [embedCard], components: [row]});
            await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
        }
    }, 2500);
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const simps = await database.Wishlist.count({where: {characterID: cid}});
    const ranktxt = await ranktext(char.rank);
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
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
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
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
            .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);
}

async function rngImgID(char, interaction) {
    const imageCap = await rngImage(char, interaction);
    const gifCap = await rngGif(char, interaction);
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

async function createDiaCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char) {
    const uid = await interaction.user.id;
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const imageRng = await rngImgID(char, interaction);
    let image;
    let imgID;
    if (imageRng > 0) {
        image = await database.Image.findOne({where: {characterID: char.characterID, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID};
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: char.characterID, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID)};
    } else {
        imgID = 0;
    }
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: char.characterID,
        inventoryID: inumber,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 6,
    });
    let channel = interaction.guild.channels.cache.get('1140794715797737502');
    channel.send(`A luck sack got a **Diamond :large_blue_diamond: ${char.characterID} | ${char.characterName} from ${series.seriesName}!**`);
    list[cardIndex] = newcard;
    await viewDiaCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, newcard);
}


async function viewDiaCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, card) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
    .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
    .setColor(color.diamond)
    .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138072025714409492/just-stars.gif`);
    await msg.edit({embeds: [embedCard], files: []});
    setTimeout(async () => {
        if (skip) {
            await msg.edit({embeds: [embedCard]});
            if (cardIndex < 9) {
                await nextCard(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
            } else {
                await endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip);
            }
        } else {
            const row = await createButton();
            await msg.edit({embeds: [embedCard], components: [row]});
            await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
        }
    }, 2500);
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const simps = await database.Wishlist.count({where: {characterID: cid}});
    const ranktxt = await ranktext(char.rank);
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: (card.imageID)}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
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
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
            .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond);
}

async function createAzurCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char) {
    const uid = await interaction.user.id;
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image = await database.Image.findOne({where: {characterID: char.characterID, imageNumber: 1}});
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: char.characterID,
        inventoryID: inumber,
        rarity: 8,
    });
    if (image) {
        await database.Azurite.create({
            cardID: newcard.cardID,
            imageURL: image.imageURL,
            artist: image.artist,
            season: 1
        })
    } else {
        await database.Azurite.create({
            cardID: newcard.cardID,
            imageURL: 'https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png',
            artist: 'Image 1 Missing',
            season: 1
        })
    }
    let channel = interaction.guild.channels.cache.get('1140794715797737502');
    channel.send(`A Legendary luck sack got a **Azurite :diamond_shape_with_a_dot_inside: ${char.characterID} | ${char.characterName} from ${series.seriesName}!!!**`)
    list[cardIndex] = newcard;
    await viewAzurCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, newcard);
}

async function viewAzurCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, card) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.azur)
        .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138072025714409492/just-stars.gif`);
    await msg.edit({embeds: [embedCard], files: []});
    setTimeout(async () => {
        if (skip) {
            await msg.edit({embeds: [embedCard]});
            if (cardIndex < 9) {
                await nextCard(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
            } else {
                await endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip);
            }
        } else {
            const row = await createButton();
            await msg.edit({embeds: [embedCard], components: [row]});
            await buttonManager(interaction, rarityArray, msg, cardIndex+1, wishlist, charCount, list, skip);
        }
    }, 2500);

    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const simps = await database.Wishlist.count({where: {characterID: cid}});
    const ranktxt = await ranktext(char.rank);
    const url = azur.imageURL;
    const artist = azur.artist;
    embedCard.setFooter({text: `Art by ${artist}
*Upload your choice of image of the character using /stellarupload*`}).setImage(url);
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity: Azurite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.azur);
}

// async function azurchar(interaction) {
//     console.log("we got to azurchar");
//     const user = interaction.user.id;
//     const player = await database.Player.findOne({where: {playerID: user}});
//     const rngpool = Math.floor(await (Math.random() * 1000 + player.apity/50));
//     const wcount = await database.Wishlist.count({where: {playerID: user}})
//     let cid;
//     if (wcount >= 5 && (rngpool >= 750)) {
//         const wlist = await database.Wishlist.findAll({where: {playerID: user}})
//         const rngChar = Math.floor(Math.random() * 1000);
//         const char = (rngChar%wlist.length);
//         cid = await wlist[char].characterID;
//         if(await player.apity > 10000) {
//             await player.increment({apity: -10000});
//         } else {
//             await player.update({apity: 0});
//         }
//     } else {
//         const rngChar = Math.floor(Math.random() * 10000);
//         const count = await database.Character.count({where: {rank: {[Op.lt]: 3}}});
//         const offset = (rngChar%count);
//         const char = await database.Character.findOne({offset: offset, where: {rank: {[Op.lt]: 3}}});
//         cid = await char.characterID;
//         if(await player.apity > 5000) {
//             await player.increment({apity: -5000});
//         } else {
//             await player.update({apity: 0});
//         }
//     }
//     return cid;
// }

async function buttonManager(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip) {
    try {
        if (cardIndex > 9) {
            return endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip);
        }
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 8000 });

        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'next':
                    await nextCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, false);
                    break;
                
                case 'skip':
                    const embed = msg.embeds[0];
                    embed.setTitle("Skipping ...")
                    await msg.edit({embed: [embed]})
                    await nextCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, true);
                    break;
            };
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                // If no interactions were collected, use the 'next' case
                await nextCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, false);
            }
        });
    } catch(error) {
        console.log(error)
        console.log(`${error} Error has occured in button Manager`);
    }
}

async function findImage(card) {
    if (card.rarity == 9) {
        const azurite = await database.Azurite.findOne({where: {
            cardID: card.cardID 
        }});
        return azurite.imageURL;
    } else if (card.imageID > 0) {
        const image = await database.Image.findOne({where: {
            imageID: card.imageID
        }});
        return image.imageURL;
    } else if (!card.imageID) {
        if (card.imageNumber > 0) {
            const image = await database.Image.findOne({
                where:{
                    characterID: card.characterID,
                    imageNumber: card.imageNumber
                }
            })
            if (image) {
                return await image.imageURL;
            } else {
                return 'https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png';
            }
        } else if (card.imageNumber == 0) {
            return 'https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png';
        } else {
            const image = await database.Image.findOne({
                where:{
                    characterID: card.characterID,
                    imageNumber: 1
                }
            })
            if (image) {
                return await image.imageURL;
            } else {
                return 'https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png';
            }
        }
    } else {
        const image = await database.Image.findOne({
            where:{
                characterID: card.characterID,
                imageNumber: 1
            }
        })
        if (image) {
            return await image.imageURL;
        } else {
            return 'https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png';
        }
    }
}

async function bluecard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //image number of card
    const inumber = card.imageNumber;
    //check quantity
    const quantity = card.quantity;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    }
}

async function purplecard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //image number of card
    const inumber = card.imageNumber;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    }
}

async function redcard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //image number of card
    const inumber = card.imageNumber;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:red_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:red_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:red_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:red_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    }
}

async function diacard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //image number of card
    const inumber = card.imageNumber;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:large_blue_diamond:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:large_blue_diamond:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:large_blue_diamond:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:large_blue_diamond:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    }
}

async function pinkcard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //image number of card
    const inumber = card.imageNumber;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:diamonds:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:diamonds:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:diamonds:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            return cardString
        } else {
            const cardString =`:diamonds:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            return cardString
        }
    }
}

async function azurcard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    const azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:diamond_shape_with_a_dot_inside:` + ID + ` ${lockstatus} ` + tag + charname;
            return cardString
        } else {
            const cardString =`:diamond_shape_with_a_dot_inside:` + ID + ` ${lockstatus} ` + charname;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:diamond_shape_with_a_dot_inside:` + ID + ` ${lockstatus} ` + tag + charname;
            return cardString
        } else {
            const cardString =`:diamond_shape_with_a_dot_inside:` + ID + ` ${lockstatus} ` + charname;
            return cardString
        }
    }
}

async function makeList(list) {
    const listRef = [];
    for (let i = 0;i < list.length; i++) {
        //ID|Rarity ImageNumber Name Quantity if white, green or blue and there's more than 1.
        const rarity = await list[i].rarity;
        const cardString = await switchRarity(list[i], rarity);
        listRef[i] = cardString;
    }
    return listRef;
}

async function switchRarity(card, rarity) {
    switch (rarity) {
        case 3:
            return bluecard(card);
            //Blue
        case 4:
            return purplecard(card);
            //Purple
        case 5:
            return redcard(card);
            //red
        case 6:
            return diacard(card);

        case 7:
            return pinkcard(card);

        case 8:
            return azurcard(card);

        case 10:
            return specard(card);

        default:
            return "error";
            //wtf?
    }
}

async function endpage(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip) {
    const highestRarity = Math.max(...rarityArray);
    console.log(highestRarity)
    const embedColor = await switchStarColour(highestRarity);
    const listString = await makeList(list);
    const fullList = await listString.join(`\n`);
    const embed = new MessageEmbed()
        .setColor(embedColor)
        .setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    // msg = await interaction.editReply({embeds: [embed]});
    
    const canvas = createCanvas(1125, 1750);
    const context = canvas.getContext('2d');
    const background = await loadImage(`https://cdn.discordapp.com/attachments/995260066557067265/1153923301043871814/500percent.png`);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
        const imageURL = await findImage(list[i]);
        const rarity = await switchStarColour(rarityArray[i]);
        const image = await loadImage(imageURL);
        context.drawImage(image, 125, 245+420*i, 225, 350);
        context.strokeStyle = rarity;
        context.strokeRect(125, 245+420*i, 225, 350);
    }
    for (let i = 3; i < 7; i++) {
        const imageURL = await findImage(list[i]);
        const rarity = await switchStarColour(rarityArray[i]);
        const image = await loadImage(imageURL);
        context.drawImage(image, 450, 70+420*(i-3), 225, 350);
        context.strokeStyle = rarity;
        context.strokeRect(450, 70+420*(i-3), 225, 350);
    }for (let i = 7; i < 10; i++) {
        const imageURL = await findImage(list[i]);
        const rarity = await switchStarColour(rarityArray[i]);
        const image = await loadImage(imageURL);
        context.drawImage(image, 775, 245+420*(i-7), 225, 350);
        context.strokeStyle = rarity;
        context.strokeRect(775, 245+420*(i-7), 225, 350);
    }
    // for (let i = 0; i < 3; i++) {
    //     const imageURL = await findImage(list[i]);
    //     const rarity = await switchStarColour(rarityArray[i]);
    //     const image = await loadImage(imageURL);
    //     context.drawImage(image, 315+270*i, 120+235*i, 225, 350);
    //     context.strokeStyle = rarity;
    //     context.strokeRect(315+270*i, 120+235*i, 225, 350);
    // }
    // for (let i = 3; i < 7; i++) {
    //     const imageURL = await findImage(list[i]);
    //     const rarity = await switchStarColour(rarityArray[i]);
    //     const image = await loadImage(imageURL);
    //     context.drawImage(image, 45+270*(i-3), 355+235*(i-3), 225, 350);
    //     context.strokeStyle = rarity;
    //     context.strokeRect(45+270*(i-3), 355+235*(i-3), 225, 350);
    // }for (let i = 7; i < 10; i++) {
    //     const imageURL = await findImage(list[i]);
    //     const rarity = await switchStarColour(rarityArray[i]);
    //     const image = await loadImage(imageURL);
    //     context.drawImage(image, 45+270*(i-7), 825+235*(i-7), 225, 350);
    //     context.strokeStyle = rarity;
    //     context.strokeRect(45+270*(i-7), 825+235*(i-7), 225, 350);
    // }
    const attachment = new MessageAttachment(canvas.toBuffer(), 'previewimage.png');
    

    embed.setImage('attachment://previewimage.png')
    const button = await createButton2();
    msg = await interaction.editReply({embeds: [embed], files: [attachment], components: [button]});
    await buttonManager2(interaction, msg, list, embed);
}

async function buttonManager2(interaction, msg, list, embed) {
    try {
    const filter = i => i.user.id === interaction.user.id;
    const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
    collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'burn':
                    let j = 0;
                    for (let i = 0; i < 10; i++) {
                        if (list[i].rarity < 4) {
                            const wish = await database.Wishlist.findOne({where: {characterID: list[i].characterID, playerID: interaction.user.id}});
                            if(!wish) {
                                await database.Card.destroy({where: {cardID: list[i].cardID}});
                                await database.Player.increment({gems: 15, money: 50}, {where: {playerID: interaction.user.id}});
                                j++;
                            }
                        }
                    }
                    const player = await database.Player.findOne({where: {playerID: interaction.user.id}});
                    embed.addFields(
                        {
                            name: "Burn Reward", value: `${j} Jades Burnt
Gems: ${player.gems}(+${15*j}) <:waifugem:947388797916700672>
Money: ${player.money}(+${50*j}) <:datacoin:947388797828612127>`
                        }
                    )
                    await msg.edit({embeds: [embed]});
                    break;
            };
        });
    } catch(error) {
        console.log("Error has occured in button Manager2");
    }
}


///BRUH

///BRUH
///BRUH
///BRUH
///BRUH
///BRUH
///BRUH
///BRUH
async function nextCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip) {
    const user = await interaction.user.id;
    const rngChar = Math.floor(Math.random() * 10000)%charCount;
    const char = await database.Character.findOne({
        offset: rngChar, 
        where: {
            [Op.or]: [
                {rank: 1}, 
                {characterID: {[Op.in]: wishlist}}
            ]
        }
    });
    await raritySwitch(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char);
}

// async function mainPool(interaction) {
//     const user = await interaction.user.id;
//     const wishlist = await database.Wishlist.findAll({
//         attributes: ['characterID'],
//         where: {playerID: user}
//     })
//     const embedS = await embedSucess(interaction);
//     await interaction.reply({embeds: [embedS]});
//     const list = [];
//     let listString, rngChar, rngRarity, char;
//     const charCount = await database.Character.count({
//         offset: rngChar, 
//         where: {
//             [Op.or]: [
//                 {rank: {[Op.or]: [1,2]}}, 
//                 {characterID: {[Op.in]: wishlist}}
//             ]
//         }
//     });

//     for (let i = 0; i < 10; i++) {
//         rngChar = Math.floor(Math.random() * 10000)%charCount;
//         rngRarity = Math.floor(Math.random() * 100000);
//         char = await database.Character.findOne({
//             offset: rngChar, 
//             where: {
//                 [Op.or]: [
//                     {rank: {[Op.or]: [1,2]}}, 
//                     {characterID: {[Op.in]: wishlist}}
//                 ]
//             }
//         });
//         list[i] = await raritySwitch(char, rngRarity, interaction);
        
//         listString = list.join(`\n`);
//         embedS.setDescription(`${listString}`)
//         await interaction.editReply({embeds: [embedS]});
//     }
// }


async function raritySwitch(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char) {
    switch (rarityArray[cardIndex]) {
        case 1:
            return createBlueCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char);
        
        case 2:
            return createPurpleCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, skip, char);

        case 3:
            return createRedCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, false, char);

        case 4:
            return createDiaCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, false, char);

        case 5:
            return createAzurCard(interaction, rarityArray, msg, cardIndex, wishlist, charCount, list, false, char);

        default:
            return;
    }
}

//https://media.discordapp.net/attachments/995260066557067265/1138015365553717278/nightsky.png?width=1617&height=910

async function switchStarColour(rarity) {
    switch (rarity) {
        case 1:
            return "#32ff9c";
        
        case 2:
            return "#9314ff";

        case 3:
            return "#fb0b0b";

        case 4:
            return "#00dfff";

        case 5:
            return "#0484fc";

        default:
            return '#ffffff';
    }
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('skip')
                    .setLabel('skip')
                    .setStyle('SECONDARY')
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function createButton2() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('burn')
                    .setLabel('burn jade')
                    .setStyle('DANGER')
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function makePreview(interaction, rarityArray) {
    try{    

        const list = [];
        const user = await interaction.user.id;
        const wishlist = await database.Wishlist.findAll({
            attributes: ['characterID'],
            where: {playerID: user}
        });
        const charCount = await database.Character.count({
            where: {
                [Op.or]: [
                    {rank: 1}, 
                    {characterID: {[Op.in]: wishlist}}
                ]
            }
        });
        const highestRarity = Math.max(...rarityArray);
        console.log(highestRarity)
        const embedColor = await switchStarColour(rarityArray[0]);
        const embed = new MessageEmbed()
            .setTitle('Wishing..........')
            .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138046031548919878/hitomigacha2.gif`)
            .setColor(embedColor)
            .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })});
        const row = await createButton();
        await interaction.deferReply();
        const msg = await interaction.editReply({embeds: [embed], components: [row]});
        await buttonManager(interaction, rarityArray, msg, 0, wishlist, charCount, list, false);
    } catch(error) {
        console.log(error)
    }
}


// async function makePreview(interaction, rarityArray) {
//     let msg
//     const list = [];
//     const user = await interaction.user.id;
//     const wishlist = await database.Wishlist.findAll({
//         attributes: ['characterID'],
//         where: {playerID: user}
//     });
//     const charCount = await database.Character.count({
//         where: {
//             [Op.or]: [
//                 {rank: 1}, 
//                 {characterID: {[Op.in]: wishlist}}
//             ]
//         }
//     });
//     const highestRarity = Math.max(...rarityArray);
//     console.log(highestRarity)
//     const embedColor = await switchStarColour(highestRarity);
//     const embed = new MessageEmbed()
//         .setTitle('Wishing..........')
//         .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138046031548919878/hitomigacha2.gif`)
//         .setColor(embedColor)
//         .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })});
//     await interaction.reply({embeds: [embed]});
//     setTimeout(async () => {
//         const row = await createButton();
//         msg = await interaction.editReply({embeds: [embed], files: [attachment], components: [row]});
//         await buttonManager(interaction, rarityArray, msg, 0, wishlist, charCount, list, false);
//     }, 6000);
    
//     const canvas = createCanvas(1125, 1750);
//     const context = canvas.getContext('2d');
//     const background = await loadImage(`https://cdn.discordapp.com/attachments/995260066557067265/1153923301043871814/500percent.png`);
//     context.drawImage(background, 0, 0, canvas.width, canvas.height);
//     context.globalAlpha = 1;
//     for (let i = 0; i < 3; i++) {
//         const color = await switchStarColour(rarityArray[i])
//         context.strokeStyle = '#ffffff';
//         const rngsize = Math.floor(Math.random() * 5);
//         const rngx = Math.floor(Math.random() * 100);
//         const rngy = Math.floor(Math.random() * 100);
//         context.lineWidth = rngsize+10;
//         context.strokeRect(400+270*i+rngx, 305+235*i+rngy, 1,1);
//         context.lineWidth = rngsize+8;
//         context.strokeStyle = color;
//         context.strokeRect(400+270*i+rngx, 305+235*i+rngy, 1,1);
//     }
//     for (let i = 3; i < 7; i++) {
//         const color = await switchStarColour(rarityArray[i])
//         context.strokeStyle = '#ffffff';
//         const rngsize = Math.floor(Math.random() * 5);
//         const rngx = Math.floor(Math.random() * 100);
//         const rngy = Math.floor(Math.random() * 100);
//         context.lineWidth = rngsize+10;
//         context.strokeRect(130+270*(i-3)+rngx, 540+235*(i-3)+rngy, 1,1);
//         context.lineWidth = rngsize+8;
//         context.strokeStyle = color;
//         context.strokeRect(130+270*(i-3)+rngx, 540+235*(i-3)+rngy, 1,1);
//     }for (let i = 7; i < 10; i++) {
//         const color = await switchStarColour(rarityArray[i])
//         context.strokeStyle = '#ffffff';
//         const rngsize = Math.floor(Math.random() * 5);
//         const rngx = Math.floor(Math.random() * 100);
//         const rngy = Math.floor(Math.random() * 100);
//         context.lineWidth = rngsize+10;
//         context.strokeRect(130+270*(i-7)+rngx, 1010+235*(i-7)+rngy, 1,1);
//         context.lineWidth = rngsize+8;
//         context.strokeStyle = color;
//         context.strokeRect(130+270*(i-7)+rngx, 1010+235*(i-7)+rngy, 1,1);
//     }
//     const attachment = new MessageAttachment(canvas.toBuffer(), 'previewimage.png');
//     await embed
//         .setImage('attachment://previewimage.png');
    
//     //buttonmanager has next and skip, and i
// }

async function createRarityArray(interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    const rngRarity = Math.floor(Math.random() * 100000);
    player.increment({gems: -100});
    const channel2 = interaction.guild.channels.cache.get('997873272014246018');
    if ((rngRarity + player.apity/15) >= 99995 || player.apity > 1500) {
        channel2.send(`${interaction.user} rolled ${rngRarity} with ${player.apity} pity.`)
        player.update({apity: 0});
        player.increment({pity: 1});
        return 5;
    } else if (rngRarity + player.apity/5 >= 99700) {
        channel2.send(`${interaction.user} rolled ${rngRarity}.`)
        player.increment({pity: 1, apity: 1});
        return 4;
    } else if (player.pity > 70 || (rngRarity + player.pity*100) >= 99000) {
        await player.update({pity: 0});
        await player.increment({apity: 1});
        return 3;
    } else if (rngRarity >= 85000) {
        player.increment({pity: 1, apity: 1});
        return 2;
    } else {
        player.increment({pity: 1, apity: 1});
        return 1;
    }
}

async function gacha(interaction) {
    const user = interaction.user.id;
    //find rarities of all 10 and preview.
    const rarityArray = [];
    for (let i = 0; i < 10; i++) {
        const rarity = await createRarityArray(interaction);
        rarityArray.push(rarity);
    }
    await makePreview(interaction, rarityArray);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gtenroll')
		.setDescription('Spend 1000 gems to do 10 gacha'),
	async execute(interaction) {
        try {
            const user = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: user}});
            if(player) {
                if (player.gems >= 1000){
                    await gacha(interaction);
                    
                } else {
                    //not enough gems embed.
                    const embedE = await embedError(interaction);
                    (embedE).setDescription("You need 1000 gems <:waifugem:947388797916700672> to gacha.\nDo dailies, add new series, characters or send images to gain more gems")
                    return await interaction.reply({embeds: [embedE]});
                }
                
            } else {
                //embed no player registered.
                const embedE = await embedError(interaction);
                (embedE).setDescription("You haven't isekaied yet. Do /isekai to get started.")
                return await interaction.reply({embeds: [embedE]});
            }
        } catch(error) {
            console.log(error);
            await interaction.channel.send("Error has occured while performing the command.")
        }        
    }
}