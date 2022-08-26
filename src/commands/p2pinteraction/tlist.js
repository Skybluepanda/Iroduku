const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Collection, IntegrationApplication, BaseGuildVoiceChannel, InteractionWebhook } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');

const tradeListing = new Collection();
const tradeLocked = new Collection();

/**
 * 
 * needs to have
 * the ability to list all items, with trade id, character name and rarity.
 * doesn't need tag or shit,
 * two buttons, one for each player, after both are locked spawn third button which can accept the trade.
 * Cancel button which will return all cards to the player's inventory.
 * Each player's items seperated.
 * Idk how many cards each player should be able to add. (lets not set a limit and include pages.)
 * Spawn two seperate embeds with a button which must be pressed by both players.
 * 
 */

function embedSucess(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Initialising Trade list.")
        .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
        .setDescription(`Listing trade items...`)
        .setColor(color.aqua)
    
    return embed;
}

async function createButton(){
    try {
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('lock')
                .setLabel('lock')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('refresh')
                .setLabel('refresh')
                .setStyle('SECONDARY'),
            new MessageButton()
                .setCustomId('cancel')
                .setLabel('cancel')
                .setStyle('DANGER'),
            new MessageButton()
                .setCustomId('reset')
                .setLabel('reset')
                .setStyle('DANGER'),
        );
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}


async function resetTrade(interaction) {
    try {
        const user = interaction.user;
        const target = await interaction.options.getUser('targetuser');
        await returnCards(user, target, interaction);
        await returnCards(target, user, interaction);
    } catch (error) {
        tradeLocked.delete(target.id);
        tradeLocked.delete(uid);
        tradeListing.delete(uid);
        tradeListing.delete(target.id);
        interaction.followUp(`Error ${error} has occured.`);
    }
}

async function returnCards(player1, player2, interaction) {
    console.log(1);
    const tradeList = await database.Trade.findAll(
        {
            where: {
                player1ID: player1.id,
                player2ID: player2.id,
        }}
    );
    if (tradeList.length > 0) {
        const lastCard = await database.Card.max('inventoryID', {where: {playerID: player1.id}}) +1;
        for (let i = 0; i < tradeList.length; i++) {
            const cID = tradeList[i].inventoryID;
            console.log(cID);
            const empty = lastCard + i;
            await database.Card.update({playerID: player1.id, inventoryID: empty},{
                where: {
                    cardID: cID,
                }
            })
            await tradeList[i].destroy();
        }
        await interaction.followUp(`Cards returned to ${player1}'s inventory from id ${lastCard}.`);
        return lastCard;
    }    
}
    
async function processTrade(player1, player2, interaction){
    const tradeList = await database.Trade.findAll(
        {
            where: {
                player1ID: player1.id,
                player2ID: player2.id,
                locked: true,
        }}
    );
    if (tradeList.length > 0) {
        const lastCard = await database.Card.max('inventoryID', {where: {playerID: player2.id}}) + 1;
        for (let i = 0; i < tradeList.length; i++) {
            const cID = tradeList[i].inventoryID;
            const empty = await lastCard + i;
            await database.Card.update({playerID: player2.id, inventoryID: empty, tag: null, lock: false, },{
                where: {
                    cardID: cID,
                }
            })
            await tradeList[i].destroy();
        }
        await interaction.followUp(`Cards added to ${player2}'s inventory from id ${lastCard}.`);
    }
}

async function checkAndTrade(interaction) {;
    try {const user = interaction.user;
        const uid = interaction.user.id;
        const target = await interaction.options.getUser('targetuser');
        await processTrade(user, target, interaction);
        await processTrade(target ,user, interaction);
    } catch (error) {
        tradeLocked.delete(target.id);
        tradeLocked.delete(uid);
        tradeListing.delete(uid);
        tradeListing.delete(target.id);
        interaction.followUp(`Error ${error} has occured.`);
    }
    
}

