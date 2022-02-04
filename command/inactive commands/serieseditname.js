const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snameedit')
        .setDescription('Edits a series name')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('Id of the series')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('name')
                .setDescription("Name of the series")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Editing series...');
        const id = interaction.options.getInteger('id');
        const name = interaction.options.getString('name');

        const affectedRows = await database.Series.update({ seriesName: name }, { where: { seriesID: id } });

        if (affectedRows > 0) {
            return interaction.editReply(`Series ${id} was edited to ${name}`);
        }
        return interaction.editReply(`Could not find series with id ${id}`);
    },
};