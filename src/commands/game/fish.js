const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Try to catch one fish'),
    async execute(interaction) {
        await interaction.reply('fishing one...');
        const username = interaction.user.id;
        const userId = interaction.user.username;
        // chance calculation
        var succeedChance = 0.5;
        if (Math.random() < succeedChance) {
            // fish caught!
            return interaction.editReply("One fish caught!");
            // add the fish to database here
        }
        // failed
        return interaction.editReply("No fish caught :(");
        // TODO: maybe randomize the failed message
    },
};