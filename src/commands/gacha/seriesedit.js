const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');

async function selectOption(interaction) {
    const id = interaction.options.getInteger('id');
    if (interaction.options.getSubcommand() === "name") {
        const name = interaction.options.getString('name');
        await database.Series.update({ seriesName: name }, { where: { seriesID: id } });
        return interaction.editReply(`Series ${id} name was edited to ${name}. Check to see if it worked.`);
    } else if (interaction.options.getSubcommand() === "link") {
        const mal = interaction.options.getString('link');
        await database.Series.update({ malLink: mal }, { where: { seriesID: id } });
        return interaction.editReply(`Series ${id} name was edited to ${link}. Check to see if it worked.`);
    }
    return await interaction.editReply(`Could not find series with id ${id}`);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sedit')
		.setDescription('Replies with Pong!')
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
        await interaction.reply('Editing series...');
        const id = interaction.options.getInteger('id');
        try {
            await selectOption(interaction, database)
        } catch (error) {
            return interaction.editReply(`Error has occured, report to a dev if it reoccurs.`);
        }
	},
};