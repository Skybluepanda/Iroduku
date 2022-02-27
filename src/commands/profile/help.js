const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('lists commands'),
	async execute(interaction) {
        const embed = new MessageEmbed();

        embed.setTitle("List of commands and their functions")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`
            **Gacha**
            addgem: 10% chance to add a gem.
            bruh: returns bruh.
            *as you can see gacha is mostly unprepared.


            **Series**
            screate: creates a series
            sedit: edits a series info
            sinfo: shows series info
            slist: lists series 


            **Characters**
            ccreate: creates a character
            cedit: edits a character info
            cinfo: character info
            clist: lists characters


            **Images**
            border: adds border to jpeg or png
            iupload: uploads an image
            gifupload: uploads a gif
            iedit: edits an image or gif
            idelete: deletes an image from database.


            **Profile**
            isekai: start playing
            stats: shows your profile (most of the stats are unused as of the moment don't concern yourself with anything other than gems which are your gacha currency)`)
            .setColor("AQUA")
        return interaction.reply({embeds: [embed]});
	},
};