async function buttonManager(embed, interaction, msg) {
    const user = interaction.user;
    const uid = interaction.user.id;
    const target = await interaction.options.getUser('targetuser');
    try {
        
        const filter = i => ((i.user.id == interaction.user.id) || (i.user.id == target.id));
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'lock':
                    await collector.stop('stop');
                    if(i.user.id == interaction.user.id) {
                        await interaction.channel.send(`${user} has locked their offer in the trade with ${target}.`)
                        console.log("user locked");
                        await database.Trade.update({locked: true}, {where: {player1ID: uid, player2ID: target.id}});
                        tradeLocked.set(interaction.user.id, true);
                    } else {
                        await interaction.channel.send(`${target} has locked their offer in the trade with ${user}.`)
                        await database.Trade.update({locked: true}, {where: {player1ID: target.id, player2ID: uid}});
                        console.log("target locked");
                        tradeLocked.set(target.id, true);
                    }
                    if (tradeLocked.get(target.id) && tradeLocked.get(interaction.user.id)) {
                        await interaction.channel.send(`Both user has locked their offer.
Trade between ${user} and ${target} is now processing.
Allow up to 15 seconds for trade to be processed.`);
                        await checkAndTrade(interaction)
                        tradeLocked.delete(target.id);
                        tradeLocked.delete(uid);
                        tradeListing.delete(uid);
                        tradeListing.delete(target.id);
                    } else {
                        await tradeEmbed(embed, interaction);
                    }
                    //await checkAndTrade(interaction);
                    //
                    //locks cards 
                    break;

                case 'cancel':
                    collector.stop('stop');
                    await database.Trade.update({locked: false}, {where: {player1ID: target.id, player2ID: uid}});
                    await database.Trade.update({locked: false}, {where: {player1ID: uid, player2ID: target.id}});
                    tradeLocked.delete(target.id);
                    tradeLocked.delete(uid);
                    tradeListing.delete(uid);
                    tradeListing.delete(target.id);
                    await interaction.channel.send(`The Trade List Window for ${user} amd ${target} has been cancelled.`)
                    break;

                case 'refresh':
                    collector.stop('stop');
                    await tradeEmbed(embed, interaction);
                    break;
                
                case 'reset':
                    collector.stop('stop');
                    await resetTrade(interaction);
                    tradeLocked.delete(target.id);
                    tradeLocked.delete(uid);
                    tradeListing.delete(uid);
                    tradeListing.delete(target.id);
                    await interaction.channel.send(`The trade between ${user} and ${target} has been reset. All cards will be returned to their original InventoryID or your bottom of inventory.`)
                    break;
                
                default:
                    collector.stop('stop');
                    tradeLocked.delete(target.id);
                    tradeLocked.delete(uid);
                    tradeListing.delete(uid);
                    tradeListing.delete(target.id);
                    break;
            };
            i.deferUpdate();
        }
        );
        collector.on('end', (collected, reason) => {
            if (reason && reason === 'stop') {
                console.log('Not stop');
            } else {
                tradeLocked.delete(target.id);
                tradeLocked.delete(uid);
                tradeListing.delete(uid);
                tradeListing.delete(target.id);
                return interaction.followUp('Trade window disabled.')
            }
            
        })
    } catch(error) {
        tradeListing.delete(uid);
        tradeListing.delete(target.id);
        tradeLocked.delete(target.id);
        tradeLocked.delete(uid);
        console.log("Error has occured in button Manager");
    }
}

async function purplecard(card, ID) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    // const ID = card.inventoryID;
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
            console.log(cardString);
            return cardString
        } else {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            console.log(cardString);
            return cardString
        }
    } else {
        const lockstatus = '|';
        if (tag) {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + tag + charname + ` (#${inumber})`;
            console.log(cardString);
            return cardString
        } else {
            const cardString =`:purple_square:` + ID + ` ${lockstatus} ` + charname + ` (#${inumber})`;
            console.log(cardString);
            return cardString
        }
    }
}

async function redcard(card, ID) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    // const ID = card.inventoryID;
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

