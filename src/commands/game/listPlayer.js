const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerlist')
        .setDescription('Shows list of players'),
    async execute(interaction) {
        await interaction.reply('Showing all players...');
        const playerList = await database.Player.findAll({ attributes: ['name'] });
        const playerString = playerList.map(p => p.name).join(', ') || 'No tags set.';

        return interaction.editReply(`List of tags: ${playerString}`);
    },
};