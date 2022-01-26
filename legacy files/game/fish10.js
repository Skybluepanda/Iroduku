
const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish10')
        .setDescription('Try to catch ten fish'),
    async execute(interaction) {
        await interaction.reply('fishing ten...');
        const username = interaction.user.id;
        const userId = interaction.user.username;
        // chance calculation
        var succeedChance = 0.5;
        var totalCaught = 0;
        for (let i = 0; i < 10; ++i) {
            if (Math.random() < succeedChance) {
                // fish caught!
                ++totalCaught;
            } else {
                // failed
            }
            // TODO: modify chance here (perhaps lower it)
        }
        // TODO: add caught fish to database here

        if (totalCaught > 0) {
            return interaction.editReply(`${totalCaught} fish caught!`)
        }
        // failed
        return interaction.editReply("No fish caught :(");
    },
};