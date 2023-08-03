const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Char Search")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Character Not Found. It's possible that the character doesn't exist in the database.")
        .setColor(color.failred);
    
    return embed;
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel('prev')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('setimg')
                    .setLabel('setimg')
                    .setStyle('SUCCESS')
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}


async function countImage(cid) {
    try {
        console.log('31')
        const char = await database.Character.findOne({where: {characterID: cid}});
        return await (char.imageCount);
    } catch(error) {
        console.log("Error has occured in countImageg");
    }
}

async function countGif(cid) {
    try {
        console.log('30')
        const char = await database.Character.findOne({where: {characterID: cid}});
        return await (char.gifCount);
    } catch(error) {
        console.log("Error has occured in countImageg");
    }
}

async function checkInumber(embed, interaction, msg,  direction, currentImage, totalImage, imageC, cid, row){
    try {
        console.log('28')
        if (currentImage == 1 && direction == -1){
            currentImage = totalImage;
            //going to end of page. If there is a gif view gif, else view image.
        } else if (currentImage == totalImage && direction == 1){
            currentImage = 1;
        } else {
            currentImage += direction;
        }
        await currentImage;
        if (currentImage <= imageC) {
            await viewImage(embed, interaction, currentImage, cid);
        } else {
            const image = currentImage - imageC;
            await viewGif(embed, interaction, image, cid);
        }
        console.log('29')
        await updateEmbed(embed, interaction);
        await buttonManager(embed, interaction, msg, currentImage, totalImage, imageC, cid, row);
    } catch(error) {
        console.log("Error has occured in checkInumber");
    }
}

async function setImg(interaction, currentImage, imageC, cid) {
    console.log('23')
    const uid = interaction.user.id;
    const lid = interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {inventoryID: lid, playerID: uid }});
    let imageSetID;
    let imageNum;
    console.log('24')
    if (currentImage <= imageC) {
        console.log('25')
        const image = await database.Image.findOne({where: {characterID: cid, imageNumber: currentImage}});
        imageSetID = image.imageID;
        imageNum = currentImage;
    } else {
        console.log('26')
        const image = await database.Gif.findOne({where: {characterID: cid, gifNumber: currentImage-imageC}});
        imageSetID = image.gifID;
        imageNum = currentImage-imageC;
    }
    console.log('27')
    await card.update({imageNumber: imageNum, imageID:imageSetID}, {where: {inventoryID:lid, playerID:uid}});
    return await interaction.followUp("Card Image Set!");    
}

async function buttonManager(embed, interaction, msg, currentImage, totalImage, imageC, cid, row) {
    try {
        console.log('19')
        console.log('button manager ready.');
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'prev':
                    console.log('20')
                    await checkInumber(embed, interaction, msg, -1, currentImage, totalImage, imageC, cid, row);
                    break;
                
                case 'next':
                    console.log('21')
                    await checkInumber(embed, interaction, msg,  1, currentImage, totalImage, imageC, cid, row);
                    break;
                
                case 'setimg':
                    console.log('22')
                    i.deferUpdate();
                    await setImg(interaction, currentImage, imageC, cid);
                    break;
            };
        }
        );

    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function viewImage(embed, interaction, imageNumber, cid) {
    try {
        console.log('17')
        var art = await database.Image.findOne({
            offset: imageNumber-1, 
            order: [['imageNumber', 'ASC']],
            where: {
                characterID: cid,}
            })
        const url = art.imageURL;
        const artist = art.artist;
        const uploader = art.uploader;
        const footer = `
        #${art.imageNumber} Art by ${artist} | Uploaded by ${uploader}\nImage ID is ${art.imageID} report any errors using ID.
        `;
        console.log('18')
        await embed
            .setImage(url)
            .setFooter({text: `${footer}`})
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function viewGif(embed, interaction, gifNumber, cid) {
    try {
        console.log('14')
        var art = await database.Gif.findOne({
            offset: gifNumber-1, 
            order: [['gifNumber', 'ASC']],
            where: {
                characterID: cid,}
            })
        const url = art.gifURL;
        const artist = art.artist;
        const uploader = art.uploader;
        const footer = `
        #${art.gifNumber} Gif from ${artist} | Uploaded by ${uploader}
Gif ID is ${art.gifID} report any errors using ID.
        `;
        console.log('15')
        await embed
            .setImage(url)
            .setFooter({text: `${footer}`})
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function updateEmbed(embed, interaction){
    console.log('13')
    await interaction.editReply({ embeds:[embed], fetchReply: true});
}

async function viewDiaCard(interaction) { 
    console.log('11')
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const lid = await interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {playerID: player, inventoryID: lid}});
    const cid = await card.characterID;
    const imageC = await countImage(cid);
    const gifC = await countGif(cid);
    const totalImage = imageC + gifC;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    console.log(11.1);
    let image;
    let url;
    if (card.imageID > 0) {
        console.log(11.2);
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
        console.log(11.3);
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
        console.log(11.4);
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
    console.log(11.5);
    embedCard.setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rank: **${char.rank}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}`)
        .setColor(color.diamond);
        console.log('12')
    const row = await createButton();
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, 1, totalImage, imageC, cid, row, false);
}

async function viewPinkCard(interaction) {
    console.log('9')
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const lid = await interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {playerID: player, inventoryID: lid}});
    const cid = await card.characterID;
    const imageC = await countImage(cid);
    const gifC = await countGif(cid);
    const totalImage = imageC + gifC;
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
        console.log('10')
    const row = await createButton();
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager(embedCard, interaction, msg, 1, totalImage, imageC, cid, row, false);
}

async function raritySwitch(interaction) {
    console.log('2')
    const lid = await interaction.options.getInteger('lid');
    const uid = await interaction.user.id;
    const card = await database.Card.findOne({where: {inventoryID: lid, playerID: uid }});
    console.log('3')
    if(card) {
        console.log('4')
        if(card.rarity == 6) {
            //dia
            console.log('5')
            await viewDiaCard(interaction);
        } else if (card.rarity == 7) {
            console.log('6')
            await viewPinkCard(interaction);
            //pink dia
        } else {
            console.log('7')
            return interaction.reply(`Card ${lid} is not a diamond card.`)
        }
    } else {
        console.log('8')
        return interaction.reply("Invalid inventory ID.")
    }

}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('diaset')
		.setDescription('Set image for diamond cards.')
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The inventory id of the diamond card.")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            console.log('1')
            await raritySwitch(interaction);
        } catch(error) {
            await  interaction.channel.send("Error has occured while performing the command.")
            console.log(error);
        }        
    }
}