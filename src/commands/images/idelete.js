const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('idelete')
		.setDescription('Edits image Details')
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
            .setDescription("The id of the image")
            .setRequired(true)),
	async execute(interaction) {
		try {
            if (!interaction.member.roles.cache.has('947640668031975465')) {
                return interaction.reply("You don't have the photoshopper role!", {ephemeral: true});
            };
        	const id = interaction.options.getInteger('id');
            const cid = database.Image.findOne({where: {imageID: id}}).characterID;
            database.Image.destroy({where: {imageID: id}});
            database.Character.increment({imageCount: -1}, {where: {characterID: cid}})
            console.log(`image ID ${id} was deleted. Don't do this often`)
            interaction.reply(`image ID ${id} was deleted. Don't do this often`);
        } catch (error) {
            console.log("u fucked up");
        }
	},
};