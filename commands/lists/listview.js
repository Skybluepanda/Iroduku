const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("List Viewing")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`0 cards found in the list.`)
        .setColor(color.successgreen)
    
    return embed;
}


async function deployButton(interaction, embed){
    const taglist = await database.Listtags.findOne({where: {playerID:interaction.user.id}});
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setLabel('◀️')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('lock')
                .setLabel('🔒')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('unlock')
                .setLabel('🔑')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('removetag')
                .setLabel('untag')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('▶️')
                .setStyle('PRIMARY'),
        );
    const row2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`tag1`)
                .setLabel(`tag1`)
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(`tag2`)
                .setLabel(`tag2`)
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(`tag3`)
                .setLabel(`tag3`)
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(`tag4`)
                .setLabel(`tag4`)
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId(`tag5`)
                .setLabel(`tag5`)
                .setStyle('SUCCESS'),
        );
    return await interaction.editReply({embeds: [embed], components: [row, row2]});
}

//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA

async function viewWhiteCard(cardlink, interaction) {
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let imgID = await card.imageID;
    let imgNumber = await card.imageNumber;
    let image;
    if (imgID) {
        image = await database.Image.findOne({ where: { imageID: imgID}});
    } else if (imgNumber) {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: card.imageNumber}})
    } else {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: 1}})
    }
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    //card is a card object
    //cid, inventory id, rarity , tag, image number, image id, quantity. createdAt.
    if (image) {
        embedCard.setImage(image.imageURL)
            .setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(image.imageURL)
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID: **${cid}
**Series: **${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Quartz**
**Quantity:** ${card.quantity}`)
        .setColor(color.white);
    return embedCard;
}

async function viewGreenCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let imgID = await card.imageID;
    let imgNumber = await card.imageNumber;
    let image;
    if (imgID) {
        image = await database.Image.findOne({ where: { imageID: imgID}});
    } else if (imgNumber) {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: card.imageNumber}})
    } else {
        image = await database.Image.findOne({ where: { characterID: cid, imageNumber: 1}})
    }

    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    //card is a card object
    //cid, inventory id, rarity , tag, image number, image id, quantity. createdAt.
    if (image) {
        embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`)
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
    }
    embedCard.setTitle(`${char.characterName} ${card.tag}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity:** Jade
**Quantity:** ${card.quantity}`)
        .setColor(color.green);
    return embedCard;
}

async function viewBlueCard(cardlink, interaction) {
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}}); 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
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
        image = await database.Gif.findOne({where: {characterID: cid, gifNumber: -(card.imageNumber)}});
        if (image){
            url = await image.gifURL;
            embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    }

    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity:** Lapis
**Quantity:** ${card.quantity}`)
        .setColor(color.blue);
    return embedCard;
}

async function viewPurpleCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
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
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity:** Amethyst
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.purple);
    return embedCard;
}

async function viewRedCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
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
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Ruby**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.red);
    return embedCard;
}

async function viewDiaCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
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
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond);
    return embedCard;
}

async function viewPinkCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
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
    if (card.lock) {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
        } else {
            embedCard.setTitle(`${char.characterName} | :lock:`);
        }
    } else {
        if (card.tag) {
            embedCard.setTitle(`${char.characterName} ${card.tag} `);
        } else {
            embedCard.setTitle(`${char.characterName}`);
        }
    }
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Pink Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.pink);
    return embedCard;
}

async function viewAzurCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
    const Azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${Azurite.artist}
*Upload your choice of image of the character using with /stellarupload*`).setImage(Azurite.imageURL);
if (card.lock) {
    if (card.tag) {
        embedCard.setTitle(`${char.characterName} ${card.tag} | :lock:`);
    } else {
        embedCard.setTitle(`${char.characterName} | :lock:`);
    }
} else {
    if (card.tag) {
        embedCard.setTitle(`${char.characterName} ${card.tag} `);
    } else {
        embedCard.setTitle(`${char.characterName}`);
    }
}
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${card.characterID}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Stellarite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.stellar);
    return embedCard;
}


