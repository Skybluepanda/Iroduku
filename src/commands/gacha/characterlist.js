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
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    
    return embed;
}

async function clistSwitch(embed, interaction){
    const subCommand = await interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            nameList(embed, interaction, 0);
            break;
        
        case "seriesid":
            sidList(embed, interaction, 0);
            break;
        
        case "seriesname":
            snameList(embed, interaction, 0);
            break;

        case "page":
            pageSearch(embed, interaction);
            break;
            
        default:
            interaction.reply("Please use the subcommands");
            break;
    }
}

async function deployReply(interaction, embed){
    const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle('PRIMARY'),
        );
    return await interaction.reply({ embeds: [embed], components: [row]});
}

function joinBar(character){
    return [character.characterID, character.characterName].join("| ");
}

async function nameList(embed, interaction, page){
    const name = await interaction.options.getString('name');
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page,
    where: {
        characterName: {[Op.like]: '%' + name + '%'}
    }}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    return await deployReply(interaction, embed);
};

async function pageSearch(embed, interaction) {
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
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page,}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    return await deployReply(interaction, embed);
};

async function sidList(embed, interaction, page){
    const series = await interaction.options.getInteger('sid');
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page,
    where: {
        seriesID: series,
    }}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    return await deployReply(interaction, embed);
};

async function snameList(embed, interaction, page){
    const series = await interaction.options.getString('sid');
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        offset: page,
    where: {
        seriesName: {[Op.like]: '%' + name + '%'}
    }}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    return await deployReply(interaction, embed);
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
                        .setName("name")
                        .setDescription("The series name you want to search with")
                        .setRequired(true)
                        )),
	async execute(interaction) {
        if (!interaction.options.getSubcommand()) {
            return interaction.reply("Error use subcommands.");
        }
        const embed = createEmbed(interaction);
        try {
            clistSwitch(embed, interaction);            
        } catch(error) {
            return interaction.reply("Error has occured");
        }
        
	}
};