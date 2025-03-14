const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Client, Collection } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
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
// //White card zone


// async function createWhiteCard(cid, interaction) {
//     const user = await interaction.user.id;
//     const inventory = await inventorycheck(user);
//     const dupe = await database.Card.findOne({where: {playerID: user, characterID: cid, rarity: 1}});
//     if (dupe) {
//         dupe.increment({quantity: 1});
//         const char = await database.Character.findOne({where: {characterID: cid}});
//     } else {
//         const newcard = await database.Card.create({
//             playerID: user,
//             characterID: cid,
//             inventoryID: inventory,
//             quantity: 1,
//             rarity: 1,
//         });
//         const char = await database.Character.findOne({where: {characterID: cid}});
//     }
// }


//Green card zone
//Green card zone
//Green card zone

// async function createGreenCard(cid, interaction) {
//     const uid = await interaction.user.id;
//     const inventory = await inventorycheck(uid);
//     const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 2}});
//     if (dupe) {
//         dupe.increment({quantity: 1});
//         const char = await database.Character.findOne({where: {characterID: cid}});
//     } else {
//         const newcard = await database.Card.create({
//             playerID: uid,
//             characterID: cid,
//             inventoryID: inventory,
//             quantity: 1,
//             rarity: 2,
//         });
//         const char = await database.Character.findOne({where: {characterID: cid}});
//     }
    
    
// }

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
    const inventory = await inventorycheck(uid);
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
    } else {
        newcard = await database.Card.create({
            playerID: uid,
            characterID: cid,
            inventoryID: inventory,
            imageNumber: imageRng,
            quantity: 1,
            rarity: 3,
        });
        
    }
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
**Rarity:** Jade
**Quantity:** ${card.quantity}`)
        .setColor(color.jade);
    
    await interaction.followUp({embeds: [embedCard]});
}

///Purple Zone
///Purple Zone
///Purple Zone

async function createPurpleCard(cid, interaction) {
    const uid = await interaction.user.id;
    const inventory = await inventorycheck(uid);
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
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inventory,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 4,
    });
    // await viewPCard(newcard, interaction);
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
            image = await database.Image.findOne({where: {imageID: 1}})
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
    const inventory = await inventorycheck(uid);
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
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inventory,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 5,
    });
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
    const inventory = await inventorycheck(uid);
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
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inventory,
        imageID: imgID,
        imageNumber: imageRng,
        quantity: 1,
        rarity: 6,
    });
    let channel = interaction.guild.channels.cache.get('1140794715797737502');
    channel.send(`A luck sack got a **Diamond :large_blue_diamond: ${cid} | ${char.characterName} from ${series.seriesName}!**`);
    await viewDiaCard(newcard, interaction);
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
            embedCard.setFooter({text: `#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.
*Set image with /diaset*`}).setImage(url)
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
*Set image with /diaset*`}).setImage(url)
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


async function createAzurCard(cid, interaction) {
    console.log("creating");
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: interaction.user.id}});
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const image = await database.Image.findOne({where: {characterID: cid, imageNumber: 1}});
    const inumber = await inventorycheck(uid);
    const newcard = await database.Card.create({
        playerID: uid,
        characterID: cid,
        inventoryID: inumber,
        rarity: 8,
    });
    if (image) {
        console.log("image found");
        await database.Azurite.create({
            cardID: newcard.cardID,
            imageURL: image.imageURL,
            artist: image.artist,
            season: 1
        })
    } else {
        console.log("no image found");
        await database.Azurite.create({
            cardID: newcard.cardID,
            imageURL: 'https://cdn.discordapp.com/attachments/1086674842893438976/1128897000109252779/Noimage.png',
            artist: 'Image 1 Missing',
            season: 1
        })
    }
    let channel = interaction.guild.channels.cache.get('1140794715797737502');
    channel.send(`A Legendary luck sack got a **Azurite :diamond_shape_with_a_dot_inside: ${cid} | ${char.characterName} from ${series.seriesName}!!!**`)
    await viewAzurCard(newcard, interaction);
}