async function viewSpeCard(cardlink, interaction) { 
    const card = await database.Card.findOne({where: {cardID: cardlink.cardID}});
    const special = await database.Special.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${special.artist}
*edit card with /spedit*`).setImage(special.imageURL);
if (card.lock) {
    if (card.tag) {
        embedCard.setTitle(`${special.characterName} ${card.tag} | :lock:`);
    } else {
        embedCard.setTitle(`${special.characterName} | :lock:`);
    }
} else {
    if (card.tag) {
        embedCard.setTitle(`${special.characterName} ${card.tag} `);
    } else {
        embedCard.setTitle(`${special.characterName}`);
    }
}
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID}
**Series:** ${special.seriesName}
**Rank: **1!
**Rarity: Special**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(special.color);
    return embedCard;
}

async function switchRarity(card, rarity, interaction) {
    switch (rarity) {
        case 1:
            return viewWhiteCard(card, interaction);
            //white
        case 2:
            return viewGreenCard(card, interaction);
            //green
        case 3:
            return viewBlueCard(card, interaction);
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
            return viewSpeCard(card, interaction);
        default:
            return "error";
    }
}

//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA
//VIEW AREA


async function countCards(cardList, cardNumber, change) {
    const maxIndex = cardList.length;
    const destination = cardNumber + change;
    if(destination == -1) {
        return maxIndex-1;
    } else if(destination == maxIndex) {
        return 0;
    } else {
        return destination;
    }
}

async function buttonManager(interaction, cardList, cardNumber, msg) {
    try {
        const uid = interaction.user.id;
        const filter = i => i.user.id === interaction.user.id;
        const taglist = await database.Listtags.findOne({where: {playerID:uid}});
        const cardTarget = await database.Card.findOne({where: {cardID: cardList[cardNumber].cardID}});
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const target1 = await countCards(cardList, cardNumber, -1);
                    await viewListCard(interaction, cardList, target1);
                    break;
                
                case 'next':
                    const target2 = await countCards(cardList, cardNumber, 1);
                    await viewListCard(interaction, cardList, target2);
                    break;
                
                case 'lock':
                    await cardTarget.update({lock: 1});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;
                
                case 'unlock':
                    await cardTarget.update({lock: 0});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;
                    
                case 'removetag':
                    await cardTarget.update({tag: null});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;

                case 'tag1':
                    await cardTarget.update({tag: taglist.tag1});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;

                case 'tag2':
                    await cardTarget.update({tag: taglist.tag2});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;

                case 'tag3':
                    await cardTarget.update({tag: taglist.tag3});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;

                case 'tag4':
                    await cardTarget.update({tag: taglist.tag4});
                    await viewListCard(interaction, cardList, cardNumber);
                    break;

                case 'tag5':
                    await cardTarget.update({tag: taglist.tag5});
                    await viewListCard(interaction, cardList, cardNumber);
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

async function viewListCard(interaction, cardList, cardNumber) {
    const cardTarget = await database.Card.findOne({where: {cardID: cardList[cardNumber].cardID}});
    const cardEmbed = await switchRarity(cardList[cardNumber], cardTarget.rarity, interaction);
    const msg = await deployButton(interaction, cardEmbed);
    await buttonManager(interaction, cardList, cardNumber, msg);
}

async function listSwitch(interaction, embed){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "cname":
            cnameList(interaction, embed);
            break;
        
        case "cid":
            cidList(interaction, embed);
            break;

        case "sname":
            snameList(interaction, embed);
            break;

        case "sid":
            sidList(interaction, embed);
            break;

        case "base":
            justList(interaction, embed);
            break;

        case "wishlist":
            wishList(interaction, embed);
            break;

        case "untagged":
            untagList(interaction, embed);
            break;

        case "locked":
            lockList(interaction, embed);
            break;
    }
}



async function order(interaction) {
    const order = interaction.options.getInteger("order");
    switch (order){
        case 1:
            return ['rarity','DESC'];
        case 2:
            return ['inventoryID','DESC'];
        case 3:
            return ['createdAt','DESC'];
        case 4:
            return ['createdAt','ASC'];
        case 5:
            return ['characterID', 'ASC']
        default:
            return ['inventoryID','ASC']
    }
}

async function cnameList(interaction, embed){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    
    const cname = await interaction.options.getString('name');
    const charList = await database.Character.findAll(
        {
            where: {
                characterName: {[Op.like]: '%' + cname + '%'}
            }
        }
    );
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else if(rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }

    //cardlist is the list of cards that we can view!
    //view card, set buttons, use the list of cards somehow
    await viewListCard(interaction, cardList, 1);
}

async function cidList(interaction, embed){
    const uid = await interaction.user.id;
    const cid = await interaction.options.getInteger('id');
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction);
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: cid
            }}
        );
    } else if (rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: cid
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: tag,
                playerID: uid,
                characterID: cid
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
                characterID: cid
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}

async function snameList(interaction, embed) {
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    const sname = await interaction.options.getString('sname');
    const seriesList = await database.Series.findAll({
        where: {
            seriesName: {[Op.like]: '%' + sname + '%'},
        }}
            );
    var sidList = [];
    for (let i = 0; i < seriesList.length; i++) {
        const sid = seriesList[i].seriesID;
        sidList[i] = sid;
    }
    const charList = await database.Character.findAll({
        where: {
            seriesID: {[Op.or]: sidList}
        }}
    );
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    if (!cidList[0]) {
        return interaction.channel.send("No results found for sname used.")
    }
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else if (rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                characterID: {[Op.or]: cidList},
                rarity: rarity,
                playerID: uid,
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}

async function sidList(interaction, embed) {
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    const sid = await interaction.options.getInteger('sid');
    const charList = await database.Character.findAll(
        {where: {
            seriesID: sid
        }}
    );
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else if (rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}

async function wishList(interaction, embed){
    const uid = await interaction.user.id;
    const user = await interaction.options.getUser("user");
    const player = await database.Player.findOne({where: {playerID: user.id}});
    let wishlist;
    let wishid = [];
    if (player) {
        wishlist = await database.Wishlist.findAll({where: {playerID: user.id}});
        if (!wishlist) {
            return await interaction.followUp(`User ${user.username}'s wishlist is empty.`);
        } else {
            for (let i = 0; i < wishlist.length; i++) {
                wishid[i] = wishlist[i].characterID;
            }
        }
    } else {
        return await interaction.followUp(`User ${user.username} is not a player yet!`);
    }
    
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    let cardList;

    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
    } else if (rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}
