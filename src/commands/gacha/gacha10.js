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

    embed.setTitle(`${interaction.user.username}'s 10 Gacha results`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Description will reset if successful.")
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
        const char = await database.Character.findOne({where: {characterID: cid}});
        const gachaString = `:white_large_square:` + dupe.inventoryID + ` | ` + char.characterName +" **duplicate**";
        return gachaString;
    } else {
        const inumber = await inventorycheck(user)
        const newcard = await database.Card.create({
            playerID: user,
            characterID: cid,
            inventoryID: inumber,
            quantity: 1,
            rarity: 1,
        });
        const char = await database.Character.findOne({where: {characterID: cid}});
        const gachaString = `:white_large_square:` +  inumber + ` | `+ char.characterName;
        return gachaString;
    }
}


//Green card zone
//Green card zone
//Green card zone

async function createGreenCard(cid, interaction) {
    const uid = await interaction.user.id;
    const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 2}});
    if (dupe) {
        dupe.increment({quantity: 1});
        const char = await database.Character.findOne({where: {characterID: cid}});
        const gachaString = `:green_square:` + dupe.inventoryID + ` | ` + char.characterName +" **duplicate**";
        return gachaString;
    } else {
        const inumber = await inventorycheck(uid)
        const newcard = await database.Card.create({
            playerID: uid,
            characterID: cid,
            inventoryID: inumber,
            quantity: 1,
            rarity: 2,
        });
        const char = await database.Character.findOne({where: {characterID: cid}});
        const gachaString = `:green_square:` + inumber + ` | ` + char.characterName;
        return gachaString;
    }
    
    
}

async function rngImage(cid, interaction) {
    const char = await database.Character.findOne({ where: {characterID: cid}});
    let imageRange;
    if (char.imageCount > 10) {
        imageRange = 10
    } else {
        imageRange = char.imageCount;
    }
    return await imageRange;
}

async function rngGif(cid, interaction) {
    const char = await database.Character.findOne({ where: {characterID: cid}});
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
        imageRng = ((Math.floor(Math.random() * 100))%total)+1;
        if (imageRng > imageCap) {
            imageRng = -(imageRng-imageCap);
        }
    }

    const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 3, imageID: imageRng}});
    let newcard;
    if (dupe) {
        dupe.increment({quantity: 1});
        await viewBCard(dupe, interaction);
        const gachaString = `:blue_square:` + dupe.inventoryID + ` | ` + char.characterName + `(#${dupe.imageNumber})` + " **duplicate**";
        return gachaString;
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
    // await viewBCard(newcard, interaction);
    const gachaString = `:blue_square:` + newcard.inventoryID + ` | ` + char.characterName + `(#${newcard.imageNumber})`;
    return gachaString;
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
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(card.imageNumber)}});
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
    
    await interaction.followUp({embeds: [embedCard]});
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
    const gachaString = `:purple_square:` + newcard.inventoryID + ` | ` + char.characterName + `(#${newcard.imageNumber})`;
    return gachaString;
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
            image = await database.Image.findOne({where: {imageID: 1}})
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
            image = await database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        image = await database.Image.findOne({where: {imageID: 1}})
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
    await interaction.followUp({embeds: [embedCard]});
}


//red zone
//red zone
//red zone

async function createRedCard(cid, interaction) {
    const uid = await interaction.user.id;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
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
    channel.send(`A lucky player got a **Ruby :red_square: ${cid} | ${char.characterName} from ${series.seriesName}!**`);
    await viewRCard(newcard, interaction);
    const gachaString = `:red_square:` + newcard.inventoryID + ` | ` + char.characterName + `(#${newcard.imageNumber})`;
    return gachaString;
}

async function viewRCard(card, interaction) { 
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
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);
    await interaction.followUp({embeds: [embedCard]});
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
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const imageRng = await rngImgID(cid, interaction);
    let image;
    let imgID;
    if (imageRng > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: imageRng}});
        if (image) {imgID = await image.imageID};
    } else if (imageRng < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(imageRng)}});
        if (image) {imgID = -(await image.gifID)};
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
    channel.send(`A luck sack got a **Diamond :large_blue_diamond: ${cid} | ${char.characterName} from ${series.seriesName}!**`);
    await viewDiaCard(newcard, interaction);
    const gachaString = `:large_blue_diamond:` + newcard.inventoryID + ` | ` + char.characterName + `(#${newcard.imageNumber})`;
    return await gachaString;
}


