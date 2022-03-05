const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');
var dayjs = require('dayjs');
const { canTreatArrayAsAnd } = require('sequelize/dist/lib/utils');
const { isApplicationCommandDMInteraction } = require('discord-api-types/utils/v9');
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
        case "addcard":
            addCard(interaction);
            break;
        
        case "removecard":
            rmCard(interaction);
            break;

        case "removeall":
            rmAll(interaction);
            break;

        case "currency":
            currency(interaction);
            break;

        case "tradestatus":
            tradeStatus(interaction);
            break;
        
        case "locktrade":
            lockTrade(interaction);
            break;
    }
}



async function tradeList1(embed, interaction, page) {
    const uid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    //grab all cards type 1 with database.trade.findall
    //then grab all cards into a list and display
    //type 2,3,4 gem, karma, coins respectively.
    const tradeCards = await database.Trade.findAll({where: {player1ID: uid, player2ID: tid, type: 1}});
    let tradeLidList = [];
    for (let i = 0; i < tradeCards.length; i++) {
        tradeLidList[i] = tradeCards[i].value;
    }
    const cardList = await database.Card.findAll(
        {
            order: [['rarity','DESC']],
            limit: 20,
            offset: (page-1)*20,
            where: {
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const maxPage = await database.Card.count(
        {
            where: {
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const whiteCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 1,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const greenCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 2,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const blueCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 3,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const purpleCount = await database.Card.count(
        {
            where: {
            rarity: 4,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const redCount = await database.Card.count(
        {
            where: {
            rarity: 5,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    )
    let locked
    const locks = (database.Trade.count({where: {player1ID: uid, player2ID: tid, locked: true}}) 
            + database.Trade.count({where: {player1ID: tid, player2ID: uid, locked: true}}));
    if (locks > 0) {
        locked = true;
    } else {
        locked = false;
    }
    const gems = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 2}});
    const karma = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 3}});
    const coins = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 4}});
    
    
    
    const totalPage = Math.ceil(maxPage/20);
    await deployButton2(interaction, embed);
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**Trade items from ${interaction.user.username} to ${target.username}**\n${fullList}

    **Locked:** ${locked};
    **Quartz:** ${whiteCount} cards
    **Jade:** ${greenCount} cards
    **Lapis:** ${blueCount} cards
    **Amethyst:** ${purpleCount} cards
    **Ruby:** ${redCount} cards
    **Gem:** ${gems.value}
    **Karma:** ${karma.value}
    **Coins:** ${coins.value}
    `);
    
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager1(embed, interaction, msg, page, totalPage);
}

async function tradeList2(embed, interaction, page){
    const tid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const uid = target.id;
    //grab all cards type 1 with database.trade.findall
    //then grab all cards into a list and display
    //type 2,3,4 gem, karma, coins respectively.
    const tradeCards = await database.Trade.findAll({where: {player1ID: uid, player2ID: tid, type: 1}});
    let tradeLidList = [];
    for (let i = 0; i < tradeCards.length; i++) {
        tradeLidList[i] = tradeCards[i].value;
    }
    let locked
    const locks = (database.Trade.count({where: {player1ID: uid, player2ID: tid, locked: true}}) 
            + database.Trade.count({where: {player1ID: tid, player2ID: uid, locked: true}}));
    if (locks > 0) {
        locked = true;
    } else {
        locked = false;
    }
    const gems = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 2}});
    const karma = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 3}});
    const coins = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 4}});

    const cardList = await database.Card.findAll(
        {
            order: [['rarity','DESC']],
            limit: 20,
            offset: (page-1)*20,
            where: {
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const maxPage = await database.Card.count(
        {
            where: {
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const whiteCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 1,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const greenCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 2,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const blueCount = await database.Card.sum('quantity',
        {
            where: {
            rarity: 3,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const purpleCount = await database.Card.count(
        {
            where: {
            rarity: 4,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
    const redCount = await database.Card.count(
        {
            where: {
            rarity: 5,
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    )

    
    const totalPage = Math.ceil(maxPage/20);
    await deployButton2(interaction, embed);
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**Trade items from ${target.username} to ${interaction.user.username}**\n${fullList}

    Locked: ${locked};
    Quartz: ${whiteCount} cards
    Jade: ${greenCount} cards
    Lapis: ${blueCount} cards
    Amethyst: ${purpleCount} cards
    Ruby: ${redCount} cards
    Gem: ${gems.value}
    Karma: ${karma.value}
    Coins: ${coins.value}
    `);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const msg = await updateReply(interaction, embed);
    await buttonManager2(embed, interaction, msg, page, totalPage);
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

async function updateReply(interaction, embed) {
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
                .setCustomId('switch')
                .setLabel('Switch')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('trade')
                .setLabel('Trade')
                .setStyle('SUCCESS'),
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle('DANGER')
        );
    await interaction.editReply({ embeds: [embed], components: [row]});
}

async function processCard1(interaction) {
    const uid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    //grab all cards type 1 with database.trade.findall
    //then grab all cards into a list and display
    //type 2,3,4 gem, karma, coins respectively.
    const tradeCards = await database.Trade.findAll({where: {player1ID: uid, player2ID: tid, type: 1}});
    let tradeLidList = [];
    for (let i = 0; i < tradeCards.length; i++) {
        tradeLidList[i] = tradeCards[i].value;
    }

    await database.Card.update({playerID: tid},
        {
            where: {
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
}

async function processCard2(interaction) {
    const tid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const uid = target.id;
    //grab all cards type 1 with database.trade.findall
    //then grab all cards into a list and display
    //type 2,3,4 gem, karma, coins respectively.
    const tradeCards = await database.Trade.findAll({where: {player1ID: uid, player2ID: tid, type: 1}});
    let tradeLidList = [];
    for (let i = 0; i < tradeCards.length; i++) {
        tradeLidList[i] = tradeCards[i].value;
    }

    await database.Card.update({playerID: tid},
        {
            where: {
            playerID: uid,
            inventoryID: {[Op.or]: [tradeLidList]}
        }}
    );
}

async function processGem(interaction) {
    const uid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    const player2 = await database.Player.findOne({where: {playerID: tid}});
    const gems1 = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 2}});
    const gems2 = await database.Trade.findOne({where: {player1ID: tid, player2ID: uid, type: 2}});
    if (gems1 && gems2) {
        const gem = gems1.value-gems2.value
        player1.increment({gems: -gem});
        player2.increment({gems: gem});
    } else if (gems1 && !gems2) {
        player1.increment({gems: -gems1.value});
        player2.increment({gems: gems1.value});
    } else if (gems2 && !gems2) {
        player1.increment({gems: gems2.value});
        player2.increment({gems: -gems2.value});
    }
}

async function processKarma(interaction) {
    const uid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    const player2 = await database.Player.findOne({where: {playerID: tid}});
    const karma1 = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 3}});
    const karma2 = await database.Trade.findOne({where: {player1ID: tid, player2ID: uid, type: 3}});
    if (karma1 && karma2) {
        const karma = karma1.value-karma2.value
        player1.increment({karma: -karma.value});
        player2.increment({karma: karma.value});
    } else if (karma1 && !karma2) {
        player1.increment({karma: -karma1.value});
        player2.increment({karma: karma1.value});
    } else if (karma1 && !karma2) {
        player1.increment({karma: karma2.value});
        player2.increment({karma: -karma2.value});
    }
}

