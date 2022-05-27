const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');
const { Op } = require("sequelize");
const color = require('../../color.json');
const { MessageActionRow, MessageButton } = require('discord.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('lupdate')
		.setDescription('Moves a card to another inventory ID.')
        .addIntegerOption(option => 
            option
                .setName("startlid")
                .setDescription("The inventory id of the card you want to move.")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("targetlid") 
                .setDescription("The inventory id of that you want to move it to.")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const uid = interaction.user.id;
            const start = await interaction.options.getInteger('startlid');
            const target = await interaction.options.getInteger('targetlid');
            const startcard = await database.Card.findOne({where: {playerID: uid, inventoryID: start}});
            const targetcard = await database.Card.findOne({where: {playerID: uid, inventoryID: target}});

            if (startcard && !targetcard) {
                await database.Card.update({inventoryID: target}, {where: {playerID: uid, inventoryID: start}});
                return await interaction.reply(`Card ${start} has changed it's lid to ${target}`);
            } else if (startcard && targetcard){
                return await interaction.reply(`There is a card with ${target} id. Choose a different id or lidupdate/burn the card before trying again.`);
            } else {
                return await interaction.reply(`Card ${start} doesn't exist.`);
            }
        } catch (error) {
            return interaction.reply("Error has occured");
        }
	},
};