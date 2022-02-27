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
        .setColor("AQUA")
    
    return embed;
}

async function checkPage(direction, page, maxPage) {
    if (direction == 1 && page == maxPage) {
        return 0;
    } else if (direction == -1 && page == 0) {
        return maxPage;
    } else {
        return page + direction;
    }
}

async function clistSwitch(embed, interaction, page){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            console.log(`name listing page ${page}`);
            nameList(embed, interaction, page);
            break;
        
        case "seriesid":
            sidList(embed, interaction, page);
            break;
        
        case "seriesname":
            snameList(embed, interaction, page);
            break;

        case "page":
            console.log(`listing page ${page}`);
            pageSearch(embed, interaction);
            break;
            
        default:
            interaction.reply("Please use the subcommands");
            break;
    }
}

async function clistSwitch2(embed, interaction, page){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            console.log(`name listing page ${page}`);
            nameList(embed, interaction, page);
            break;
        
        case "seriesid":
            sidList(embed, interaction, page);
            break;
        
        case "seriesname":
            snameList(embed, interaction, page);
            break;

        case "page":
            console.log(`listing page ${page}`);
            pageList(embed, interaction, page);
            break;
            
        default:
            interaction.reply("Please use the subcommands");
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
                    console.log(prevPage);
                    await clistSwitch2(embed, interaction, prevPage);
                    break;
                
                case 'next':
                    const nextPage = await checkPage(1, page, maxPage);
                    console.log(nextPage);
                    await clistSwitch2(embed, interaction, nextPage);
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

function joinBar(character){
    return [character.characterID, character.characterName].join("| ");
}

async function nameList(embed, interaction, page){
    const name = await interaction.options.getString('name');
    const maxPage =  Math.floor(await database.Character.count({
        where: {
            characterName: {[Op.like]: '%' + name + '%'}
    }}
        )/20);
    console.log(maxPage);
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
            order: ['characterID'],
            limit: 20,
            offset: page*20,
        where: {
            characterName: {[Op.like]: '%' + name + '%'}
        }}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    await embed.setFooter(`page ${page+1} of ${maxPage+1}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function pageSearch(embed, interaction, page) {
    if (interaction.options.getInteger('page')) {
        const page = await interaction.options.getInteger('page')
        pageList(embed, interaction, page);
        
    } else {
        //Show page 1
        pageList(embed, interaction, 0)
    }
}

async function pageList(embed, interaction, page){
    //use page for pages
    const maxPage =  Math.floor(await database.Character.count()/20);
    await console.log(maxPage);
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page*20,}
        );
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    await embed.setFooter(`page ${page+1} of ${maxPage+1}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function sidList(embed, interaction, page){
    const series = await interaction.options.getInteger('sid');
    const maxPage =  Math.floor(await database.Character.count(
        {where: {
        seriesID: series,
    }}
        )/20);
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page*20,
    where: {
        seriesID: series,
    }}
        );
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    await embed.setFooter(`page ${page+1} of ${maxPage+1}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
};

async function snameList(embed, interaction, page){
    const name = await interaction.options.getString('sname');
    const maxPage =  Math.floor(await database.Character.count(
        {where: {
        seriesName: {[Op.like]: '%' + name + '%'}
    }}
        )%20);
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page*20,
    where: {
        seriesName: {[Op.like]: '%' + name + '%'}
    }}
        );
    if (maxPage > 0) {
        deployButton(interaction, embed);
    }
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    await embed.setFooter(`page ${page+1} of ${maxPage+1}`);
    const msg = await updateReply(interaction, embed);
    await buttonManager(embed, interaction, msg, page, maxPage)
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
		.setName('clist')
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
                        .setDescription("The page you want to open.")
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("seriesid")
                .setDescription("Search by series id. ")
                .addIntegerOption(option => 
                    option
                        .setName("sid")
                        .setDescription("The series ID you want to search with")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("seriesname")
                .setDescription("Search by series name. ")
                .addStringOption(option => 
                    option
                        .setName("sname")
                        .setDescription("The series name you want to search with")
                        .setRequired(true)
                        )),
	async execute(interaction) {
        if (!interaction.options.getSubcommand()) {
            return interaction.reply("Error use subcommands.");
        }
        const embed = createEmbed(interaction);
        
        try {
            await interaction.reply({embeds: [embed]});
            clistSwitch(embed, interaction, 0);            
        } catch(error) {
            return interaction.reply("Error has occured");
        }
        
	}
};