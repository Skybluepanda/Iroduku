const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

async function viewWhiteCard(card, interaction) { 
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

    //card is a card object
    //cid, inventory id, rarity , tag, image number, image id, quantity. createdAt.
    if (image) {
        embedCard.setImage(image.imageURL)
            .setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(image.imageURL)
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
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
**LID:** ${card.inventoryID} | **CID: **${cid}
**Series: **${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Quartz**
**Quantity:** ${card.quantity}`)
        .setColor(color.white);
    return await interaction.reply({embeds: [embedCard]});
}

async function viewGreenCard(card, interaction) { 
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

    //card is a card object
    //cid, inventory id, rarity , tag, image number, image id, quantity. createdAt.
    if (image) {
        embedCard.setImage(image.imageURL)
            .setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`)
    } else {
        embedCard.addField("no image 1 found", "Send an official image 1 for this character. Green cards can't be gifs.");
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
**Rarity:** Jade
**Quantity:** ${card.quantity}`)
        .setColor(color.green);
    return await interaction.reply({embeds: [embedCard]});
}

async function viewBlueCard(card, interaction) { 
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
        console.log(-(card.imageNumber));
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
    

    return await interaction.reply({embeds: [embedCard]});
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
    return await interaction.reply({embeds: [embedCard]});
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
    return await interaction.reply({embeds: [embedCard]});
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
    return await interaction.reply({embeds: [embedCard]});
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
    return await interaction.reply({embeds: [embedCard]});
}

async function viewAzurCard(card, interaction) { 
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
    if (Azurite.season == 2) {
        await interaction.reply(`||${Azurite.imageURL}||`)
        return await interaction.editReply({embeds: [embedCard]});
    } else {
        return await interaction.reply({embeds: [embedCard]});
    }
}


async function viewSpeCard(card, interaction) { 
    const special = await database.Special.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    embedCard.setFooter(`Art by ${special.artist}
*edit card with /spedit*`).setImage(special.imageURL)
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
    return await interaction.reply({embeds: [embedCard]});
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
            //wtf?
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('view')
		.setDescription('views a card')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The list id for the card you want to view")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const user = await interaction.user.id
            const lid = await interaction.options.getInteger('lid');
            const card = await database.Card.findOne({where: {playerID: user, inventoryID: lid}});
            if (card) {
                switchRarity(card, card.rarity, interaction);
            } else {
                interaction.reply("Error Invalid list ID");
            }
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}