async function viewDiaCard(card, interaction) { 
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
*Set image with /diaset*`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: card.imageID}});
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
    await interaction.followUp({embeds: [embedCard]});
}

async function createAzurCard(interaction) {
    const cid = await azurchar(interaction);
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
    const inumber = await inventorycheck(uid)
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inumber,
        rarity: 9,
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
            imageURL: 'https://cdn.discordapp.com/attachments/948195855742165013/998254327523180685/stockc.png',
            artist: 'Image 1 Missing',
            season: 1
        })
    }
    await player.update({apity: 0});
    let channel = interaction.guild.channels.cache.get('948507565577367563');
    channel.send(`A Legendary luck sack got a **Azurite :diamond_shape_with_a_dot_inside: ${cid} | ${char.characterName} from ${series.seriesName}!!!**`)
    await viewAzurCard(newcard, interaction);
    const gachaString = `:diamond_shape_with_a_dot_inside:` + newcard.inventoryID + ` | ` + char.characterName;
    return await gachaString;
}

async function viewAzurCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const url = azur.imageURL;
    const artist = azur.artist;
    embedCard.setFooter({text: `Art by ${artist}
Upload your choice of image using /azuriteupload`}).setImage(url);
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Azurite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.azur);
    await interaction.followUp({embeds: [embedCard]});
}


async function raritySwitch(cid, rngRarity, interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    player.increment({gems: -10});
    const pity = Math.floor(player.pity*3/10);
    const channel2 = interaction.guild.channels.cache.get('997873272014246018');
    const apityrng = await (rngRarity + player.apity/4);
    const pityrng = await (rngRarity + pity);
    if (apityrng >= 99995) {
        channel2.send(`${interaction.user} rolled ${rngRarity} with ${player.apity} pity.`)
        return createAzurCard(interaction);
    } else if (rngRarity >= 99900) {
        channel2.send(`${interaction.user} rolled ${rngRarity}.`)
        player.increment({apity: 1});
        return createDiaCard(cid, interaction);
    } else if (pityrng >= 99200) {
        if (player.pity < 400) {
            player.update({pity: 0});
        } else {
            player.increment({pity: -400});
        }
        return createRedCard(cid, interaction);
    } else if (rngRarity >= 95000) {
        player.increment({pity: 1});
        return createPurpleCard(cid, interaction);
    } else if (rngRarity >= 80000) {
        player.increment({pity: 1});
        return createBlueCard(cid, interaction);
    } else if (rngRarity >= 60000) {
        player.increment({pity: 1});
        return createGreenCard(cid, interaction);
    } else {
        player.increment({pity: 1});
        return createWhiteCard(cid, interaction);
    }
}

async function azurWishlist(interaction) {
    const user = interaction.user.id;
    const wishlist = await database.Wishlist.findAll({where: {playerID: user}});
    for (let i; i < wishlist.length; i++) {
        const exists = await database.Card.findOne({where: {rarity: 9, characterID: wishlist.characterID}});
        if (!exists) {
            return true;
        }
    }
    return false;
}

async function azurchar(interaction) {
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    const rngpool = Math.floor(Math.random() * 1000 + player.apity);
    const wcount = await database.Wishlist.count({where: {playerID: user}})
    let cid;
    if (wcount >= 5 && (rngpool >= 500) && (azurWishlist(interaction))) {
        const wlist = await database.Wishlist.findAll({where: {playerID: user}})
        const rngChar = Math.floor(Math.random() * 1000);
        const char = (rngChar%wlist.length);
        cid = await wlist[char].characterID;
    } else {
        const rngChar = Math.floor(Math.random() * 10000);
        const count = await database.Character.count({where: {rank: {[Op.lt]: 3}}});
        const offset = (rngChar%count);
        const char = await database.Character.findOne({offset: offset, where: {rank: {[Op.lt]: 3}}});
        cid = await char.characterID;
    }
    const exists = await database.Card.findOne({where: {rarity: 9, characterID: cid}});
    if (exists) {
        return azurchar(interaction);
    } else {
        return cid;
    }
}

async function wlPool(interaction) {
    const user = interaction.user.id;
    const wcount = await database.Wishlist.count({where: {playerID: user}})
    if (wcount >= 5) {
        const wlist = await database.Wishlist.findAll({where: {playerID: user}})
        const rngChar = Math.floor(Math.random() * 1000);
        const char = (rngChar%wlist.length);
        const cid = await wlist[char].characterID;
        const rngRarity = Math.floor(Math.random() * 100000);
        return await raritySwitch(cid, rngRarity, interaction);
    } else {
        return await mainPool(interaction);
    }
}

async function majorPool(interaction) {
    const sideChar = await database.Character.count({where: {rank: {[Op.lt]: 3}}});
    const rngChar = Math.floor(Math.random() * 10000);
    const rngRarity = Math.floor(Math.random() * 100000);
    const offset = (rngChar%sideChar);
    const char = await database.Character.findOne({offset: offset, where: {rank: {[Op.lt]: 3}}});
    const cid = await char.characterID;
    return await raritySwitch(cid, rngRarity, interaction);
}

async function mainPool(interaction) {
    const rngChar = Math.floor(Math.random() * 10000);
    const rngRarity = Math.floor(Math.random() * 100000);
    const offset = (rngChar%100);
    const char = await database.Character.findOne({offset: offset, where: {rank: 1}});
    const cid = await char.characterID;
    return await raritySwitch(cid, rngRarity, interaction);
}

async function sidePool(interaction) {
    const sideChar = await database.Character.count({where: {rank: 2}});
    const rngChar = Math.floor(Math.random() * 10000);
    const rngRarity = Math.floor(Math.random() * 100000);
    const offset = (rngChar%sideChar);
    const char = await database.Character.findOne({offset: offset, where: {rank: 2}});
    const cid = await char.characterID;
    return await raritySwitch(cid, rngRarity, interaction);
}

async function allPool(interaction) {
    const totalChar = await database.Character.count();
    const rngChar = Math.floor(Math.random() * 100000);
    const rngRarity = Math.floor(Math.random() * 100000);
    const cid = (rngChar%totalChar)+1;
    return await raritySwitch(cid, rngRarity, interaction);
}




async function sideofftrashoff(interaction) {
    const embedS = await embedSucess(interaction);
    await interaction.reply({embeds: [embedS]});
    const list = [];
    for (let i = 0; i < 10; i++) {
        const rngPool = Math.floor(Math.random() * 100);
        if (rngPool >= 97) {
            list[i] = await wlPool(interaction);
        } else if (rngPool >= 70) {
            list[i] = await mainPool(interaction);
        } else {
            list[i] = await sidePool(interaction);
        }
        const listString = list.join(`\n`);
        embedS.setDescription(`${listString}`)
        await interaction.editReply({embeds: [embedS]});
    }
    
    
}
async function sideontrashoff(interaction) {
    const embedS = await embedSucess(interaction);
    await interaction.reply({embeds: [embedS]});
    const list = [];
    for (let i = 0; i < 10; i++) {
        const rngPool = Math.floor(Math.random() * 100);
        if (rngPool >= 91) {
            list[i] = await wlPool(interaction);
        } else {
            list[i] = await majorPool(interaction);
        }
        const listString = list.join(`\n`);
        embedS.setDescription(`${listString}`)
        await interaction.editReply({embeds: [embedS]});
    }
    
}
async function sideontrashon(interaction) {
    const embedS = await embedSucess(interaction);
    await interaction.reply({embeds: [embedS]});
    const list = [];
    for (let i = 0; i < 10; i++) {
        const rngPool = Math.floor(Math.random() * 100);
        if (rngPool >= 85) {
            list[i] = await wlPool(interaction);
        } else {
            list[i] = await allPool(interaction);
        }
        const listString = list.join(`\n`);
        embedS.setDescription(`${listString}`)
        await interaction.editReply({embeds: [embedS]});
    }
}

async function gacha(interaction) {
    const user = interaction.user.id;
    const sideson = await database.Sideson.findOne({where: {playerID: user}});
    const trashon = await database.Trashon.findOne({where: {playerID: user}});
    if (!sideson && !trashon) {
        return await sideofftrashoff(interaction);
    } else if (sideson && !trashon){
        return await sideontrashoff(interaction);
    } else {
        return await sideontrashon(interaction);
    }
    //side off trash off 10%wl, 60%tops, 30% sides
    //sides on trash off 20%wl, 40%tops, 40%sides
    //sides on trash on  30%wl, 70% normal.
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gtenroll')
		.setDescription('Spend 10 times the gems to do 10 gacha'),
	async execute(interaction) {
        try {
            const user = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: user}});
            if(player) {
                if (player.gems >= 100){
                    const wlist = await database.Wishlist.count({where: {playerID: user}})
                    if (wlist >= 5) {
                        await gacha(interaction);
                    }else {
                        await interaction.channel.send("Characters in your wishlist have a higher chance of appearing in gacha. It is recommended to have at least 5 characters in your wishlist.")
                        await gacha(interaction);
                    }
                    
                } else {
                    //not enough gems embed.
                    const embedE = await embedError(interaction);
                    (embedE).setDescription("You need 100 gems to gacha.\nDo dailies, add new series, characters or send images to gain more gems")
                    return await interaction.reply({embeds: [embedE]});
                }
                
            } else {
                //embed no player registered.
                const embedE = await embedError(interaction);
                (embedE).setDescription("You haven't isekaied yet. Do /isekai to get started.")
                return await interaction.reply({embeds: [embedE]});
            }
        } catch(error) {
            await interaction.channel.send("Error has occured while performing the command.")
        }        
    }
}