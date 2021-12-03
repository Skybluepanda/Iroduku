const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removetag')
        .setDescription('Removes a tag')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your tag.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Removing tag...');
        const tagName = interaction.options.getString('name');
        const rowCount = await database.Tags.destroy({ where: { name: tagName } });
        if (!rowCount) {
            return interaction.editReply('That tag did not exist.');
        }
        return interaction.editReply('Tag deleted.');
    },
};