// async function azurchar(interaction) {
//     console.log("we got to azurchar");
//     const user = interaction.user.id;
//     const player = await database.Player.findOne({where: {playerID: user}});
//     const rngpool = Math.floor(await (Math.random() * 1000 + player.apity/50));
//     const wcount = await database.Wishlist.count({where: {playerID: user}})
//     let cid;
//     if (wcount >= 5 && (rngpool >= 500)) {
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
//         if(await player.apity > 2000) {
//             await player.increment({apity: -2000});
//         } else {
//             await player.update({apity: 0});
//         }
//     }
//     return cid;
// }

async function viewAzurCard(card, interaction) { 
    console.log("viewing...");
    const embedCard = new MessageEmbed();
    const cid = await card.characterID
    const char = await database.Character.findOne({where: {characterID: cid}});
    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
    const azur = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const url = azur.imageURL;
    const artist = azur.artist;
    embedCard.setFooter({text: `Art by ${artist}
*Upload your choice of image of the character using /stellarupload*`}).setImage(url);
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



async function rarityCreate(cid, rarity, interaction) {
    switch (rarity) {            
        case 3:
            await createBlueCard(cid, interaction);
            break;

        case 4:
            await createPurpleCard(cid, interaction);
            break;

        case 5:
            await createRedCard(cid, interaction);
            break;

        case 6:
            await createDiaCard(cid, interaction);
            break;

        case 9:
            await createAzurCard(cid, interaction);
            break;
        
        default:
            break;
    }
}

async function rarityBurn(interaction, rarity) {
    switch (rarity) {
        case 1:
            await database.Player.increment({gems: 15, money: 10}, {where: {playerID: interaction.user.id}});
            return [10,15];

        case 2:
            await database.Player.increment({gems: 15, money: 20}, {where: {playerID: interaction.user.id}});
            return [20,15];
            
        case 3:
            await database.Player.increment({gems: 15, money: 50}, {where: {playerID: interaction.user.id}});
            return [50,15];

        case 4:
            await database.Player.increment({gems: 15, money: 200}, {where: {playerID: interaction.user.id}});
            return [200,15];
    }

}

// async function wlPool(interaction, rarity) {
//     const user = interaction.user.id;
//     const wcount = await database.Wishlist.count({where: {playerID: user}})
//     if (wcount >= 5) {
//         const wlist = await database.Wishlist.findAll({where: {playerID: user}})
//         const rngChar = Math.floor(Math.random() * 1000);
//         const char = (rngChar%wlist.length);
//         const cid = await wlist[char].characterID;
//         return await rarityCreate(cid, rarity, interaction);
//     } else {
//         await mainPool(interaction, rarity);
//     }
// }

// async function majorPool(interaction, rarity) {
//     const sideChar = await database.Character.count({where: {rank: {[Op.lt]: 3}}});
//     const rngChar = Math.floor(Math.random() * 10000);
//     const offset = (rngChar%sideChar);
//     const char = await database.Character.findOne({offset: offset, where: {rank: {[Op.lt]: 3}}});
//     const cid = await char.characterID;
//     return await rarityCreate(cid, rarity, interaction);
// }

// async function mainPool(interaction, rarity) {
//     const rngChar = Math.floor(Math.random() * 10000);
//     const offset = (rngChar%100);
//     const char = await database.Character.findOne({offset: offset, where: {rank: 1}});
//     const cid = await char.characterID;
//     return await rarityCreate(cid, rarity, interaction);
// }

// async function sidePool(interaction, rarity) {
//     const sideChar = await database.Character.count({where: {rank: 2}});
//     const rngChar = Math.floor(Math.random() * 10000);
//     const offset = (rngChar%sideChar);
//     const char = await database.Character.findOne({offset: offset, where: {rank: 2}});
//     const cid = await char.characterID;
//     return await rarityCreate(cid, rarity, interaction);
// }

// async function allPool(interaction, rarity) {
//     const totalChar = await database.Character.count();
//     const rngChar = Math.floor(Math.random() * 100000);
//     const cid = (rngChar%totalChar)+1;
//     return await rarityCreate(cid, rarity, interaction);
// }




// async function sideofftrashoff(interaction, rarity) {
//     const rngPool = Math.floor(Math.random() * 100);
//     if (rngPool >= 97) {
//         await wlPool(interaction, rarity);
//     } else if (rngPool >= 70) {
//         await mainPool(interaction, rarity);
//     } else {
//         await sidePool(interaction, rarity);
//     }
    
    
// }
// async function sideontrashoff(interaction, rarity) {
//     const rngPool = Math.floor(Math.random() * 100);
//     if (rngPool >= 91) {
//         await wlPool(interaction, rarity);
//     } else {
//         await majorPool(interaction, rarity);
//     }
// }
// async function sideontrashon(interaction, rarity) {
//     const rngPool = Math.floor(Math.random() * 100);
//     if (rngPool >= 85) {
//         await wlPool(interaction, rarity);
//     } else {
//         await allPool(interaction, rarity);
//     }
    
// }

// async function poolswitch(interaction, rarity) {
//     const user = interaction.user.id;
//     const sideson = await database.Sideson.findOne({where: {playerID: user}});
//     const trashon = await database.Trashon.findOne({where: {playerID: user}});
//     if (!sideson && !trashon) {
//         return await sideofftrashoff(interaction, rarity);
//     } else if (sideson && !trashon){
//         return await sideontrashoff(interaction, rarity);
//     } else {
//         return await sideontrashon(interaction, rarity);
//     }
// }

//side off trash off 10%wl, 60%tops, 30% sides
//sides on trash off 20%wl, 40%tops, 40%sides
//sides on trash on  30%wl, 70% normal.
async function raritySwitch(interaction) {
    // const rngRarity = 99999;
    const rngRarity = Math.floor(Math.random() * 100000);
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    await player.increment({gems: -100});
    const pity = Math.floor(player.pity*3/10);
    const channel2 = interaction.guild.channels.cache.get('997873272014246018');
    await player.increment({apity: 1});
    if ((rngRarity + player.apity/15) >= 99995 || player.apity > 1500) {
        channel2.send(`${interaction.user} rolled ${rngRarity} with ${player.apity} pity.`)
        player.update({apity: 0});
        player.increment({pity: 1});
        return 9;
    }else if (rngRarity + player.apity/5 >= 99700) {
        channel2.send(`${interaction.user} rolled ${rngRarity}.`)
        player.increment({pity: 1, apity: 1});
        return 6;
    } else if (player.pity > 70 || (rngRarity + player.pity*100) >= 99000) {
        await player.update({pity: 0});
        await player.increment({apity: 1});
        return 5;
    } else if (rngRarity >= 85000) {
        await player.increment({pity: 1});
        return 4;
    } else {
        await player.increment({pity: 1});
        return 3;
    }
}

async function rngChar(charlist) {
    const charCount = charlist.length;
    const rng = Math.floor(Math.random() * 10000) % charCount;
    const char = charlist[rng];
    return char;
}


async function gacha(interaction, embed) {
    const user = interaction.user.id;
    
    const amount = interaction.options.getInteger('amount');
    let setRarity = interaction.options.getInteger('rarity');
    if (!setRarity) {
        setRarity = 4;
    }
    const rarityName = await returnRarityName(setRarity);
    const burnArray = [0,0,0,0,0];
    const gachaArray = [0,0,0,0,0,0,0,0,0,0];
    const burnRewards = [0,0];//coin, gems
    const timeStart = Date.now();
    const wishlist = await database.Wishlist.findAll({
        attributes: ['characterID'],
        where: {playerID: user}
    });
    const charlist = await database.Character.findAll({
        where: {
            [Op.or]: [
                {rank: 1}, 
                {characterID: {[Op.in]: wishlist}}
            ]
        }
    });
    embed.setTitle('Processing Gacha');
    for (let i = 0; i < amount; i++) {
        const rarity = await raritySwitch(interaction);
        if (rarity > setRarity) {
            const char = await rngChar(charlist);

            //roll character
            await rarityCreate(char.characterID, rarity, interaction);
            gachaArray[rarity] += 1;
        } else {
            //burn card.
            const reward = await rarityBurn(interaction, rarity);
            burnArray[rarity] += 1;
            burnRewards[0] += reward [0];
            burnRewards[1] += reward [1];
        }
        embed.setDescription(`
**Gacha count:** ${i+1}/${amount}
**Burning:** ${rarityName} and lesser

**Gacha Stats**
**Jade:** ${gachaArray[3]}
**Amethyst:** ${gachaArray[4]}
**Ruby:** ${gachaArray[5]}
**Diamond:** ${gachaArray[6]}
**Azurite:** ${gachaArray[9]}


**Burn Stats**
**Jade:** ${burnArray[3]}
**Amethyst:** ${burnArray[4]}
**Coins:** ${burnRewards[0]}
**Gems:** ${burnRewards[1]}`)
        if(i%100 == 0) {
            await interaction.editReply({embeds: [embed]});
            if(i%300 == 0) {
                const player = await database.Player.findOne({where: {playerID: user}});
                if (player.gems < 0) {
                    i = amount;
                    await interaction.channel.send("Insufficient Gems, ending gultimate.");
                }
            }
        }
    }
    await interaction.followUp({embeds: [embed]});
    //we do a list here.
    const endping = interaction.options.getBoolean('endping');
    const embed2 = embedFinalList(interaction);
    const msg = await interaction.followUp({embeds: [embed2]});
    await justList(msg, embed2, interaction, 1, timeStart);
    if (endping) {
        await interaction.followUp(`${interaction.user}`)
    }
}


// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS

function embedFinalList(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Inventory")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`List of ${interaction.user.username} Cards`)
        .setColor(color.successgreen)
    
    return embed;
}

async function justList(msg, embed, interaction, page, timeStart){
    const uid = await interaction.user.id;
    const cardList = await database.Card.findAll(
        {
            order: [['rarity','DESC']],
            limit: 20,
            offset: (page-1)*20,
            where: {
            playerID: uid,
            createdAt: {[Op.gt]: timeStart}
        }}
    );
    const maxPage = await database.Card.count(
        {
            where: {
            playerID: uid,
            createdAt: {[Op.gt]: timeStart}
        }}
    );
    const totalPage = Math.ceil(maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    await msg.edit({embeds: [embed]});
    await buttonManagerList(msg, embed, interaction, page, timeStart, totalPage);
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

async function checkPage(direction, page, maxPage) {
    if (direction == 1 && page == maxPage) {
        return 1;
    } else if (direction == -1 && page == 1) {
        return maxPage;
    } else {
        return page + direction;
    }
}

async function deployButton(interaction, embed){
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setLabel('previous')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('next')
                .setStyle('PRIMARY'),
        );
    await interaction.editReply({ embeds: [embed], components: [row]});
}

async function buttonManagerList(msg, embed, interaction, page, maxPage) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await justList(msg, embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await justList(msg, embed, interaction, nextPage);
                    break;
                
                default:
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function whitecard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //check quantity
    const quantity = card.quantity;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:white_large_square:` + ID + ` ${lockstatus} ` + tag + charname + ` ×${quantity}`;
            return cardString
        } else {
            const cardString =`:white_large_square:` + ID + ` ${lockstatus} ` + charname + `×${quantity}`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:white_large_square:` + ID + ` ${lockstatus} ` + tag + charname + ` ×${quantity}`;
            return cardString
        } else {
            const cardString =`:white_large_square:` + ID + ` ${lockstatus} ` + charname + `×${quantity}`;
            return cardString
        }
    }
}

