const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtag')
        .setDescription('Adds a tag')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your tag.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription("Description of your tag.")
                .setRequired(true)),
    async execute(interaction) {
        await interaction.reply('Adding tag...');
        const tagName = interaction.options.getString('name');
        const tagDescription = interaction.options.getString('description');
        try {
            const tag = await database.Tags.create({
                name: tagName,
                description: tagDescription,
                username: interaction.user.username,
            });
            return interaction.editReply(`Tag ${tag.name} added!`);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply(`The tag \`${tagName}\` already exists.`);
            }
            return interaction.editReply('Something went wrongt with adding a tag.');
        }
    },
};