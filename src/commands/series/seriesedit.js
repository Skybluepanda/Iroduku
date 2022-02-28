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
        return interaction.reply(`Series ${id} name was edited to ${link}. Check to see if it worked.`);
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
                        )),
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