async function diacard(card, ID) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
    // const ID = card.inventoryID;
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

async function pinkcard(card, ID) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
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

async function azurcard(card, ID) {
    //ID| Rarity color block, tag,, charname  Imagenumber(if blue+) x quantity if more than 1 for whit-blue
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
        const cardString = `:diamond_shape_with_a_dot_inside:` + ID + ` | + ` + charname;
        console.log(cardString);
        return cardString;
    }
}

async function switchRarity(card, rarity, tradeID) {
    switch (rarity) {
        case 4:
            return purplecard(card, tradeID);

        case 5:
            return redcard(card, tradeID);
            //red
        case 6:
            return diacard(card, tradeID);

        case 7:
            return pinkcard(card, tradeID);

        case 9:
            return azurcard(card, tradeID);

        default:
            return "error";
            //wtf?
    }
}

async function makeList(list) {
    console.log(2.3);
    const listRef = [];
    for (let i = 0;i < list.length; i++) {
        //ID|Rarity ImageNumber Name Quantity if white, green or blue and there's more than 1.
        const card = await database.Card.findOne({where:{cardID: list[i].inventoryID}});//the inventoryID here is actually cardID.
        const rarity = await card.rarity;
        const cardString = await switchRarity(card, rarity, list[i].tradeID);
        listRef[i] = cardString;
        console.log(2.4);
    }
    return listRef;
}

async function listTrade(player1, player2) {
    console.log(2.1);
    let cardList;
    cardList = await database.Trade.findAll(
        {
            where: {
                player1ID: player1,
                player2ID: player2
        }}
    );
    console.log(2.2);
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    
    return fullList;
}

async function tradeEmbed(embed, interaction){
    
    console.log(2);
    const user = await interaction.user;
    console.log(user);
    const uid = await interaction.user.id;
    console.log(uid);
    const target = await interaction.options.getUser('targetuser');
    tradeListing.set(interaction.user.id, true);
    tradeListing.set(target.id, true);
    console.log(target);
    console.log(2.0);
    const list1 = await listTrade(uid, target.id);
    const list2 = await listTrade(target.id, uid);
    console.log(3);
    // const p1locked = await database.findOne({where: {
    //     player1ID: uid,
    //     player2ID: target.id,
    //     locked: true
    // }})
    // const p2locked = await database.findOne({where: {
    //     player1ID: uid,
    //     player2ID: target.id,
    //     locked: true
    // }})
    console.log(4);
    await embed.setTitle(`**Trade Window**`);
    await embed.setDescription(`**${user}'s trade offer**
${list1}


**${target}'s trade offer**
${list2}

*Both players must lock to proceed with the trade.*`);
    const row = await createButton();
    console.log(4);
    const msg = await interaction.editReply({embeds: [embed], components: [row], fetchReply: true});
    await buttonManager(embed, interaction, msg);
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
		.setName('tlist')
		.setDescription('Lists all items in trade with another player.')
        .addUserOption(option => 
            option
                .setName("targetuser")
                .setDescription("The person you want to trade with")
                .setRequired(true)
                ),
	async execute(interaction) {
        const target = await interaction.options.getUser('targetuser');
        if (target == interaction.user) {
            interaction.reply(`You can't trade with yourself. If you wish to organise your inventory try /lu`)
        }
        if (tradeListing.get(interaction.user.id)) {
            //the user is using a tradelist
            return await interaction.reply("There is an existing trade list window. Please complete or reset the trade.")
        } else {
            tradeListing.set(interaction.user.id, true);
            tradeListing.set(target.id, true);
            tradeLocked.delete(target.id);
            tradeLocked.delete(interaction.user.id);
        }
		const embed = embedSucess(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            console.log(1);
            await interaction.reply({embeds: [embed]});
            await tradeEmbed(embed, interaction);
        } catch (error) {
            tradeListing.delete(interaction.user.id);
            tradeListing.delete(target.id);
            return interaction.editReply("Error has occured");
        }
	},
};