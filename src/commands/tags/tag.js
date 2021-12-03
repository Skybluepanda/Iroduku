const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Finds a tag')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your tag.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Finding tag...');
        const tagName = interaction.options.getString('name');
        const tag = await database.Tags.findOne({ where: { name: tagName } });
        if (tag) {
            tag.increment('usage_count');
            return interaction.editReply(tag.get('description'));
        }
        return interaction.editReply(`Could not find tag: ${tagName}`);
    },
};