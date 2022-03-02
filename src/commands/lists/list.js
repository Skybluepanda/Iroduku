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
                .setLabel('Previous')
                .setStyle('PRIMARY'),
            new MessageButton()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle('PRIMARY'),
        );
    await interaction.editReply({ embeds: [embed], components: [row]});
}

async function buttonManager(embed, interaction, msg, page, maxPage, name) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await list(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await list(embed, interaction, nextPage);
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
        const lid = await list[i].inventoryID;
        const cid = await list[i].characterID;
        const rarity = await list[i].rarity;
        const cardString = await switchRarity(list[i], rarity);
        listRef[i] = cardString;
    }
    return listRef;
}

async function list(embed, interaction, page){
    const uid = await interaction.user.id;
    const list = await database.Card.findAll(
        {
            order: ['inventoryID'],
            limit: 20,
            offset: (page-1)*20,
            where: {
                playerID: uid,
                
            }
        }
        );
    const maxPage = Math.ceil(await database.Card.count(
        {
            where: {
                playerID: uid,
            }
        })/20);
    if (maxPage > 1) {
        await deployButton(interaction, embed);
    }
    const listString = await makeList(list);
    const fullList = await listString.join(`\n`);
    await embed.setDescription(`**List of ${interaction.user.username} Cards**\n${fullList}`);
    await embed.setFooter(`page ${page} of ${maxPage}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('The most basic list command, it shows your inventory in inventory order.'),
	async execute(interaction) {
		const embed = embedSucess(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        try {
            await interaction.reply({embeds: [embed]});
            await list(embed, interaction, 1);
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};