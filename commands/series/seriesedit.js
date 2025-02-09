const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');

async function selectOption(interaction) {
    const id = interaction.options.getInteger('id');
    if (interaction.options.getSubcommand() === "name") {
        const name = interaction.options.getString('name');
        await database.Series.update({ seriesName: name }, { where: { seriesID: id } });
        return interaction.reply(`Series ${id} name was edited to ${name}. Check to see if it worked.`);
    } else if (interaction.options.getSubcommand() === "link") {
        const mal = interaction.options.getString('link');
        await database.Series.update({ malLink: mal }, { where: { seriesID: id } });
        return interaction.reply(`Series ${id} link was edited to ${mal}. Check to see if it worked.`);
    } else if (interaction.options.getSubcommand() === "alias") {
        const alias = interaction.options.getString('alias');
        await database.Series.update({ alias: alias }, { where: { seriesID: id } });
        return interaction.reply(`Series ${id} alias was edited to ${alias}. Check to see if it worked.`);
    } else if (interaction.options.getSubcommand() === "category") {
        const category = interaction.options.getString('category');
        await database.Series.update({ category: category }, { where: { seriesID: id } });
        return interaction.reply(`Series ${id} category was edited to ${category}. Check to see if it worked.`);
    }
    return await interaction.reply(`Could not find series with id ${id}`);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sedit')
		.setDescription('Edits Series Details')
        .addSubcommand(subcommand => 
            subcommand
                .setName("name")
                .setDescription("Edit the name of the series.")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name of the series")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand => 
            subcommand
                .setName("alias")
                .setDescription("Edit the name of the series.")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("alias")
                        .setDescription("The alias of the series")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("link")
                .setDescription("Edit the link of the series")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addStringOption(option => 
                    option
                        .setName("link")
                        .setDescription("The link of the series")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("category")
                .setDescription("Edit the category of the series")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the series")
                        .setRequired(true)
                        )
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('category of the series')
                        .setRequired(true)
                        .addChoice('Anime', 'Anime')
                        .addChoice('Game', 'Game')
                        .addChoice('Vtuber', 'Vtuber')
                        .addChoice('Others', 'Others'))),
	async execute(interaction) {
        try {
            if (!interaction.member.roles.cache.has('947640601564819516')) {
                embedError.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the librarian role!");
                return interaction.reply({ embeds: [embedError] }, {ephemeral: true});
            };
            if (interaction.channel.id === '947136227126177872') {
                await selectOption(interaction, database)
            } else {
                interaction.reply("Please use #series and characters channel for this command.")
            }
        } catch (error) {
            return interaction.followUp(`Error has occured, report to a dev if it reoccurs.`);
        }
        
	},
};