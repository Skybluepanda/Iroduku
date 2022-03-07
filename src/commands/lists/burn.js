const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
const { canTreatArrayAsAnd } = require('sequelize/dist/lib/utils');
//import dayjs from 'dayjs' // ES 2015
dayjs().format()

function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Inventory")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`List of ${interaction.user.username} Cards`)
        .setColor(color.aqua)
    
    return embed;
}
async function subSwitch(interaction){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "lid":
            burnLid(interaction);
            break;
        
        case "tag":
            console.log("1");
            burnTag(interaction);
            break;
    }
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


async function buttonManager(interaction, msg, coins, gems) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'confirm':
                    const uid = await interaction.user.id;
                    const lid = await interaction.options.getInteger('lid');
                    let quantity = await interaction.options.getInteger('quantity');
                    if (!quantity) {
                        quantity = 1;
                    }
                    const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
                    if (card.quantity == quantity) {
                        card.destroy();
                    } else {
                        card.increment({quantity: -quantity});
                    }
                    await database.Player.increment({money: coins, gems: gems}, {where: {playerID: uid}});
                    await interaction.channel.send(`Card ${lid} burnt. ${coins} coins and ${gems} gems refunded.`)
                    break;
                
                case 'cancel':
                    await interaction.channel.send("Burn Cancelled")
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
}

async function viewWhiteCard(card, interaction) { 
    let quantity = await interaction.options.getInteger('quantity');
    if (!quantity) {
        quantity = 1;
    }
    const embedCard = new MessageEmbed();
    const coins = quantity * 10;
    const gem = quantity * 1;
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
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID: **${cid}
**Series: **${char.seriesID} | ${series.seriesName}
**Rarity: Quartz**
**Quantity:** ${card.quantity}

BURNING THIS CARD WILL YIELD 10 COINS AND 1 GEMS
${quantity} copies being burnt for ${coins} coins and ${gem} gems`)
        .setColor(color.white);
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, coins, gem);
}

async function viewGreenCard(card, interaction) { 
    let quantity = await interaction.options.getInteger('quantity');
    if (!quantity) {
        quantity = 1;
    }
    const coins = quantity * 20;
    const gem = quantity * 5;
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
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Jade
**Quantity:** ${card.quantity}

BURNING THIS CARD WILL YIELD 20 COINS AND 5 GEMS
${quantity} copies being burnt for ${coins} coins and ${gem} gems`)
        .setColor(color.green);
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, coins, gem);
}

async function viewBlueCard(card, interaction) {
    let quantity = await interaction.options.getInteger('quantity');
    if (!quantity) {
        quantity = 1;
    }
    const embedCard = new MessageEmbed();
    //all we get is inventory id and player id
    const player = await interaction.user.id;
    const cid = await card.characterID;
    const char = await database.Character.findOne({ where: {characterID: cid}});
    const series = await database.Series.findOne({ where: {seriesID: char.seriesID}});
    const coins = quantity * 50;
    const gem = quantity * 10;
    let image;
    let url;
    if (card.imageNumber > 0) {
        image = await database.Image.findOne({where: {characterID: cid, imageNumber: card.imageNumber}});
        if (image) {
            url = await image.imageURL;
            embedCard.setFooter(`#${image.imageNumber} Art by ${image.artist} | Uploaded by ${image.uploader}
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
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
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Lapis
**Quantity:** ${card.quantity}

BURNING THIS CARD WILL YIELD 50 COINS AND 10 GEMS PER COPY
${quantity} copies being burnt for ${coins} coins and ${gem} gems`)
        .setColor(color.blue);
    const row = await createButton();
    const nsfw = await image.nsfw;
    if (nsfw) {
        await interaction.reply(`||${image.imageURL}||`);
        msg = await interaction.editReply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, coins, gem);
        return await interaction.followUp("**Above embed may contain explicit content.**")
    } else {
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, coins, gem);
    }
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
Image ID is ${image.imageID} report any errors using ID.`).setImage(url)
        } else {
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else if (card.imageID < 0){
        image = await database.Gif.findOne({where: {characterID: cid, gifID: -(card.imageID)}});
        if (image){
            url = await image.gifURL;
            embedCard.setFooter(`#${image.gifNumber} Gif from ${image.artist} | Uploaded by ${image.uploader}
Gif ID is ${image.gifID} report any errors using ID.`).setImage(url)
        } else {
            embedCard.addField("no image found", "Send an official image for this character.");
        }
    } else {
        embedCard.addField("no image found", "Send an official image for this character. Then update the card!")
    }
    embedCard.setTitle(`${char.characterName}`)
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Card Info
**LID:** ${card.inventoryID} | **CID:** ${cid}
**Series:** ${char.seriesID} | ${series.seriesName}
**Rarity:** Amethyst
**Date Pulled:** ${dayjs(card.createdAt).format('DD/MM/YYYY')}

BURNING THIS CARD WILL YIELD 200 COINS AND 10 GEMS`)
        .setColor(color.purple);
    const row = await createButton();
    const nsfw = await image.nsfw;
    if (nsfw) {
        await interaction.reply(`||${image.imageURL}||`);
        msg = await interaction.editReply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, 200, 10);
        await interaction.followUp("**Above embed may contain explicit content.**")
    } else {
        msg = await interaction.reply( {embeds: [embedCard], components: [row], fetchReply: true});
        await buttonManager(interaction, msg, 200, 10);
    }
}

