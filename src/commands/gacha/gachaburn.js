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
    const inventory = await inventorycheck(user);
    const dupe = await database.Card.findOne({where: {playerID: user, characterID: cid, rarity: 1}});
    if (dupe) {
        dupe.increment({quantity: 1});
        const char = await database.Character.findOne({where: {characterID: cid}});
    } else {
        const newcard = await database.Card.create({
            playerID: user,
            characterID: cid,
            inventoryID: inventory,
            quantity: 1,
            rarity: 1,
        });
        const char = await database.Character.findOne({where: {characterID: cid}});
    }
}


//Green card zone
//Green card zone
//Green card zone

async function createGreenCard(cid, interaction) {
    const uid = await interaction.user.id;
    const inventory = await inventorycheck(uid);
    const dupe = await database.Card.findOne({where: {playerID: uid, characterID: cid, rarity: 2}});
    if (dupe) {
        dupe.increment({quantity: 1});
        const char = await database.Character.findOne({where: {characterID: cid}});
    } else {
        const newcard = await database.Card.create({
            playerID: uid,
            characterID: cid,
            inventoryID: inventory,
            quantity: 1,
            rarity: 2,
        });
        const char = await database.Character.findOne({where: {characterID: cid}});
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
    let channel = interaction.guild.channels.cache.get('948507565577367563');
    channel.send(`A luck sack got a Ruby ${cid} | ${char.characterName}!`);
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
    let channel = interaction.guild.channels.cache.get('948507565577367563');
    channel.send(`An extra lucky luck sack got a Diamond ${cid} | ${char.characterName}!`);
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
        image = await database.Gif.findOne({where: {characterID: cid, gifID: card.imageID}});
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


async function rarityCreate(cid, rarity, interaction) {
    switch (rarity) {
        case 1:
            await createWhiteCard(cid, interaction);
            break;

        case 2:
            await createGreenCard(cid, interaction);
            break;
            
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
        
        default:
            break;
    }
}

async function rarityBurn(interaction, rarity) {
    switch (rarity) {
        case 1:
            await database.Player.increment({gems: 1, money: 10}, {where: {playerID: interaction.user.id}});
            return [10,1];

        case 2:
            await database.Player.increment({gems: 5, money: 20}, {where: {playerID: interaction.user.id}});
            return [20,5];
            
        case 3:
            await database.Player.increment({gems: 10, money: 50}, {where: {playerID: interaction.user.id}});
            return [50,10];

        case 4:
            await database.Player.increment({gems: 10, money: 200}, {where: {playerID: interaction.user.id}});
            return [200,10];
    }

}

async function wlPool(interaction, rarity) {
    const user = interaction.user.id;
    const wlist = await database.Wishlist.findAll({where: {playerID: user}});
    const rngChar = Math.floor(Math.random() * 1000);
    const char = (rngChar%wlist.length);
    const cid = await wlist[char].characterID;
    return await rarityCreate(cid, rarity, interaction);
}

async function mainPool(interaction, rarity) {
    const rngChar = Math.floor(Math.random() * 10000);
    const offset = (rngChar%100);
    const char = await database.Character.findOne({offset: offset, where: {rank: 1}});
    const cid = await char.characterID;
    return await rarityCreate(cid, rarity, interaction);
}

async function sidePool(interaction, rarity) {
    const sideChar = await database.Character.count({where: {rank: 2}});
    const rngChar = Math.floor(Math.random() * 10000);
    const offset = (rngChar%sideChar);
    const char = await database.Character.findOne({offset: offset, where: {rank: 2}});
    const cid = await char.characterID;
    return await rarityCreate(cid, rarity, interaction);
}

async function allPool(interaction, rarity) {
    const totalChar = await database.Character.count();
    const rngChar = Math.floor(Math.random() * 100000);
    const cid = (rngChar%totalChar)+1;
    return await rarityCreate(cid, rarity, interaction);
}




async function sideofftrashoff(interaction, rarity) {
    const rngPool = Math.floor(Math.random() * 100);
    if (rngPool >= 95) {
        await wlPool(interaction, rarity);
    } else if (rngPool >= 38) {
        await mainPool(interaction, rarity);
    } else {
        await sidePool(interaction, rarity);
    }
    
    
}
async function sideontrashoff(interaction, rarity) {
    const rngPool = Math.floor(Math.random() * 100);
    if (rngPool >= 90) {
        await wlPool(interaction, rarity);
    } else if (rngPool >= 45) {
        await mainPool(interaction, rarity);
    } else {
        await sidePool(interaction, rarity);
    }
}
async function sideontrashon(interaction, rarity) {
    const rngPool = Math.floor(Math.random() * 100);
    if (rngPool >= 85) {
        await wlPool(interaction, rarity);
    } else {
        await allPool(interaction, rarity);
    }
    
}

async function poolswitch(interaction, rarity) {
    const user = interaction.user.id;
    const sideson = await database.Sideson.findOne({where: {playerID: user}});
    const trashon = await database.Trashon.findOne({where: {playerID: user}});
    if (!sideson && !trashon) {
        return await sideofftrashoff(interaction, rarity);
    } else if (sideson && !trashon){
        return await sideontrashoff(interaction, rarity);
    } else {
        return await sideontrashon(interaction, rarity);
    }
}
//side off trash off 10%wl, 60%tops, 30% sides
//sides on trash off 20%wl, 40%tops, 40%sides
//sides on trash on  30%wl, 70% normal.
async function raritySwitch(interaction) {
    const rngRarity = Math.floor(Math.random() * 10000);
    const user = interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: user}});
    await player.increment({gems: -10});
    const pity = Math.floor(player.pity/4);
    if ((rngRarity) >= 9992) {
        await player.increment({pity: 1});
        return 6;
    } else if (rngRarity + pity >= 9922) {
        if (player.pity < 400) {
            await player.update({pity: 0});
        } else {
            await player.increment({pity: -400});
        }
        return 5;
    } else if (rngRarity >= 9592) {
        await player.increment({pity: 1});
        return 4;
    } else if (rngRarity >= 8092) {
        await player.increment({pity: 1});
        return 3;
    } else if (rngRarity >= 6000) {
        await player.increment({pity: 1});
        return 2;
    } else {
        await player.increment({pity: 1});
        return 1;
    }
}





