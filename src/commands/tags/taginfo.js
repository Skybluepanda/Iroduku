const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('taginfo')
        .setDescription('Displays information about a tag')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your tag.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Finding tag...');
        const tagName = interaction.options.getString('name');
        const tag = await database.Tags.findOne({ where: { name: tagName } });
        if (tag) {
            return interaction.editReply(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
        }
        return interaction.editReply(`Could not find tag: ${tagName}`);
    },
};