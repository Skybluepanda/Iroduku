const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");

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
        .setColor("AQUA")
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    
    return embed;
}

function joinBar(series){
    return [series.seriesID, series.seriesName].join("| ");
}

async function nameList(embed, interaction, name, page){
    const min = ((page - 1) * 20) + 1;
    const max = (page * 20);
    const list = await database.Series.findAll(
        {attributes: ['seriesID', 'seriesName'],
        order: ['seriesID'],
    where: {
        seriesName: {[Op.like]: '%' + name + '%'},
        seriesID: {[Op.between]: [min, max]}
    }}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    return await interaction.reply({ embeds: [embed]});
};

async function pageList(embed, interaction, page){
    //use page for pages
    const min = ((page - 1) * 20) + 1;
    const max = (page * 20);
    const list = await database.Series.findAll(
        {attributes: ['seriesID', 'seriesName'],
        order: ['seriesID'],
    where: {
        seriesID: {[Op.between]: [min, max]}
    }}
        );
    const listString = await list.map(joinBar).join(`\n`);
    await embed.setDescription(`${listString}`);
    return await interaction.reply({ embeds: [embed]});
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
                        )),
	async execute(interaction) {
		const embed = createEmbed(interaction);
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
		if (interaction.options.getSubcommand() === "name") {
            const name = await interaction.options.getString('name')
            return nameList(embed, interaction, name, 1);
			//do name here
		} else if (interaction.options.getSubcommand() === "page") {
            //No filters counts all items in database then splits them
            //into pages then depending on option view page.
            //Also add buttons to navigate between pages or to choose
            //a number for the page.
			if (interaction.options.getInteger('page')) {
				const page = await interaction.options.getInteger('page')
				return pageList(embed, interaction, page);
			} else {
				//Show page 1
                //
                return pageList(embed, interaction, 1);
                
			}

			return interaction.reply(`You tried to do page search but it doesn't work yet.`)
		}
        
        const id = interaction.options.getInteger('id');
        try {
            await selectOption(interaction, database)
        } catch (error) {
            return interaction.editReply(`Error has occured, report to a dev if it reoccurs.`);
        }
	},
};