async function gacha(interaction, embed) {
    const amount = interaction.options.getInteger('amount');
    const setRarity = interaction.options.getInteger('rarity');
    const rarityName = await returnRarityName(setRarity);
    const burnArray = [0,0,0,0,0];
    const gachaArray = [0,0,0,0,0,0,0];
    const burnRewards = [0,0];//coin, gems
    embed.setTitle('Processing Gacha');
    for (let i = 0; i < amount; i++) {
        const rarity = await raritySwitch(interaction);
        if (rarity > setRarity) {
            //roll character
            await poolswitch(interaction, rarity)
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
**Quartz:** ${gachaArray[1]}
**Jade:** ${gachaArray[2]}
**Lapis:** ${gachaArray[3]}
**Amethyst:** ${gachaArray[4]}
**Ruby:** ${gachaArray[5]}
**Diamond:** ${gachaArray[6]}


**Burn Stats**
**Quartz:** ${burnArray[1]}
**Jade:** ${burnArray[2]}
**Lapis:** ${burnArray[3]}
**Amethyst:** ${burnArray[4]}
**Coins:** ${burnRewards[0]}
**Gems:** ${burnRewards[1]}`)
        await interaction.editReply({embeds: [embed]});
    }
    await interaction.followUp("End of gacha.");
}

async function returnRarityName(rarity) {
    switch(rarity) {
        case 0:
            return 'no'
        case 1:
            return 'all quartz';
        case 2:
            return `all jade`;
        case 3:
            return `all lapis`;
        case 4:
            return `all amethyst`;
    }
}

async function confirmGacha(interaction) {
    const amount = interaction.options.getInteger('amount');
    const setRarity = interaction.options.getInteger('rarity');
    const embed = await embedSucess(interaction);
    const rarityName = await returnRarityName(setRarity);
    embed.setTitle('Confirm Gacha?')
    embed.setDescription(`You are spending ${amount*10} gems for ${amount} gachas
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
        const collector = await msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
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
                .setDescription('amount')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('rarity')
                .setDescription('Character ID.')
                .setRequired(true)
                .addChoice('none', 0)
                .addChoice('quartz', 1)
                .addChoice('jade', 2)
                .addChoice('lapis', 3)
                .addChoice('amethyst', 4)),
	async execute(interaction) {
        try {
            const amount = interaction.options.getInteger('amount');
            const user = interaction.user.id;
            const player = await database.Player.findOne({where: {playerID: user}});
            if(player) {
                if (player.gems >= 10*amount){
                    const inventory = await database.Card.count({where: {playerID: user}});
                    if (inventory > 1000) {
                        return interaction.reply("you have more than 1000 cards. Burn some before doing more gacha.")
                    }
                    const wlist = await database.Wishlist.count({where: {playerID: user}})
                    if (wlist >= 5) {
                        await confirmGacha(interaction);
                    }else {
                        const embedE = await embedError(interaction);
                        (embedE).setDescription("You need 5 or more waifus in wishlist to use gacha. use /wa to add to your wishlist!")
                        return await interaction.reply({embeds: [embedE]});
                    }
                    
                } else {
                    //not enough gems embed.
                    const embedE = await embedError(interaction);
                    (embedE).setDescription(`You need ${amount * 10} gems to gacha.\nDo dailies, add new series, characters or send images to gain more gems`)
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