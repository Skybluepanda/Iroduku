const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('togglegacha')
		.setDescription('Turns on or off the ability to gacha certain ranks of characters.')
        .addIntegerOption(option => 
            option
                .setName("rank")
                .setDescription("The rank you want to toggle.")
                .setRequired(true)
                .addChoice('side',2)
                .addChoice('extras',3)
                ),
	async execute(interaction) {
		const user = interaction.user.id;
        
        const rank = await interaction.options.getInteger('rank');
        if (rank == 2) {
            const exist = await database.Sideson.findOne({where: {playerID: user}});
            if (exist) {
                await exist.destroy();
                return await interaction.reply("Sides are now turned off for your gacha");
            } else {
                await database.Sideson.create({
                    playerID: user
                });
                return await interaction.reply("Sides are now turned on for your gacha"); 
            } 
        } else if (rank == 3) {
            const exist = await database.Trashon.findOne({where: {playerID: user}});
            if (exist) {
                await exist.destroy();
                return await interaction.reply("Extras are now turned off for your gacha");
            } else {
                await database.Trashon.create({
                    playerID: user
                });
                return await interaction.reply("Extras are now turned on for your gacha");
            }
        }
	},
};
