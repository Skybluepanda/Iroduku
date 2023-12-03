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

//White card zone
//White card zone
//White card zone


// async function createWhiteCard(char, interaction) {
//     const user = await interaction.user.id;
//     console.log("1");
//     const dupe = await database.Card.findOne({where: {playerID: user, characterID: char.characterID, rarity: 1}});
//     console.log("2");
//     if (dupe) {
//         dupe.increment({quantity: 1});
//         await viewWCard(dupe, interaction);
//     } else {
//         console.log("3");
//         const inumber = await inventorycheck(user)
//         console.log("3.5");
//         const newcard = await database.Card.create({
//             playerID: user,
//             characterID: char.characterID,
//             inventoryID: inumber,
//             quantity: 1,
//             rarity: 1,
//         });
//         console.log("4");
//         await viewWCard(newcard, interaction);
//     }
// }


// async function viewWCard(card, interaction) { 
//     const embedCard = new MessageEmbed();
//     const cid = await card.characterID
//     console.log("5");
//     const char = await database.Character.findOne({where: {characterID: cid}});
//     const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
//     const image1 = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
//     console.log("6");
//     if (image1) {
//         embedCard.setImage(image1.imageURL).setFooter(`#${image1.imageNumber} Art by ${image1.artist} | Uploaded by ${image1.uploader}
// Image ID is ${image1.imageID} report any errors using ID.`)
//     } else {
//         embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
//     }
//     embedCard.setTitle(`${char.characterName}`)
//         // .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
//         .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
//         .setDescription(`Card Info
// **LID:** ${card.inventoryID} | **CID: **${cid}
// **Series: **${char.seriesID} | ${series.seriesName}
// **Rarity: Quartz**
// **Quantity:** ${card.quantity}`)
//         .setColor(color.white);
//     return await interaction.editReply({embeds: [embedCard]});
// }


//Green card zone
//Green card zone
//Green card zone

// async function createGreenCard(char, interaction) {
//     const uid = await interaction.user.id;
//     const dupe = await database.Card.findOne({where: {playerID: uid, characterID: char.characterID, rarity: 2}});
    
//     if (dupe) {
//         dupe.increment({quantity: 1});
//         await viewGCard(dupe, interaction);
//     } else {
//         const inumber = await inventorycheck(uid)
//         const newcard = await database.Card.create({
//             playerID: uid,
//             characterID: char.characterID,
//             inventoryID: inumber,
//             quantity: 1,
//             rarity: 2,
//         });
//         await viewGCard(newcard, interaction);
//     }
// }


// async function viewGCard(card, interaction) { 
//     const embedCard = new MessageEmbed();
//     const cid = await card.characterID
//     const char = await database.Character.findOne({where: {characterID: cid}});
//     const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
//     const image1 = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
//     if (image1) {
//         embedCard.setImage(image1.imageURL).setFooter(`#${image1.imageNumber} Art by ${image1.artist} | Uploaded by ${image1.uploader}
// Image ID is ${image1.imageID} report any errors using ID.`)
//     } else {
//         embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
//     }
//     embedCard.setTitle(`${char.characterName}`)
//         .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
//         .setDescription(`Card Info
// **LID:** ${card.inventoryID} | **CID:** ${cid}
// **Series:** ${char.seriesID} | ${series.seriesName}
// **Rarity:** Jade
// **Quantity:** ${card.quantity}`)
//         .setColor(color.green);
//     return await interaction.editReply({embeds: [embedCard]});
// }

//Blue Card Zone
//Blue Card Zone
//Blue Card Zone

async function rngImage(char, interaction) {
    let imageRange;
    if (char.imageCount > 10) {
        imageRange = 10
    } else {
        imageRange = char.imageCount;
    }
    return imageRange;
}

async function rngGif(char, interaction) {
    let gifRange;
    if (char.gifCount > 5) {
        gifRange = 5
    } else {
        gifRange = char.gifCount;
    }
    return gifRange;
}

