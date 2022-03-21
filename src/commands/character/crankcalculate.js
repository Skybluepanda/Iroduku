const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Message } = require('discord.js');
const { Op } = require("sequelize");
const { MessageActionRow, MessageButton } = require('discord.js');

const color = require('../../color.json');

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Characters")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("List of Characters")
        .setColor("#00ecff")
    
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

async function buttonManager(embed, interaction, msg, page, maxPage) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await pageList(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await pageList(embed, interaction, nextPage);
                    break;
                
                default:
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
    }
}

function joinBar(character){
    return [character.characterID, character.characterName].join(" | ");
}

async function pageList(embed, interaction, page){
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName', 'seriesID'],
        order: [['final', 'DESC']],
        limit: 20,
        offset: (page-1)*20});
    const maxPage =  Math.ceil(await database.Character.count()/20);
    
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Character.count();
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function calcRank(interaction) {
    console.log("Start calcRank")
    const allchars = await database.Character.findAll();
    console.log(allchars.length);
    for (let i = 0; i < allchars.length; i++) {
        if (allchars[i].votes >= 10) {
            const wishcount = await database.Wishlist.count({where: {characterID: allchars[i].characterID}});
            const final = await ((allchars[i].score + 2 * wishcount)/allchars[i].votes)
            await database.Character.update({final: final}, {where: {characterID: allchars[i].characterID}});
        } else {
            await database.Character.update({final: 0}, {where: {characterID: allchars[i].characterID}});
        }
    }
}

async function assignRank(interaction) {
    console.log("Start assignRank")
    const mains = await database.Character.findAll({
        order: [['final', 'DESC']],
        limit: 100
    });
    const sides = await database.Character.findAll({
        order: [['final', 'DESC']],
        offset: 100,
        where: {final: {[Op.gt]: 0.5}}
    });
    const trash = await database.Character.findAll({
        order: [['final', 'DESC']],
        where: {final: {[Op.lte]: 0.5}}
    });
    for (let i = 0; i < mains.length; i++) {
        await database.Character.update({rank: 1}, {where: {characterID: mains[i].characterID}}) 
    }
    for (let i = 0; i < sides.length; i++) {
        await database.Character.update({rank: 2}, {where: {characterID: sides[i].characterID}}) 
    }
    for (let i = 0; i < trash.length; i++) {
        await database.Character.update({rank: 3}, {where: {characterID: trash[i].characterID}}) 
    }
}

async function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor(color.failred);
    return embedError;
};

/**
 * Listing series
 * Options
 * Name search
 * List all with buttons.
 * Lets say list 20 items per embed
 * Next page, previous page, go to specific page.
 * 
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('crankcalc')
		.setDescription('Ranks characters by votes and wishlist and lists changes.'),
	async execute(interaction) {
        const embed = createEmbed(interaction);
        const embedE = await embedError(interaction);
        
        try {
            if (!interaction.member.roles.cache.has('951960607324766259')) {
            embedE.setTitle("Insufficient Permissions")
                .setDescription("You don't have the Chief Librarian role!");
            return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
        };
            await interaction.reply({embeds: [embed]});
            await calcRank(interaction);
            await assignRank(interaction)
            await pageList(embed, interaction, 1);            
        } catch(error) {
            return interaction.reply("Error has occured");
        }
        
	}
};