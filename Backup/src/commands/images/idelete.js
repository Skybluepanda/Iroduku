const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('idelete')
		.setDescription('Deletes Image')
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
            if (!interaction.member.roles.cache.has('951960776380416000')) {
                return interaction.reply("You don't have the image mod role!", {ephemeral: true});
            };
        	const id = await interaction.options.getInteger('id');
            image = await database.Image.findOne({where: {imageID: id}})
            const cid = await image.characterID;
            await image.destroy();
            await database.Character.increment({imageCount: -1}, {where: {characterID: cid}})
            console.log(`image ID ${id} was deleted. Don't do this often`)
            await interaction.reply(`image ID ${id} was deleted. Don't do this often`);
        } catch (error) {
            console.log("u fucked up");
        }
	},
};