async function justList(interaction, embed){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
            }}
        );
    } else if (rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                playerID: uid,
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: tag,
                playerID: uid,
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}

async function untagList(interaction, embed){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    const orderOpt = await order(interaction)
    let cardList;
    if (rarity) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                tag: null,
                playerID: uid,
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: null,
                playerID: uid,
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}

async function lockList(interaction, embed){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                lock: 1,
                tag: tag,
                playerID: uid,
            }}
        );
    } else if (rarity && !tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                rarity: rarity,
                lock: 1,
                playerID: uid,
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                tag: tag,
                lock: 1,
                playerID: uid,
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                where: {
                playerID: uid,
                lock: 1,
            }}
        );
    }
    if (cardList.length == 0) {
        embed.setDescription("Your query has 0 cards after the filter.")
        return interaction.editReply({embeds: [embed]});
    }
    await viewListCard(interaction, cardList, 1);
}

/**
 * cname
 * cid
 * sname
 * sid
 * rarity choice
 * tags
 * 
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('lview')
		.setDescription('view that allows navigation, lock, and tagging.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("cname")
                .setDescription("Searches for a character with the name and lists your cards.")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name you want find")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("cid")
                .setDescription("Lists cards for character")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the character")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("sname")
                .setDescription("Searches for a series with the name and lists your cards.")
                .addStringOption(option => 
                    option
                        .setName("sname")
                        .setDescription("The series you want find")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("sid")
                .setDescription("Lists your cards in series")
                .addIntegerOption(option => 
                    option
                        .setName("sid")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("wishlist")
                .setDescription("Lists characters in wishlist of a user")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("The User for the wishlisting")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("base")
                .setDescription("Lists cards")
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("untagged")
                .setDescription("Lists cards")
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("locked")
                .setDescription("Lists locked cards")
                .addIntegerOption(option => 
                    option
                        .setName("rarity")
                        .setDescription("Filters cards with certain rarity")
                        .setRequired(false)
                        .addChoice('quartz',1)
                        .addChoice('jade',2)
                        .addChoice('lapis',3)
                        .addChoice('amethyst',4)
                        .addChoice('ruby',5)
                        .addChoice('diamond',6)
                        .addChoice('pink_diamond',7)
                        .addChoice('stellarite',9)
                        .addChoice('special',10)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Filter cards by tag")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("order")
                        .setDescription("Order cards to a standard")
                        .setRequired(false)
                        .addChoice('rarity',1)
                        .addChoice('reverse',2)
                        .addChoice('newest',3)
                        .addChoice('oldest',4)
                        .addChoice('cid',5)
                        )),
	async execute(interaction) {
        const uid = await interaction.user.id;
        const taglist = await database.Listtags.findOne({where: {playerID:uid}});
        const embed = embedSucess(interaction);
        const embed2 = new MessageEmbed();
        
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            
            
            
            if (taglist) {
                embed2.setTitle("Your Tag Cheatsheet")
                .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
                .setDescription(taglist.tag1 + " " + taglist.tag2 + " " + taglist.tag3 + " " + taglist.tag4 + " " + taglist.tag5).setColor(color.successgreen);
                await interaction.reply({embeds: [embed]});
                await interaction.followUp({embeds: [embed2]});
                await listSwitch(interaction, embed);
            } else {
                return interaction.reply("Please set your taglist using command /lvtedit!");
            }
            
        } catch (error) {
            return interaction.send("Error has occured");
        }
	},
};