async function createBlueCard(char, interaction) {
    const uid = await interaction.user.id;
    const imageCap = await rngImage(char, interaction);
    const gifCap = await rngGif(char, interaction);
    const total = await (imageCap + gifCap);
    let imageRng;
    if (total == 0) {
        imageRng = 1;
    } else {
        imageRng = ((Math.floor(Math.random() * 100)) % total)+1;
        if (imageRng > imageCap) {
            imageRng = -(imageRng-imageCap);
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
    await viewBCard(newcard, interaction);
}

async function ranktext(rank) {
    if(rank == 1) {
        return "Core";
    } else {
        return "Extra"
    }
}

async function viewBCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.jade)
        .setImage(`https://cdn.discordapp.com/attachments/1086674842893438976/1138046031548919878/hitomigacha2.gif`);
    await interaction.reply({embeds: [embedCard]});
    setTimeout(async () => {
        await interaction.editReply({embeds: [embedCard]});
    }, 6000);
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
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
        }
    } else {
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(card.imageNumber)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
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
}

///Purple Zone
///Purple Zone
///Purple Zone

async function createPurpleCard(char, interaction) {
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
    await viewPCard(newcard, interaction);
}

async function viewPCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.purple)
        .setImage(`https://cdn.discordapp.com/attachments/948035448134058096/1138011018136662076/hitomigacha.gif`);
    await interaction.reply({embeds: [embedCard]});
    setTimeout(async () => {
        await interaction.editReply({embeds: [embedCard]});
    }, 6000);
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
}


//red zone
//red zone
//red zone

async function createRedCard(char, interaction) {
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
    await viewRCard(newcard, interaction);
}

async function viewRCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.ruby)
        .setImage(`https://cdn.discordapp.com/attachments/948035448134058096/1138011018136662076/hitomigacha.gif`);
    await interaction.reply({embeds: [embedCard]});
    setTimeout(async () => {
        await interaction.editReply({embeds: [embedCard]});
    }, 6000);
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
*you can update image with /amethystupdate*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
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
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
                .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
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
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);
}

async function rngImgID(cid, interaction) {
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

async function createDiaCard(char, interaction) {
    const uid = await interaction.user.id;
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const imageRng = await rngImgID(char.characterID, interaction);
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
        rarity: 6,
    });
    let channel = interaction.guild.channels.cache.get('1140794715797737502');
    channel.send(`A luck sack got a **Diamond :large_blue_diamond: ${char.characterID} | ${char.characterName} from ${series.seriesName}!**`)
    return await viewDiaCard(newcard, interaction);
}

async function viewDiaCard(card, interaction) {
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.diamond)
        .setImage(`https://cdn.discordapp.com/attachments/948035448134058096/1138011018136662076/hitomigacha.gif`);
    await interaction.reply({embeds: [embedCard]});
    setTimeout(async () => {
        await interaction.editReply({embeds: [embedCard]});
    }, 6000);
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
Gif ID is ${image.gifID} report any errors using ID
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.")
            .setImage('https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png');
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
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond);
}

async function createAzurCard(char, interaction) {
    const uid = await interaction.user.id;
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image = await database.Image.findOne({where: {characterID: char.characterID, imageNumber: 1}});
    const inumber = await inventorycheck(uid);
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
            artist: "None",
            season: 1
        })
    }
    let channel = interaction.guild.channels.cache.get('1140794715797737502');
    channel.send(`A Legendary luck sack got a **Azurite :diamond_shape_with_a_dot_inside: ${char.characterID} | ${char.characterName} from ${series.seriesName}!!!**`)
    await viewAzurCard(newcard, interaction);
}

async function viewAzurCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    embedCard.setTitle('Wishing...')
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setColor(color.azur)
        .setImage(`https://cdn.discordapp.com/attachments/948035448134058096/1138011018136662076/hitomigacha.gif`);
    await interaction.reply({embeds: [embedCard]});
    setTimeout(async () => {
        await interaction.editReply({embeds: [embedCard]});
    }, 6000);
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const simps = await database.Wishlist.count({where: {characterID: cid}});
    const ranktxt = await ranktext(char.rank);
    const url = azur.imageURL;
    const artist = azur.artist;
    embedCard.setFooter(`Art by ${artist}
*Upload your choice of image of the character using /stellarupload*`).setImage(url)
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor({name: interaction.user.username, icon: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${ranktxt} | **Simps: **${simps}
**Rarity: Azurite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.azur);
}