async function processCoins(interaction) {
    const uid = await interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    const player2 = await database.Player.findOne({where: {playerID: tid}});
    const coins1 = await database.Trade.findOne({where: {player1ID: uid, player2ID: tid, type: 4}});
    const coins2 = await database.Trade.findOne({where: {player1ID: tid, player2ID: uid, type: 4}});
    if (coins1 && coins2) {
        const coins = coins1.value-coins2.value
        player1.increment({money: -coins.value});
        player2.increment({money: coins.value});
    } else if (coins1 && !coins2) {
        player1.increment({money: -coins1.value});
        player2.increment({money: coins1.value});
    } else if (coins2 && !coins1) {
        player1.increment({money: coins2.value});
        player2.increment({money: -coins2.value});
    }
}
async function processCurrency(interaction) {
    await processGem(interaction);
    await processKarma(interaction);
    await processCoins(interaction);
}

async function processTrade(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const locked = (await database.Trade.count({where: {player1ID: uid, player2ID: tid, locked: false}}) 
        + await database.Trade.count({where: {player1ID: tid, player2ID: uid, locked: false}}));
    if (locked == 0) {
        await processCard1(interaction);
        await processCard2(interaction);
        await processCurrency(interaction);
        return interaction.followUp("Trade Successful!")
    } else {
        return interaction.followUp("Trade is not locked yet!")
    }

    
    //Transfer everything over fuckkkkk

}