async function switchRarity(card, rarity, interaction) {
    
    let quantity = await interaction.options.getInteger('quantity');
    switch (rarity) {
        case 1:
            if (card.quantity < quantity) {
                return interaction.reply("Insufficient Quantity. Enter a smaller quantity.");
            }
            return viewWhiteCard(card, interaction);
            //white
        case 2:
            if (card.quantity < quantity) {
                return interaction.reply("Insufficient Quantity. Enter a smaller quantity.");
            }
            return viewGreenCard(card, interaction);
            //green
        case 3:
            if (card.quantity < quantity) {
                return interaction.reply("Insufficient Quantity. Enter a smaller quantity.");
            }
            return viewBlueCard(card, interaction);
            //Blue
        case 4:
            if (quantity) {
                return interaction.reply("Amethyst Cards Don't have Quantity. Try again without quantity.");
            }
            return viewPurpleCard(card, interaction);
            //Purple
        case 5:
            return interaction.reply("You can't burn ruby cards.");
            //red

        case 6:
            return interaction.reply("You can't burn Diamond cards.");

        default:
            return interaction.reply("Error");
            //wtf?
    }
}

async function burnLid(interaction){
    const uid = await interaction.user.id;
    const lid = await interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}})
    if (card) {
        if (card.lock) {
            return interaction.reply(`Card ${lid} is locked. Unlock the card before burning.`)
        }
        return switchRarity(card, card.rarity, interaction);
    } else {
        return interaction.reply("Invalid List ID.")
    }
}

async function burnTag(interaction){
    console.log("2");
    const embed = embedSucess(interaction);
    
    const uid = await interaction.user.id;
    const tag = await interaction.options.getString('tag');
    if (tag) {
        console.log("3");
        await interaction.reply({embeds: [embed]});
        return burnList(embed, interaction, 1);
    } else {
        console.log("4");
        return interaction.reply("Invalid List ID.")
    }
}

