const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild, Message } = require('discord.js');
const { Op } = require("sequelize");
const { MessageActionRow, MessageButton } = require('discord.js');

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

async function clistSwitch(embed, interaction, page){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            nameList(embed, interaction, page);
            break;
        
        case "sid":
            sidList(embed, interaction, page);
            break;

        case "rank":
            rankList(embed, interaction, page);
            break;
        

        case "page":
            pageSearch(embed, interaction);
            break;

        case "sname":
            snameList(embed, interaction, page);
            break;

        case "np":
            nopicList(embed, interaction, page);
            break;
    }
}

async function clistSwitch2(embed, interaction, page){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            nameList(embed, interaction, page);
            break;
        
        case "sid":
            sidList(embed, interaction, page);
            break;

        case "rank":
            rankList(embed, interaction, page);
            break;

        case "page":
            pageList(embed, interaction, page);
            break;

        case "sname":
            snameList(embed, interaction, page);
            break;

        case "np":
            nopicList(embed, interaction, page);
            break;
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
                    await clistSwitch2(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    await clistSwitch2(embed, interaction, nextPage);
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
    // const series = await database.Series.findOne({where: {seriesID: character.seriesID}});
    const charlist = character.characterID + " | " + character.characterName + " [" + character.rank+ "]";
    // if (series) {
    //      - " + series.alias;
    // } else {
    //     charlist = character.characterID + " | " + character.characterName + " [" + character.rank+ "] - No series alias set";
    // }
    //CID | Cname -Rank- Series shortened
    return charlist;
}

async function nameList(embed, interaction, page){
    const name = await interaction.options.getString('name');
    const maxPage =  Math.ceil(await database.Character.count({
        where: {
            characterName: {[Op.like]: '%' + name + '%'}
    }}
        )/20);
    if (maxPage > 1) {
        deployButton(interaction, embed);
    }
    const list = await database.Character.findAll(
        {
            order: ['characterID'],
            limit: 20,
            offset: (page-1)*20,
        where: {
            characterName: {[Op.like]: '%' + name + '%'}
        }}
        );

    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Character.count({where: {
        characterName: {[Op.like]: '%' + name + '%'}
    }});
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function pageSearch(embed, interaction, page) {
    if (interaction.options.getInteger('page')) {
        const page = await interaction.options.getInteger('page')
        pageList(embed, interaction, page);
        
    } else {
        //Show page 1
        pageList(embed, interaction, 1)
    }
}

async function pageList(embed, interaction, page){
    const list = await database.Character.findAll(
        {
        order: ['characterID'],
        limit: 20,
        offset: (page-1)*20});
    const maxPage =  Math.ceil(await database.Character.count()/20);
    
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Character.count();
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function rankList(embed, interaction, page){
    const rank = await interaction.options.getInteger('rank');
    const list = await database.Character.findAll(
        {
        order: [['final', 'DESC']],
        limit: 20,
        offset: (page-1)*20,
        where: {
            rank: rank
        }});
    const maxPage =  Math.ceil(await database.Character.count({where: {
        rank: rank
    }})/20);
    
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Character.count({where: {
        rank: rank
    }});
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function nopicList(embed, interaction, page){
    //use page for pages
    const maxPage =  Math.ceil(await database.Character.count({where: {imageCount: 0}})/20);
    const list = await database.Character.findAll(
        {
        order: [['final', 'DESC']],
        limit: 20,
        offset: (page-1)*20,
        where: {imageCount: {[Op.lt]: 10}}},
        );
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`Characters without any images\n${listString}`);
    const total = await database.Character.count({where: {imageCount: 0}});
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function sidList(embed, interaction, page){
    const series = await interaction.options.getInteger('sid');
        
    const maxPage =  Math.ceil(await database.Character.count(
        {where: {
        seriesID: series,
    }}
        )/20);
    const list = await database.Character.findAll(
        {
        order: ['characterID'],
        limit: 20,
        offset: (page-1)*20,
    where: {
        seriesID: series
    }}
    );
    
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listMap = await list.map(joinBar);
    const listString = await listMap.join(`\n`);
    await embed.setDescription(`${listString}`);
    const total = await database.Character.count({where: { seriesID: series}});
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function snameList(embed, interaction, page){
    const name = await interaction.options.getString('sname');
    const seriesList = await database.Series.findAll({
    where: {
        seriesName: {[Op.like]: '%' + name + '%'},
    }}
        );
    var sidList = [];
    for (let i = 0; i < seriesList.length; i++) {
        const sid = seriesList[i].seriesID;
        sidList[i] = sid;
    }
    const list = await database.Character.findAll(
        {
        order: ['characterID'],
        limit: 20,
        offset: (page-1)*20,
    where: {
        seriesID: {[Op.or]: sidList}
    }}
    );
    
    const total = await database.Character.count({
        where: {
            seriesID: {[Op.or]: sidList}
    }});
    const maxPage = Math.ceil(total/20);
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listMap = await list.map(await joinBar);
    const listString = await listMap.join(`\n`);
    
    await embed.setDescription(`${listString}`);
    await embed.setFooter({text: `page ${page} of ${maxPage} | ${total} results found`});
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage);
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
		.setName('cl')
		.setDescription('Shows a list of characters')
        .addSubcommand(subcommand => 
            subcommand
                .setName("name")
                .setDescription("Search by name of characters")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("Lists characters that have the same name.")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("page")
                .setDescription("Lists pages of characters with no filter. ")     
                .addIntegerOption(option => 
                    option
                        .setName("page")
                        .setDescription("The page you want to open.")))
        .addSubcommand(subcommand =>
            subcommand
                .setName("sid")
                .setDescription("Search by series id. ")
                .addIntegerOption(option => 
                    option
                        .setName("sid")
                        .setDescription("The series ID you want to search with")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("sname")
                .setDescription("Search by series name. ")
                .addStringOption(option => 
                    option
                        .setName("sname")
                        .setDescription("The series name you want to search with")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("rank")
                .setDescription("Search by rank. ")
                .addIntegerOption(option => 
                    option
                        .setName("rank")
                        .setDescription("The rank you want to list.")
                        .setRequired(true)
                        .addChoice('main', 1)
                        .addChoice('side', 2)
                        .addChoice('trash', 3)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("np")
                .setDescription("Shows characters with 0 images.")),
	async execute(interaction) {
        if (!interaction.options.getSubcommand()) {
            return interaction.reply("Error use subcommands.");
        }
        const embed = createEmbed(interaction);
        
        try {
            await interaction.reply({embeds: [embed]});
            clistSwitch(embed, interaction, 1);            
        } catch(error) {
            return interaction.reply("Error has occured");
        }
        
	}
};