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
    return [series.seriesID, series.seriesName].join(" | ");
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


async function buttonManager1(embed, interaction, msg, page, maxPage, name) {
    try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
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
        console.log("Error has occured in button Manager");
    }
}

async function nameList(embed, interaction, name, page){
    const list = await database.Series.findAll(
        {attributes: ['seriesID', 'seriesName'],
        order: ['seriesID'],
        limit: 20,
        offset: (page-1)*20,
    where: {
        seriesName: {[Op.like]: '%' + name + '%'},
    }}
        );
    const maxPage = Math.ceil(await database.Series.count(
        {attributes: ['seriesID', 'seriesName'],
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
        {attributes: ['seriesID', 'seriesName'],
        order: ['seriesID'],
        limit: 20,
        offset: (page-1)*20}
        );
    const maxPage = Math.ceil(await database.Series.count(
        {attributes: ['seriesID', 'seriesName'],
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
		.setName('slist')
		.setDescription('Shows a list of series')
        .addSubcommand(subcommand => 
            subcommand
                .setName("name")
                .setDescription("Search by name of series")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("Lists series that have the same name.")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("page")
                .setDescription("Lists pages of series with no filter. ")
                .addIntegerOption(option => 
                    option
                        .setName("page")
                        .setDescription("The page you want to open.")
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("empty")
                .setDescription("Lists empty series. ")),
	async execute(interaction) {
		const embed = createEmbed(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
        try {
            
            await interaction.reply({embeds: [embed]});
            
            if (interaction.options.getSubcommand() === "name") {
                const name = await interaction.options.getString('name')
                nameList(embed, interaction, name, 1);
                
                //do name here
            } else if (interaction.options.getSubcommand() === "page") {
                //No filters counts all items in database then splits them
                //into pages then depending on option view page.
                //Also add buttons to navigate between pages or to choose
                //a number for the page.
                if (interaction.options.getInteger('page')) {
                    const page = await interaction.options.getInteger('page')
                    pageList(embed, interaction, page);
                    
                } else {
                    //Show page 1
                    pageList(embed, interaction, 1);
                    
                    
                }
            }
        } catch (error) {
            return interaction.editReply("Error has occured");
        }
	},
};