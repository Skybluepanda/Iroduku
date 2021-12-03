const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edittag')
        .setDescription('Edits a tag')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your tag.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription("Description of your tag.")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Editing tag...');
        const tagName = interaction.options.getString('name');
        const tagDescription = interaction.options.getString('description');

        const affectedRows = await database.Tags.update({ description: tagDescription }, { where: { name: tagName } });

        if (affectedRows > 0) {
            return interaction.editReply(`Tag \`${tagName}\` was edited.`);
        }
        return interaction.editReply(`Could not find a tag with name \`${tagName}\`.`)
    },
};