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
            if (!interaction.member.roles.cache.has('951960776380416000')) {
                return interaction.reply("You don't have the image mod role!", {ephemeral: true});
            };
        	const id = await interaction.options.getInteger('id');
            const gif = await database.Gif.findOne({where: {gifID: id}});
            const cid = await gif.characterID;
            await gif.destroy();
            await database.Character.increment({gifCount: -1}, {where: {characterID: cid}})
            console.log(`Gif ID ${id} was deleted. Don't do this often`)
            await interaction.reply(`Gif ID ${id} was deleted. Don't do this often`);
        } catch (error) {
            console.log("u fucked up");
        }
	},
};