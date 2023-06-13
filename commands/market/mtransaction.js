const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, IntegrationApplication } = require('discord.js');
const { Op } = require("sequelize");
var dayjs = require('dayjs')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()


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

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('buy')
                    .setLabel('buy')
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


async function buttonManager3(interaction, msg, coins) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = await msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'buy':
                    await interaction.followUp("Processing...");
                    const mid = '903935562208141323'
                    const uid = await interaction.user.id;
                    const buyer = await database.Player.findOne({where: {playerID: uid}});
                    if (buyer.money < coins) {
                        return interaction.channel.send(`${interaction.user} doesn't have enough money.`)
                    }
                    const lid = await interaction.options.getString('lid');
                    const newlid = await inventorycheck(uid);
                    await database.Card.update(
                        {
                            playerID: uid, inventoryID: newlid, tag: null, charred: true,
                        },
                        {
                            where: {playerID: '903935562208141323', inventoryID: lid}
                        }
                    )
                    
                    await database.Player.increment({money: -coins}, {where: {playerID: uid}});
                    await interaction.followUp(`Card ${lid} purchased from market for ${coins} coins.
The card id is ${newlid} in your inventory.`)
                    break;
                
                case 'cancel':
                    await interaction.followUp("Purchase Cancelled")
                    break;
            };
            
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function buttonManager4(interaction, msg, coins, lidarray) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = await msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            i.deferUpdate();
            switch (i.customId){
                case 'buy':
                    await interaction.followUp("Processing...");
                    const mid = '903935562208141323'
                    const uid = await interaction.user.id;
                    const buyer = await database.Player.findOne({where: {playerID: uid}});
                    if (buyer.money < coins) {
                        return interaction.channel.send(`${interaction.user} doesn't have enough money.`)
                    }
                    for(let i = 0; i < lidarray.length;i++) {
                        const newlid = await inventorycheck(uid);
                        await database.Card.update(
                            {
                                playerID: uid, inventoryID: newlid, tag: null, charred: true,
                            },
                            {
                                where: {playerID: '903935562208141323', inventoryID: lidarray[i].inventoryID}
                            }
                        )
                    }              
                    await database.Player.increment({money: -coins}, {where: {playerID: uid}});
                    await interaction.followUp(`Cards purchased from market for ${coins} coins.`)
                    break;
                
                case 'cancel':
                    await interaction.followUp("Purchase Cancelled")
                    break;
            };
            
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function viewRedCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
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
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            image = database.Image.findOne({where: {imageID: 1}})
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
        url = await image.gifURL;
        embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
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
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 20000

**Your Balance**
**Money:** ${player.money}`)
        .setColor(color.red);
    const row = await createButton();
    
    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 20000);
}

async function viewDiaCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
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
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 200000

**Your Balance**
**Money:** ${player.money}`)
        .setColor(color.diamond);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 200000);
}

async function viewPinkCard(card, interaction) { 
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
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
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Pink Diamond**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 20000

**Your Balance**
**Money:** ${player.money}
`)
        .setColor(color.pink);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 20000);
}

async function viewStellarCard(card, interaction) { 
    const Azurite = await database.Azurite.findOne({where: {cardID: card.cardID}});
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const uid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: uid}});
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    let image;
    let url;
    
    embedCard.setTitle(`${char.characterName}`)
        .setFooter(`Art by ${Azurite.artist}
*Upload your choice of image of the character using with /stellarupload*`).setImage(Azurite.imageURL)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity: Stellarite**
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

**Cost**
**Money:** 2,000,000

**Your Balance**
**Money:** ${player.money}
`)
        .setColor(color.stellar);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
    await buttonManager3(interaction, msg, 2000000);
}

