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
                .addChoice('main',1)
                .addChoice('side',2)
                .addChoice('extras',3)
                ),
	async execute(interaction) {
		const user = interaction.user.id;
        
        const rank = await interaction.options.getInteger('rank');
        if (rank == 1) {
            await database.Trashon.destroy({where: {playerID: user}});
            await database.Sideson.destroy({where: {playerID: user}});
            return await interaction.reply("Main pool toggled on.");
        } else if (rank == 2) {
            const exist = await database.Sideson.findOne({where: {playerID: user}});
            if (exist) {
                return await interaction.reply("Side pool is already toggled.");
            } else {
                await database.Trashon.destroy({where: {playerID: user}});
                await database.Sideson.create({
                    playerID: user
                });
                return await interaction.reply("Side pool toggled on."); 
            } 
        } else if (rank == 3) {
            const exist = await database.Trashon.findOne({where: {playerID: user}});
            if (exist) {
                return await interaction.reply("Side pool is already toggled.");
            } else {
                await database.Sideson.destroy({where: {playerID: user}});
                await database.Trashon.create({
                    playerID: user
                });
                return await interaction.reply("Extras pool toggled on.");
            }
        }
	},
};
