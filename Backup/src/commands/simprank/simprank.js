const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const { MessageActionRow, MessageButton } = require('discord.js');

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Listing Series")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("List of Series")
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

function joinBar(series){
    const alias = series.alias;
    if (alias) {
        const serieslist = series.seriesID + " | " + series.seriesName + " - " + alias;
        return serieslist;
    } else {
        const serieslist = series.seriesID + " | " + series.seriesName + " - No alias set"
        return serieslist
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


async function buttonManager1(embed, interaction, msg, page, maxPage, name) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    const prevPage = await checkPage(-1, page, maxPage);
                    await nameList(embed, interaction, name, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await nameList(embed, interaction, name,nextPage);
                    break;
                
                case 'empty':
                    await emptyList(embed, interaction);
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
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 60000 });
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
        console.log("Error has occured in button Manager");
    }
}

async function nameList(embed, interaction, name, page){
    const list = await database.Series.findAll(
        {
        order: ['seriesID'],
        limit: 20,
        offset: (page-1)*20,
    where: {
        seriesName: {[Op.like]: '%' + name + '%'},
    }}
        );
    const maxPage = Math.ceil(await database.Series.count(
        {
        order: ['seriesID'],
    where: {
        seriesName: {[Op.like]: '%' + name + '%'},
    }}
        )/20);
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    await embed.setFooter(`page ${page} of ${maxPage}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager1(embed, interaction, msg, page, maxPage);
};

async function pageList(embed, interaction, page){
    //use page for pages
    const list = await database.Series.findAll(
        {
        order: ['seriesID'],
        limit: 20,
        offset: (page-1)*20}
        );
    const maxPage = Math.ceil(await database.Series.count(
        {
        order: ['seriesID'],}
        )/20);
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    await embed.setFooter(`page ${page} of ${maxPage}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager2(embed, interaction, msg, page, maxPage);
};


//SHIT DOESN"T FUCKING WORK
// async function emptyList(embed, interaction){
//     //use page for pages
//     const allSeries = await database.Series.findAll();
//     let emptySeries;
//     for (let i = 0; i < allSeries.length; i++) {
//         const charCount = await database.Character.count({
//             where: {seriesID: allSeries[i].seriesID}
//         })
//         if (charCount == 0) {
//             emptySeries.push(allSeries[i]);
//         }
//     }
//     const listString = await emptySeries.map(joinBar).join(`\n`);
//     await embed.setDescription(`${listString}`);
//     const msg = await updateReply(interaction, embed);
// };

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
		.setName('simpleaderboard')
		.setDescription('Leaderboard of simps')
        .addIntegerOption(option => 
            option
                .setName("cid")
                .setDescription("Cid to search simp leaderboard of a specific character.")
                .setRequired(true)
                ),
	async execute(interaction) {
		const embed = createEmbed(interaction);
		
        try {
        } catch (error) {
            return interaction.channel.send(`Error Occurred\n${error}`);
        }
	},
};