async function burnList(embed, interaction, page){
    console.log("5");
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    console.log("6");
    const cardList = await database.Card.findAll(
        {
            order: [['rarity','DESC']],
            limit: 20,
            offset: (page-1)*20,
            where: {
            tag: tag,
            playerID: uid,
            lock: false
                
        }}
    );
    const totalList = await database.Card.findAll(
        {
            where: {
            tag: tag,
            playerID: uid,
            lock: false
        }}
    );
    const maxPage = await database.Card.count(
        {
            where: {
            tag: tag,
            playerID: uid,
            lock: false
        }}
    );
    const whiteCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 1,
            tag: tag,
            playerID: uid,
            lock: false
        }}
    );
    const greenCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 2,
            tag: tag,
            playerID: uid,
            lock: false
        }}
    );
    const blueCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 3,
            tag: tag,
            playerID: uid,
            lock: false
        }}
    );
    const purpleCount = await database.Card.count(
        {
            where: {
            rarity: 4,
            tag: tag,
            playerID: uid,
            lock: false
        }}
    );
    const totalCoin = purpleCount*200 + blueCount*50+ greenCount*20 + whiteCount*10;
    const totalGem = purpleCount*10 + blueCount*10+ greenCount*5 + whiteCount*1;

    
    const totalPage = Math.ceil(maxPage/20);
    await deployButton2(interaction, embed);
    for (let i = 0; i < totalList.length; i++) {

    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}
    Burning total of:
    Quartz: ${whiteCount} cards for ${whiteCount*10} coins and ${greenCount*1} gems,
    Jade: ${greenCount} cards for ${greenCount*20} coins and ${greenCount*5} gems,
    Lapis: ${blueCount} cards for ${blueCount*50} coins and ${blueCount*10} gems,
    Amethyst: ${purpleCount} cards for ${purpleCount*200} coins and ${purpleCount*10} gems.
    Total: ${totalCoin} coin and ${totalGem} gems.
    `);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager2(embed, interaction, msg, page, totalPage, totalCoin, totalGem);
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

async function updateReply(interaction, embed){
    return await interaction.editReply({embeds: [embed]});
}

async function deployButton2(interaction, embed){
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('confirm')
                .setLabel('confirm')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('cancel')
                .setStyle('DANGER')
        );
    await interaction.editReply({ embeds: [embed], components: [row]});
}

async function buttonManager2(embed, interaction, msg, page, maxPage, coins, gems) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await burnList(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await burnList(embed, interaction, nextPage);
                    break;

                case 'confirm':
                    const uid = await interaction.user.id;
                    const tag = await interaction.options.getString('tag');
                    await database.Card.destroy(
                        {
                            where: {
                            rarity: {[Op.lt]: 5},
                            tag: tag,
                            playerID: uid,
                            lock: false
                        }}
                    );
                    await database.Player.increment({money: coins, gems: gems}, {where: {playerID: uid}});
                    await interaction.channel.send(`Cards with ${tag} burnt. ${coins} coins and ${gems} gems refunded.`)
                    break;
                
                case 'cancel':
                    await interaction.channel.send("Burn Cancelled")
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
    let quantity = card.quantity;
    
    if (tag) {
        const cardString =`:white_large_square:` + ID + ` | ${tag}` + charname + ` ×${quantity}`;
        console.log(cardString);
        return cardString
    } else {
        const cardString =`:white_large_square:` + ID + ` | ` + charname + `×${quantity}`;
        console.log(cardString);
        return cardString
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
    let quantity = card.quantity;
    
    if (tag) {
        const cardString = `:green_square:`+ ID + ` | ${tag}` + charname + ` ×${quantity}`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:green_square:` + ID + ` | ` + charname + `×${quantity}`;
        console.log(cardString);
        return cardString
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
    let quantity = card.quantity;
    
    if (tag) {
        const cardString = `:blue_square:` +ID + ` | ${tag}` + charname + ` (#${inumber})×${quantity}`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:blue_square:` + ID + ` | ` + charname + `(#${inumber})×${quantity}`;
        console.log(cardString);
        return cardString
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
    
    if (tag) {
        const cardString = `:purple_square:` + ID + ` | ${tag}` + charname + ` (#${inumber})`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:purple_square:` + ID + ` | ` + charname + `(#${inumber})`;
        console.log(cardString);
        return cardString
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
        const cardString = `:red_square:` + ID + ` | ${tag}` + charname + ` (#${inumber}) Won't be burnt`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:red_square:` + ID + ` | ` + charname + `(#${inumber}) Won't be burnt`;
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
        const cardString = `:large_blue_diamond:` + ID + ` | ${tag}` + charname + ` (#${inumber}) Won't be burnt`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:large_blue_diamond:` + ID + ` | ` + charname + `(#${inumber}) Won't be burnt`;
        console.log(cardString);
        return cardString
    }
}
async function switchRarity2(card, rarity) {
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
        const cardString = await switchRarity2(list[i], rarity);
        listRef[i] = cardString;
    }
    return listRef;
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
		.setName('burn')
		.setDescription('Single or Bulk all with tag.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("lid")
                .setDescription("Burns the non ruby card with lid")
                .addIntegerOption(option => 
                    option
                        .setName("lid")
                        .setDescription("The inventory id u want to apply tag to")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("quantity")
                        .setDescription("If empty only one copy will be burnt in the case of stacked cards.")
                        .setRequired(false)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("tag")
                .setDescription("Burns all non ruby cards with the tag. You will be asked later to confirm with a button.")
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to bulk burn.")
                        .setRequired(true)
                        )
                .addBooleanOption(option => 
                    option
                        .setName("confirm")
                        .setDescription("Are you sure?")
                        .setRequired(true)
                        )),
	async execute(interaction) {
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            subSwitch(interaction);
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};