async function greencard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    
    //find charname
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    const charname = char.characterName;
    //check quantity
    const quantity = card.quantity;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + tag + charname + ` ×${quantity}`;
            return cardString
        } else {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + charname + `×${quantity}`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + tag + charname + ` ×${quantity}`;
            return cardString
        } else {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + charname + `×${quantity}`;
            return cardString
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
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})` + ` ×${quantity}`;
            return cardString
        } else {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})` + `×${quantity}`;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})` + ` ×${quantity}`;
            return cardString
        } else {
            const cardString =`:green_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})` + `×${quantity}`;
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

async function specard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    const special = await database.Special.findOne({where: {cardID: card.cardID}});
    
    //find charname
    const charname = special.characterName;
    const lock = card.lock;
    if (lock) {
        const lockstatus = '**|**';
        if (tag) {
            const cardString =`:large_orange_diamond:` + ID + ` ${lockstatus} ` + tag + charname;
            return cardString
        } else {
            const cardString =`:large_orange_diamond:` + ID + ` ${lockstatus} ` + charname;
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:large_orange_diamond:` + ID + ` ${lockstatus} ` + tag + charname;
            return cardString
        } else {
            const cardString =`:large_orange_diamond:` + ID + ` ${lockstatus} ` + charname;
            return cardString
        }
    }
}

