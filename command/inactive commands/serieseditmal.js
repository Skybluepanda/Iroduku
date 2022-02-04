const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../src/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('smaledit')
        .setDescription('Edits a series mal link')
        .addIntegerOption(option => 
            option.setName('id')
                .setDescription('Id of the series')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mal')
                .setDescription("Link of the series")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Editing series...');
        const id = interaction.options.getInteger('id');
        const mal = interaction.options.getString('mal');

        const affectedRows = await database.Series.update({ malLink: mal }, { where: { seriesID: id } });

        if (affectedRows > 0) {
            return interaction.editReply(`Series ${id} was edited to ${mal}`);
        }
        return interaction.editReply(`Could not find series with id ${id}`);
    },
};