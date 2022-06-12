const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
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

async function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Card created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Followup should be the card embed.")
        .setColor(color.successgreen);
    
    return embed;
}

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

//White card zone
//White card zone
//White card zone


async function createWhiteCard(cid, interaction) {
    const user = await interaction.user.id;
    const dupe = await database.Card.findOne({where: {playerID: user, characterID: cid, rarity: 1}});
    if (dupe) {
        dupe.increment({quantity: 1});
        await viewWCard(dupe, interaction);
    } else {
        const inumber = await inventorycheck(user)
        const newcard = await database.Card.create({
            playerID: user,
            characterID: cid,
            inventoryID: inumber,
            quantity: 1,
            rarity: 1,
        });
        await viewWCard(newcard, interaction);
    }
}


async function viewWCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image1 = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
    if (image1) {
        embedCard.setImage(image1.imageURL).setFooter({text: `#${image1.imageNumber} Art by ${image1.artist} | Uploaded by ${image1.uploader}
Image ID is ${image1.imageID} report any errors using ID.`})
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID: **${cid}
**Series: **${char.seriesID} | ${series.seriesName}
**Rarity: Quartz**
**Quantity:** ${card.quantity}`)
        .setColor(color.white);
    return await interaction.reply({embeds: [embedCard]});
}


//Green card zone
//Green card zone
//Green card zone

async function createGreenCard(cid, interaction) {
    const uid = await interaction.user.id;
    const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 2}});
    
    if (dupe) {
        dupe.increment({quantity: 1});
        await viewGCard(dupe, interaction);
    } else {
        const inumber = await inventorycheck(uid)
        const newcard = await database.Card.create({
            playerID: uid,
            characterID: cid,
            inventoryID: inumber,
            quantity: 1,
            rarity: 2,
        });
        await viewGCard(newcard, interaction);
    }
    
}


async function viewGCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image1 = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
    if (image1) {
        embedCard.setImage(image1.imageURL).setFooter({text: `#${image1.imageNumber} Art by ${image1.artist} | Uploaded by ${image1.uploader}
Image ID is ${image1.imageID} report any errors using ID.`})
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Jade
**Quantity:** ${card.quantity}`)
        .setColor(color.green);
    return await interaction.reply({embeds: [embedCard]});
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

