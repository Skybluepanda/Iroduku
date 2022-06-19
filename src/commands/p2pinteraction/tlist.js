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
        const rarity = await list[i].rarity;
        const cardString = await switchRarity(list[i], rarity);
        listRef[i] = cardString;
    }
    return listRef;
}

async function listTrade(embed, interaction, page){
    const uid = '903935562208141323';
    let rarity = await interaction.options.getInteger("rarity");
    const orderOpt = await order(interaction)
    let cardList;
    let maxPage;
    if (rarity) {
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