async function switchRarity(card, rarity) {
    switch (rarity) {
        case 1:
            return whitecard(card);
            //white
        case 2:
            return greencard(card);
            //green
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

// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS
// END OF END OF GACHA LIST FUNCTIONS


async function returnRarityName(rarity) {
    switch(rarity) {
        case 1:
            return 'no'
        // case 1:
        //     return 'all quartz';
        // case 2:
        //     return `all jade`;
        case 3:
            return `all jade`;
        case 4:
            return `all amethyst`;
    }
}

async function confirmGacha(interaction) {
    const amount = interaction.options.getInteger('amount');
    let setRarity = interaction.options.getInteger('rarity');
    if (!setRarity) {
        setRarity = 4;
    }
    const embed = await embedSucess(interaction);
    const rarityName = await returnRarityName(setRarity);
    embed.setTitle('Confirm Gacha?')
    embed.setDescription(`You are spending ${amount*100} gems for ${amount} gachas
while burning ${rarityName} and lesser rarity cards.`)
//deploy button then manage button to confirm.
    const row = await createButton();
    msg = await interaction.reply( {embeds: [embed], components: [row], fetchReply: true});
    await buttonManager(interaction, msg, embed);
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('confirm')
                    .setLabel('confirm')
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

async function buttonManager(interaction, msg, embed) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = await msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'confirm':
                    await interaction.followUp("Doing gacha.")
                    await gacha(interaction, embed);
                    break;

                case 'cancel':
                    await interaction.followUp("Gacha cancelled.")
                    break;
            };
            
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}
/**
 * while amount is not reached
 * do rarity gacha.
 * if set rarity is not gotten, burn it and add it to counter.
 * don't do inventory check, but instead start from the last card. (but this means we have to find the last card)
 * View amethyst+ and only compute character pool calculations for amethyst+. mmm yeah might apply this change to all gacha.
 * makes it billion times faster. buff normal gacha's trash pool to 40% wl? or maybe 35%.
 * 
 * 
 * embed content
 * 
 */


module.exports = {
	data: new SlashCommandBuilder()
		.setName('gultimate')
		.setDescription('does gacha for set amount of times while auto burning equal and below selected rarity.')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('number of gacha you want to do.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('rarity')
                .setDescription('Character ID.')
                .setRequired(false)
                .addChoice('no', 1)
                .addChoice('jade', 3)
                .addChoice('amethyst', 4))
        .addBooleanOption(option => 
            option.setName('endping')
                .setDescription('set true to ping when gacha is finished.')
                .setRequired(false)),
	async execute(interaction) {
        try {
            let amount = interaction.options.getInteger('amount');
            const user = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: user}});
            if(player) {
                if (amount > 1000) {
                    return interaction.reply("1000 Gacha is the maximum limit.");
                }
                if (player.gems >= 100*amount){
                    await confirmGacha(interaction);
                    
                } else {
                    //not enough gems embed.
                    const embedE = await embedError(interaction);
                    (embedE).setDescription(`You need ${amount * 100} gems to gacha.\nDo dailies, add new series, characters or send images to gain more gems`)
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