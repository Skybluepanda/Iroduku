const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Try to catch one fish'),
    async execute(interaction) {
        await interaction.reply('fishing one...');
        const username = interaction.user.username;
        const userId = interaction.user.id;
        const player = await database.Player.findOne({ where: { playerID: userId } })
        console.log(player);
        if (player) {
            // chance calculation
            var succeedChance = 0.5;
            if (Math.random() < succeedChance) {
                // add the fish to database here
                player.increment('fish', { by: 1 });
                // remove hunger here
                player.increment('hunger', { by: -1 });
                // do death checking here
                if (player.hunger <= 0) {
                    // player is dead
                }
                // fish caught!
                return interaction.editReply(`One fish caught!\nFish count: ${player.fish+1}`);

            }
            // failed
            return interaction.editReply("No fish caught :(");
            // TODO: maybe randomize the failed message
        }
        // player doesn't exist
        return interaction.editReply("Player doesn't exist.");
    },
};