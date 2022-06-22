const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');

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

async function updateReply(interaction, embed){
    return await interaction.editReply({embeds: [embed]});
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
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('reset')
                .setLabel('reset')
                .setStyle('PRIMARY'),
        );
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function buttonManager(embed, interaction, msg) {
    try {
        const target = await interaction.options.getUser('targetuser');
        const filter = i => i.user.id == (interaction.user.id || target.id);
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'lock':
                    await tradeEmbed(embed, interaction);
                    //locks cards 
                    break;

                case 'refresh':
                    await tradeEmbed(embed, interaction);
                    break;
                
                case 'reset':
                    await resetTrade(embed, interaction);
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

async function switchRarity(card, rarity) {
    switch (rarity) {
        case 4:
            return purplecard(card);

        case 5:
            return redcard(card);
            //red
        case 6:
            return diacard(card);

        case 7:
            return pinkcard(card);

        default:
            return "error";
            //wtf?
    }
}

async function makeList(list) {
    const listRef = [];
    for (let i = 0;i < list.length; i++) {
        //ID|Rarity ImageNumber Name Quantity if white, green or blue and there's more than 1.
        const card = await database.Card.findOne({where:{cardID: inventoryID}});//the inventoryID here is actually cardID.
        const rarity = await list[i].rarity;
        const cardString = await switchRarity(card, rarity);
        listRef[i] = cardString;
    }
    return listRef;
}

async function listTrade(player1, player2) {
    let cardList;
    cardList = await database.Trade.findAll(
        {
            where: {
                player1ID: player1,
                player2ID: player2
        }}
    );
    const listString = await makeList(cardList);
    const fullList = await listString.join(`\n`);
    return fullList;
}

async function tradeEmbed(embed, interaction){
    const user = await interaction.user
    const uid = await interaction.user.id;
    const target = await interaction.options.getUser('targetuser');
    const list1 = await listTrade(user, target.id);
    const list2 = await listTrade(target.id, uid);
    const p1locked = await database.findOne({where: {
        player1ID: uid,
        player2ID: target.id,
        locked: true
    }})
    const p2locked = await database.findOne({where: {
        player1ID: uid,
        player2ID: target.id,
        locked: true
    }})
    await embed.setTitle(`**Trade between ${user} and ${target}**`);
    await embed.setDescription(`**${user}'s trade offer**
${list1}

**${target}'s trade offer**
${list2}

*Both players must lock to proceed with the trade.*`);
    await embed.setFooter(`page ${page} of ${totalPage} | ${maxPage} results found`);
    const row = await createButton();
    const msg = await updateReply({embeds: [embedCard], components: [row], fetchReply: true});
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
		const embed = embedSucess(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        //rarity filter
        //
        try {
            await interaction.reply({embeds: [embed]});
            await listTrade(interaction);
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};