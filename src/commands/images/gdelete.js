const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('gdelete')
		.setDescription('Deletes Gif')
        //cid is constant
        //subcommands for
        /** 
         * characterName
         * infoLink
         * seriesID
         * alias
         */
        
        .addIntegerOption(option => option
            .setName("id")
            .setDescription("The id of the gif")
            .setRequired(true)),
	async execute(interaction) {
		try {
        	const id = interaction.options.getInteger('id');
            const cid = database.Gif.findOne({where: {gifID: id}}).characterID;
            database.Gif.destroy({where: {gifID: id}});
            database.Character.increment({gifCount: -1}, {where: {characterID: cid}})
            console.log(`Gif ID ${id} was deleted. Don't do this often`)
            interaction.reply(`Gif ID ${id} was deleted. Don't do this often`);
        } catch (error) {
            console.log("u fucked up");
        }
	},
};