async function switchRarity(card, rarity, interaction) {
    switch (rarity) {
        case 5:
            return viewRedCard(card, interaction);
        //red
        case 6:
            return viewDiaCard(card, interaction);

        case 7:
            return viewPinkCard(card, interaction);

        case 9:
            return viewStellarCard(card, interaction);

        default:
            return "error";
            //wtf?
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
    
    if (tag) {
        const cardString = `:red_square:` + ID + ` | ${tag}` + charname + ` (#${inumber})`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:red_square:` + ID + ` | ` + charname + `(#${inumber})`;
        console.log(cardString);
        return cardString
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
    
    if (tag) {
        const cardString = `:large_blue_diamond:` + ID + ` | ${tag}` + charname + ` (#${inumber})`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:large_blue_diamond:` + ID + ` | ` + charname + `(#${inumber})`;
        console.log(cardString);
        return cardString
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
    
    if (tag) {
        const cardString = `:diamonds:` + ID + ` | ${tag}` + charname + ` (#${inumber})`;
        console.log(cardString);
        return cardString;
    } else {
        const cardString = `:diamonds:` + ID + ` | ` + charname + `(#${inumber})`;
        console.log(cardString);
        return cardString;
    }
}

async function stellarcard(card) {
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
    
    if (tag) {
        const cardString = `:diamond_shape_with_a_dot_inside:` + ID + ` | ${tag}` + charname;
        console.log(cardString);
        return cardString;
    } else {
        const cardString = `:diamond_shape_with_a_dot_inside:` + ID + ` | ` + charname;
        console.log(cardString);
        return cardString;
    }
}

async function switchListRarity(card, rarity) {
    switch (rarity) {
        case 5:
            return redcard(card);
            //red
        case 6:
            return diacard(card);

        case 7:
            return pinkcard(card);

        case 9:
            return stellarcard(card);

        default:
            return "error";
            //wtf?
    }
}

async function makeList(list) {
    const listRef = [];
    for (let i = 0;i < list.length; i++) {
        //ID|Rarity ImageNumber Name Quantity if white, green or blue and there's more than 1.
        const rarity = await list[i].rarity;
        const cardString = await switchListRarity(list[i], rarity);
        listRef[i] = cardString;
    }
    return listRef;
}

async function switchPrice(rarity) {
    switch (rarity) {
        case 5:
            return 20000;
        //red
        case 6:
            return 200000;

        case 7:
            return 20000;

        case 9:
            return 2000000;

        default:
            return "error";
            //wtf?
    }
}

async function justList(interaction, lidarray){
    const pid = await interaction.user.id;
    const player = await database.Player.findOne({where: {playerID: pid}});
    const mid = '903935562208141323';
    let cardList = [];
    let totalCost = 0;
    for(let i = 0; i < lidarray.length; i++) {
        const card = await database.Card.findOne({where: {playerID: mid, inventoryID: lidarray[i]}});
        console.log(card.rarity);
        const cost = await switchPrice(card.rarity);
        console.log(cost);
        totalCost += cost;
        console.log(totalCost)
        if (card) {
            cardList.push(card);
        }
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    const embed = new MessageEmbed();
    await embed.setTitle("Your Cart")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`
**Your Cart**
${fullList}

**Cost**
**Money:** ${totalCost}

**Your Balance**
**Money:** ${player.money}`)
        .setColor(color.successgreen);
    const row = await createButton();

    msg = await interaction.reply( {embeds: [embed], components: [row], fetchReply: true});
    await buttonManager4(interaction, msg, totalCost, cardList);
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('mbuy')
		.setDescription('buys a card from market.')
        .addStringOption(option => 
            option
                .setName("lid")
                .setDescription("The list id for the card you want to view")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const uid = await interaction.user.id;
            const player = await database.Player.findOne({where:{playerID: uid}});
            if (!player) {
                return interaction.reply(`You are not registered use command /isekai to get started.`);
            }
            const mid = '903935562208141323'
            console.log(1);
            const lids = await interaction.options.getString('lid');
            console.log(2);
            const lidarray = lids.split(" ");
            console.log(3);
            if (lidarray.length > 20) {
                console.log(4);
                return interaction.reply("Bulk buy limit is 20.");
            } else if (lidarray.length > 1) {
                console.log(5);
                for(let i = 0; i < lidarray.length; i++) {
                    console.log(6);
                    const card = await database.Card.findOne({where: {playerID: mid, inventoryID: lidarray[i]}});
                    if (!card) {
                        console.log(7);
                        return interaction.reply("Error Invalid list ID");
                    }
                    console.log(8);
                }
                console.log(9);
                await justList(interaction, lidarray);
                //buy the list of lids
            } else {
                console.log(10);
                const card = await database.Card.findOne({where: {playerID: mid, inventoryID: lidarray[0]}});
                if (card) {
                    await switchRarity(card, card.rarity, interaction);
                } else if (!card) {
                    interaction.reply("Error Invalid list ID");
                }
            }
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}