async function raritySwitch(char, rngRarity, interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    player.increment({gems: -100});
    const channel2 = interaction.guild.channels.cache.get('997873272014246018');
    if ((rngRarity + player.apity/15) >= 99995 || player.apity > 1500) {
        player.update({apity: 0});
        player.increment({pity: 1});
        channel2.send(`${interaction.user} rolled ${rngRarity} with ${player.apity} pity.`)
        await createAzurCard(char, interaction);
    } else if ((rngRarity + player.apity/5) >= 99700) {
        channel2.send(`${interaction.user} rolled ${rngRarity}.`)
        player.increment({pity: 1, apity: 1});
        await createDiaCard(char, interaction);
    } else if (player.pity > 70 || (rngRarity + player.pity*100) >= 99000) {
        await player.update({pity: 0});
        await player.increment({apity: 1});
        await createRedCard(char, interaction);
    } else if (rngRarity >= 85000) {
        player.increment({pity: 1, apity: 1});
        await createPurpleCard(char, interaction);
    } else {
        player.increment({pity: 1, apity: 1});
        await createBlueCard(char, interaction);
    }
}

//When getting an azurite, check for wishlist and amount of diamonds. Boost their rates.
async function azurchar(interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    const rngpool = Math.floor(await (Math.random() * 1000 + player.apity/50));
    const wcount = await database.Wishlist.count({where: {playerID: user}})
    let cid;
    if (wcount >= 5 && (rngpool >= 750)) {
        const wlist = await database.Wishlist.findAll({where: {playerID: user}})
        const rngChar = Math.floor(Math.random() * 1000);
        const char = (rngChar%wlist.length);
        cid = await wlist[char].characterID;
        if(await player.apity > 10000) {
            await player.increment({apity: -10000});
        } else {
            await player.update({apity: 0});
        }
    } else {
        const rngChar = Math.floor(Math.random() * 10000);
        const count = await database.Character.count({where: {rank: {[Op.lt]: 3}}});
        const offset = (rngChar%count);
        const char = await database.Character.findOne({offset: offset, where: {rank: {[Op.lt]: 3}}});
        cid = await char.characterID;
    }
    return cid;
}

//Rank 1 and 2 and any wishlist.
async function mainPool(interaction) {
    const user = await interaction.user.id;
    const rngChar = Math.floor(Math.random() * 10000);
    const rngRarity = Math.floor(Math.random() * 100000);
    const wishlist = await database.Wishlist.findAll({
        attributes: ['characterID'],
        where: {playerID: user}
    })
    const offset = (rngChar%100);
    const char = await database.Character.findOne({
        offset: offset, 
        where: {
            [Op.or]: [
                {rank: 1}, 
                {characterID: {[Op.in]: wishlist}}
            ]
        }
    });
    await raritySwitch(char, rngRarity, interaction);
}

//All characters regardless of wishlist.
async function allPool(interaction) {
    const totalChar = await database.Character.count();
    const rngChar = Math.floor(Math.random() * 100000);
    const rngRarity = Math.floor(Math.random() * 100000);
    const cid = (rngChar%totalChar)+1;
    const char = await database.Character.findOne({
        where: {
            characterID: cid
        }
    })
    await raritySwitch(char, rngRarity, interaction);
}

async function gacha(interaction) {
    const user = interaction.user.id;
    const trashon = await database.Trashon.findOne({where: {playerID: user}});
    await mainPool(interaction);
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
                if (player.gems >= 100){
                    await gacha(interaction);
                } else {
                    //not enough gems embed.
                    embedE.setDescription(`You need 100 gems to gacha. Do dailies, add new series, characters or send images to gain more gems`);
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