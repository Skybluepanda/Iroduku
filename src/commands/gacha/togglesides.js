const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const color = require('../../color.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('togglesides')
		.setDescription('Turns on or off the ability to gacha series 37.'),
	async execute(interaction) {
		const user = interaction.user.id;
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
	},
};
