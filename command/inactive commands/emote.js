const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../src/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emopte')
        .setDescription('returns a emote')
        .addStringOption(option => 
            option.setName('emote')
                .setDescription('the emote')
                .setRequired(true)),
    async execute(interaction) {
        const emote = await interaction.options.getString('emote')
        await interaction.reply(emote);
    },
};