async function createBlueCard(cid, interaction) {
    const uid = await interaction.user.id;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const imageCap = await rngImage(cid, interaction);
    const gifCap = await rngGif(cid, interaction);
    const total = await (imageCap + gifCap);
    let imageRng;
    if (total == 0) {
        imageRng = 1;
    } else {
        imageRng = await ((Math.floor(Math.random() * 100))%total)+1;
        if (imageRng > imageCap) {
            imageRng = -(imageRng-imageCap);
        }
    }

    const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 3, imageID: imageRng}});
    let newcard;
    if (dupe) {
        dupe.increment({quantity: 1});
        await viewBCard(dupe, interaction);
    } else {
        const inumber = await inventorycheck(uid)
        newcard = await database.Card.create({
            playerID: uid,
            characterID: cid,
            inventoryID: inumber,
            imageNumber: imageRng,
            quantity: 1,
            rarity: 3,
        });
        
    }
    return await viewBCard(newcard, interaction);
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
            embedCard.setFooter({text: `#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageNumber)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter({text: `#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`}).setImage(url)
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
    return await interaction.reply({embeds: [embedCard]});
}

///Purple Zone
///Purple Zone
///Purple Zone

async function createPurpleCard(cid, interaction) {
    const uid = await interaction.user.id;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const imageCap = await rngImage(cid, interaction);
    const gifCap = await rngGif(cid, interaction);
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
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID;} 
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID);}
    } else {
        imgID = 0;
    }
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
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
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    let image;
    let url;
    if (card.imageID > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageID: card.imageID}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter({text: `#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*you can update image with /amethystupdate*`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
            url = await image.gifURL;
            embedCard.setFooter({text: `#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*you can update image with /amethystupdate*`}).setImage(url)
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
    return await interaction.reply({embeds: [embedCard]});
}


//red zone
//red zone
//red zone

async function createRedCard(cid, interaction) {
    const uid = await interaction.user.id;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const imageCap = await rngImage(cid, interaction);
    const gifCap = await rngGif(cid, interaction);
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
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID;} 
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID);}
    } else {
        imgID = 0;
    }
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inumber,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 5,
    });
    let channel = interaction.guild.channels.cache.get('948507565577367563');
    channel.send(`A luck sack got a Ruby ${cid} | ${char.characterName}!`)
    await viewRCard(newcard, interaction);
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
            embedCard.setFooter({text: `#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*you can update image with /amethystupdate*`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -card.imageID}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter({text: `#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.
*you can update image with /amethystupdate*`}).setImage(url)
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
    return await interaction.reply({embeds: [embedCard]});
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

async function createDiaCard(cid, interaction) {
    const uid = await interaction.user.id;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const imageRng = await rngImgID(cid, interaction);
    let image;
    let imgID;
    if (imageRng > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID;} 
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID);}
    } else {
        imgID = 0;
    }
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inumber,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 6,
    });
    let channel = interaction.guild.channels.cache.get('948507565577367563');
    channel.send(`An extra lucky luck sack got a Diamond ${cid} | ${char.characterName}!`)
    return await viewDiaCard(newcard, interaction);
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
            embedCard.setFooter({text: `#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -card.imageID}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter({text: `#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID
*Set image with /diaset*`}).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = database.Image.findOne({where: {imageID: 1}})
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    (embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond));
    return await interaction.reply({embeds: [embedCard]});
}


async function raritySwitch(cid, rngRarity, interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    player.increment({gems: -10});
    const pity = Math.floor(player.pity*3/10);
    if ((rngRarity) >= 9992) {
        player.increment({pity: 1});
        createDiaCard(cid, interaction);
    } else if (rngRarity + pity >= 9922) {
        if (player.pity < 400) {
            await player.update({pity: 0});
        } else {
            await player.increment({pity: -400});
        }
        createRedCard(cid, interaction);
    } else if (rngRarity >= 9592) {
        player.increment({pity: 1});
        createPurpleCard(cid, interaction);
    } else if (rngRarity >= 8092) {
        player.increment({pity: 1});
        createBlueCard(cid, interaction);
    } else if (rngRarity >= 6000) {
        player.increment({pity: 1});
        createGreenCard(cid, interaction);
    } else {
        player.increment({pity: 1});
        createWhiteCard(cid, interaction);
    }
}

async function pityPull(interaction) {
    const user = interaction.user.id;
    const wlist = await database.Wishlist.findAll({where: {playerID: user}})
    const rngChar = Math.floor(Math.random() * 1000);
    const char = (rngChar%wlist.length);
    const cid = await wlist[char].characterID;
    await raritySwitch(cid, 10000, interaction);
}

async function wlPool(interaction) {
    const user = interaction.user.id;
    const wlist = await database.Wishlist.findAll({where: {playerID: user}})
    const rngChar = Math.floor(Math.random() * 1000);
    const char = (rngChar%wlist.length);
    const cid = await wlist[char].characterID;
    const rngRarity = Math.floor(Math.random() * 10000);
    await raritySwitch(cid, rngRarity, interaction);
}

async function mainPool(interaction) {
    const rngChar = Math.floor(Math.random() * 10000);
    const rngRarity = Math.floor(Math.random() * 10000);
    const offset = (rngChar%100);
    const char = await database.Character.findOne({offset: offset, where: {rank: 1}});
    const cid = await char.characterID;
    await raritySwitch(cid, rngRarity, interaction);
}

async function sidePool(interaction) {
    const sideChar = await database.Character.count({where: {rank: 2}});
    const rngChar = Math.floor(Math.random() * 10000);
    const rngRarity = Math.floor(Math.random() * 10000);
    const offset = (rngChar%sideChar);
    const char = await database.Character.findOne({offset: offset, where: {rank: 2}});
    const cid = await char.characterID;
    await raritySwitch(cid, rngRarity, interaction);
}

async function allPool(interaction) {
    const totalChar = await database.Character.count();
    const rngChar = Math.floor(Math.random() * 100000);
    const rngRarity = Math.floor(Math.random() * 10000);
    const cid = (rngChar%totalChar)+1;
    await raritySwitch(cid, rngRarity, interaction);
}




async function sideofftrashoff(interaction) {
    const rngPool = Math.floor(Math.random() * 100);
    if (rngPool >= 97) {
        await wlPool(interaction);
    } else if (rngPool >= 70) {
        await mainPool(interaction);
    } else {
        await sidePool;
    }
}
async function sideontrashoff(interaction) {
    const rngPool = Math.floor(Math.random() * 100);
    if (rngPool >= 91) {
        await wlPool(interaction);
    } else if (rngPool >= 80) {
        await mainPool(interaction);
    } else {
        await sidePool(interaction);
    }
}
async function sideontrashon(interaction) {
    const rngPool = Math.floor(Math.random() * 100);
    if (rngPool >= 85) {
        await wlPool(interaction);
    } else {
        await allPool(interaction);
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
    //side off trash off 10%wl, 60%tops, 30% sides
    //sides on trash off 20%wl, 40%tops, 40%sides
    //sides on trash on  30%wl, 70% normal.
}


// async function gacha(interaction) {
//     const user = interaction.user.id;
//     const sideson = await database.Sideson.findOne({where: {playerID: user}});
//     const totalChar = await database.Character.count();
//     const rngChar = Math.floor(Math.random() * 100000);
//     const rngRarity = Math.floor(Math.random() * 10000);
//     const cid = (rngChar%totalChar)+1;
//         await raritySwitch(cid, rngRarity, interaction);
// if (sideson) {
//     const totalChar = await database.Character.count();
//     const rngChar = Math.floor(Math.random() * 100000);
//     const rngRarity = Math.floor(Math.random() * 10000);
//     const cid = (rngChar%totalChar)+1;
//     await raritySwitch(cid, rngRarity, interaction);
// } else {
//     const totalChar = await database.Character.count({where: {side: false}});
//     const rngChar = Math.floor(Math.random() * 100000);
//     const rngRarity = Math.floor(Math.random() * 10000);
//     const offset = (rngChar%totalChar);
//     const char = await database.Character.findOne({offset: offset, where: {side: false}});
//     const cid = await char.characterID;
//     await raritySwitch(cid, rngRarity, interaction);
// }
// }

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gacha')
		.setDescription('Spend gems to do gacha'),
	async execute(interaction) {
        try {
            const user = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: user}});
            const embedE = await embedError(interaction);
            if(player) {
                if (player.gems >= 10){
                    const inventory = await database.Card.count({where: {playerID: user}});
                    if (inventory > 1000) {
                        return await interaction.reply("you have more than 1000 cards. Burn some before doing more gacha.")
                    }
                    const wlist = await database.Wishlist.count({where: {playerID: user}})
                    if (wlist >= 5) {
                        await gacha(interaction);
                    }else {
                        (embedE).setDescription("You need 5 or more waifus in wishlist to use gacha. use /wa to add to your wishlist!")
                        return await interaction.reply({embeds: [embedE]});
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
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}