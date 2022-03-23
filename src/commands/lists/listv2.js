const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');



function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Inventory")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`List of ${interaction.user.username} Cards`)
        .setColor(color.aqua)
    
    return embed;
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

async function buttonManager(embed, interaction, msg, page, maxPage) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await listSwitch(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await listSwitch(embed, interaction, nextPage);
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
    const quantity = card.quantity;
    
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
    const quantity = card.quantity;
    
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

async function specard(card) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    const ID = card.inventoryID;
    //white block :white_large_square:

    //check for tag 
    const tag = card.tag;
    const special = await database.Special.findOne({where: {cardID: card.cardID}});
    
    //find charname
    const charname = special.characterName;
    
    if (tag) {
        const cardString = `:diamond_shape_with_a_dot_inside:` + ID + ` | ${tag}` + charname;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:diamond_shape_with_a_dot_inside:` + ID + ` | ` + charname;
        console.log(cardString);
        return cardString
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

        case 10:
            return specard(card);
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
        const cardString = await switchRarity(list[i], rarity);
        listRef[i] = cardString;
    }
    return listRef;
}

async function listSwitch(embed, interaction, page){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "cname":
            cnameList(embed, interaction, page);
            break;
        
        case "cid":
            cidList(embed, interaction, page);
            break;

        case "sname":
            snameList(embed, interaction, page);
            break;

        case "sid":
            sidList(embed, interaction, page);
            break;

        case "base":
            justList(embed, interaction, page);
            break;

        case "wishlist":
            wishList(embed, interaction, page);
            break;
    }
}



async function order(interaction) {
    const order = interaction.options.getInteger("order");
    if (order == 1){
        return ['rarity','DESC'];
    } else if (order == 2) {
        return ['inventoryID','DESC'];
    } else {
        return ['inventoryID','ASC']
    }
}

async function cnameList(embed, interaction, page){
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
    let maxPage;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    const totalPage = Math.ceil(await maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, totalPage);
}

async function cidList(embed, interaction, page){
    const uid = await interaction.user.id;
    const cid = await interaction.options.getInteger('id');
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    let maxPage;
    let cardList;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: cid
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: cid
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                tag: tag,
                playerID: uid,
                characterID: cid
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                playerID: uid,
                characterID: cid
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                playerID: uid,
                characterID: cid
            }}
        );
    }
    
    const totalPage = Math.ceil(await maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, totalPage);
}

async function snameList(embed, interaction, page){
    console.log(1);
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    console.log(rarity);
    console.log(5);
    const sname = await interaction.options.getString('sname');
    const seriesList = await database.Series.findAll({
        where: {
            seriesName: {[Op.like]: '%' + sname + '%'},
        }}
            );
    var sidList = [];
    console.log(6);
    for (let i = 0; i < seriesList.length; i++) {
        const sid = seriesList[i].seriesID;
        sidList[i] = sid;
    }
    console.log(7);
    const charList = await database.Character.findAll({
        where: {
            seriesID: {[Op.or]: sidList}
        }}
    );
    console.log(8);
    var cidList = [];
    for (let i = 0; i < charList.length; i++) {
        const cid = charList[i].characterID;
        cidList[i] = cid;
    }
    console.log(9);
    if (!cidList[0]) {
        return interaction.channel.send("No results found for sname used.")
    }
    let cardList;
    let maxPage;
    console.log(cidList);
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                characterID: {[Op.or]: cidList},
                rarity: rarity,
                playerID: uid,
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    const totalPage = Math.ceil(await maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    console.log(12);
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    console.log(13);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, totalPage);
}

async function sidList(embed, interaction, page){
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
    let maxPage;
    console.log(cidList);
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: cidList}
            }}
        );
    }
    const totalPage = Math.ceil(await maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, totalPage);
}

async function wishList(embed, interaction, page){
    const uid = await interaction.user.id;
    const user = await interaction.options.getUser("user");
    const player = await database.Player.findOne({where: {playerID: user.id}});
    let wishlist;
    let wishid = [];
    if (player) {
        wishlist = await database.Wishlist.findAll({where: {playerID: user.id}});
        if (!wishlist) {
            embed.setDescription(`User ${user.username}'s wishlist is empty.`);
            return await updateReply(interaction, embed);
        } else {
            for (let i = 0; i < wishlist.length; i++) {
                wishid[i] = wishlist[i].characterID;
            }
        }
    } else {
        embed.setDescription(`User ${user.username} is not a player yet.`);
        return await updateReply(interaction, embed);
    }
    
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    let cardList;
    let maxPage;

    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                tag: tag,
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                playerID: uid,
                characterID: {[Op.or]: wishid}
            }}
        );
    }
    const totalPage = Math.ceil(maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, totalPage);
}
async function justList(embed, interaction, page){
    const uid = await interaction.user.id;
    let rarity = await interaction.options.getInteger("rarity");
    let tag = await interaction.options.getString("tag");
    const orderOpt = await order(interaction)
    let cardList;
    let maxPage;
    if (rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                tag: tag,
                playerID: uid,
            }}
        );
        maxPage = await database.Card.count(
            {
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
                limit: 20,
                offset: (page-1)*20,
                where: {
                rarity: rarity,
                playerID: uid,
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                rarity: rarity,
                playerID: uid,
            }}
        );
    } else if (!rarity && tag) {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                tag: tag,
                playerID: uid,
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                tag: tag,
                playerID: uid,
            }}
        );
    } else {
        cardList = await database.Card.findAll(
            {
                order: [orderOpt],
                limit: 20,
                offset: (page-1)*20,
                where: {
                playerID: uid,
            }}
        );
        maxPage = await database.Card.count(
            {
                where: {
                playerID: uid,
            }}
        );
    }
    const totalPage = Math.ceil(maxPage/20);
    if (totalPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, totalPage);
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
		.setName('list')
		.setDescription('Advanced list command if you use subcommands and add options it adds filters and orders.')
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
                        )),
	async execute(interaction) {
		const embed = embedSucess(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            await interaction.reply({embeds: [embed]});
            await listSwitch(embed, interaction, 1);
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};