async function buttonManager1(embed, interaction, msg, page, maxPage) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 30000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await tradeList1(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await tradeList1(embed, interaction, nextPage);
                    break;

                case 'switch':
                    await tradeList2(embed, interaction, 1);
                    break;

                case 'trade':
                    await processTrade(interaction);
                    break;
                
                case 'cancel':
                    await interaction.channel.send("Trade Cancelled")
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

async function buttonManager2(embed, interaction, msg, page, maxPage) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 30000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await tradeList2(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await tradeList2(embed, interaction, nextPage);
                    break;

                case 'switch':
                    await tradeList1(embed, interaction, 1);
                    break;

                case 'trade':
                    await processTrade(interaction)
                    break;
                
                case 'cancel':
                    await interaction.channel.send("Trade Cancelled")
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
        const cardString = `:red_square:` + ID + ` | ${tag}` + charname + ` (#${inumber})`;
        console.log(cardString);
        return cardString
    } else {
        const cardString = `:red_square:` + ID + ` | ` + charname + `(#${inumber})`;
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



async function tradeStatus(interaction) {
    const checked = await check(interaction)
    if (checked) {
        const embed = embedSucess(interaction);
        await interaction.reply({embeds: [embed]});
        await tradeList1(embed, interaction, 1);
    }
}



































async function lockTrade(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    if (await check(interaction)) {
        await database.Trade.update({locked: true}, {where: {player1ID: uid, player2ID: tid}});
        await interaction.reply(`Trade items from you to ${target.username} has been locked.
To complete the trade, ${target.username} must also lock their trade items and use /trade tradestatus
To change the trade items, both players must unlock their trade items.`);
    }
}




async function addGem(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const amount = interaction.options.getInteger('amount');
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    if (player1.gems > amount) {
        await database.Trade.upsert({player1ID: uid, player2ID: tid, type: 2, value: amount}, 
            {where: {player1ID: uid, player2ID: tid, type: 2}});
        interaction.reply(`Added ${amount} gems to the trade with ${target.username}`);
    } else {
        await interaction.reply("Insufficient gems.")
    }
}

async function addKarma(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const amount = interaction.options.getInteger('amount');
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    if (player1.karma > amount) {
        await database.Trade.upsert({player1ID: uid, player2ID: tid, type: 3, value: amount}, 
            {where: {player1ID: uid, player2ID: tid, type: 3}});
        interaction.reply(`Added ${amount} karma to the trade with ${target.username}`);
        
    } else {
        await interaction.reply("Insufficient karma.")
    }
    
}

async function addCoins(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const amount = interaction.options.getInteger('amount');
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    if (player1.money > amount) {
        await database.Trade.upsert({player1ID: uid, player2ID: tid, type: 4, value: amount}, 
            {where: {player1ID: uid, player2ID: tid, type: 4}});
        interaction.reply(`Added ${amount} coins to the trade with ${target.username}`);
    } else {
        await interaction.reply("Insufficient coins.")
    }
}



async function currency(interaction) {
    if (await check(interaction)) {
        const type = interaction.options.getInteger('currency');
        switch (type) {
            case 1:
                addGem(interaction);
                break;
            
            case 2:
                addKarma(interaction);
                break;
            
            case 3:
                addCoins(interaction);
                break;
        }
    }
}

async function rmAll(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    if (await check(interaction)) {
        await database.Trade.destroy({where: {player1ID: uid, player2ID: tid, locked: false}});
        await interaction.reply(`All trade items with ${target.username} has been removed.`)
    }
}

async function rmLid(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const lid = interaction.options.getInteger('lid');
    const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    
    await database.Trade.destroy({where: {player1ID: uid, player2ID: tid, type: 1, value: lid, locked: false}});
    interaction.reply(`Removed card ${lid}|${char.characterName}(#${card.imageNumber}) from the trade with ${target.username}`);
}

async function rmTag(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const tag = interaction.options.getString('tag');
    const cardsList = await database.Card.findAll({where: {playerID: uid, tag: tag}});
    for (let i = 0; i < cardsList.length; i++) {
        await database.Trade.destroy({where: {player1ID: uid, player2ID: tid, type: 1, value: cardsList[i].inventoryID, locked: false}});
    }
    interaction.reply(`Removed ${cardsList.length} cards (not counting quantity) tagged with ${tag} to trade with ${target.username}`);
}

async function rmTagLid(interaction) {
    const tag = interaction.options.getString('tag');
    const lid = interaction.options.getInteger('lid');
    if (tag && !lid) {
        await rmTag(interaction);
    } else if (!tag && lid) {
        await rmLid(interaction);
    }
}

async function rmCard(interaction) {
    if(await check(interaction)) {
        await rmTagLid(interaction);
    } else {
        return false;
    }
    return false;
}

async function check(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const player1 = await database.Player.findOne({where: {playerID: uid}});
    const player2 = await database.Player.findOne({where: {playerID: tid}});
    if (player1 && player2) {
        const locked = (database.Trade.count({where: {player1ID: uid, player2ID: tid, locked: true}}) 
            + database.Trade.count({where: {player1ID: tid, player2ID: uid, locked: true}}));
        if (locked > 0) {
            interaction.reply(`The trade is locked with ${locked} cards in the trade with ${target.username}
Unlock trade with the player before modifying the trade.`);
        } else {
            return true
        }
    } else {
        interaction.channel.send("One or both users aren't registered.")
        return false;
        //decline request.
    }
}

async function addLid(interaction) {
    const uid = await interaction.user.id;
    const target = await interaction.options.getUser('user');
    const tid = await target.id;
    const lid = await interaction.options.getInteger('lid');
    
    let quantity = interaction.options.getInteger('quantity');
    if (!quantity) {
        quantity = 1;
    }
    const card = await database.Card.findOne({where: {playerID: uid, inventoryID: lid}});
    const char = await database.Character.findOne({where: {characterID: card.characterID}});
    await database.Trade.upsert({player1ID: uid, player2ID: tid, type: 1, value: lid, quantity: quantity}, {where: {player1ID: uid, player2ID: tid, type: 1, value: lid}});
    
    interaction.reply(`Added card ${lid}|${char.characterName}(#${card.imageNumber}) ×${quantity} to the trade with ${target.username}`);
}

async function addTag(interaction) {
    const uid = interaction.user.id;
    const target = interaction.options.getUser('user');
    const tid = target.id;
    const tag = interaction.options.getString('tag');
    const cardsList = await database.Card.findAll({where: {playerID: uid, tag: tag}});
    for (let i = 0; i < cardsList.length; i++) {
        if (cardsList[i].rarity >= 4) {
            await database.Trade.findOrCreate({where: {player1ID: uid, player2ID: tid, type: 1, value: cardsList[i].inventoryID}});
        } else {
            await database.Trade.findOrCreate({where: {player1ID: uid, player2ID: tid, type: 1, value: cardsList[i].inventoryID, quantity: cardsList[i].quantity}});
        }
    }
    interaction.reply(`Added ${cardsList.length} cards (not counting quantity) tagged with ${tag} to trade with ${target.username}`);
}

async function tagLid(interaction) {
    const tag = interaction.options.getString('tag');
    const lid = interaction.options.getInteger('lid');
    if (tag && !lid) {
        await addTag(interaction);
    } else if (!tag && lid) {
        await addLid(interaction);
    }
}

async function addCard(interaction) {
    if(await check(interaction)) {
        await tagLid(interaction);
    } else {
        return false;
    }
    return false;
}



module.exports = {
	data: new SlashCommandBuilder()
		.setName('trade')
		.setDescription('Single or Bulk all with tag.')
        .addSubcommand(subcommand =>
            subcommand
                .setName("addcard")
                .setDescription("Adds cards to the trade by tag or lid")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("User you want to trade with")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to add to the trade.")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("lid")
                        .setDescription("lid you want to add to the trade")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("quantity")
                        .setDescription("The quantity of cards if you are trading Quartz-Lapis rarity cards.")
                        .setRequired(false)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("removecard")
                .setDescription("Removes cards from the trade by tag or lid.")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("User you want to trade with")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("tag")
                        .setDescription("Tag you want to add to the trade.")
                        .setRequired(false)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("lid")
                        .setDescription("lid you want to add to the trade")
                        .setRequired(false)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("removeall")
                .setDescription("Removes all trade components with the user.")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("User you want to trade with")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("currency")
                .setDescription("Add or remove currencies from part of the trade")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("User you want to trade with")
                        .setRequired(true)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("currency")
                        .setDescription("The currency you want to add or remove")
                        .setRequired(true)
                        .addChoice('Gem', 1)
                        .addChoice('Karma', 2)
                        .addChoice('Coins', 3)
                        )
                .addIntegerOption(option => 
                    option
                        .setName("amount")
                        .setDescription("The amount you want to add or remove. Enter a negative number to remove.")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("tradestatus")
                .setDescription("Displays what's in the trade with a user.")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("User you want to trade with")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("locktrade")
                .setDescription("Displays what's in the trade with a user.")
                .addUserOption(option => 
                    option
                        .setName("user")
                        .setDescription("User you want to trade with")
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