const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('showtags')
        .setDescription('Shows all tags'),
    async execute(interaction) {
        await interaction.reply('Showing all tags...');
        const tagList = await database.Tags.findAll({ attributes: ['name'] });
        const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';

        return interaction.editReply(`List of tags: ${tagString}`);
    },
};