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
screate: creates a series (requires librarian role)
sedit: edits a series info (requires librarian role)
sinfo: shows series info
slist: lists series 


**Characters**
ccreate: creates a character (requires librarian role)
cedit: edits a character info (requires librarian role)
cinfo: character info
clist: lists characters


**Images**
border: adds border to jpeg or png (requires photoshopper role)
iupload: uploads an image (requires photoshopper role)
iedit: edits an image or gif (requires photoshopper role)
idelete: deletes an image from database. (requires photoshopper role)
gupload: uploads a gif (requires photoshopper role)
gedit: uploads a gif (requires photoshopper role)
gdelete: uploads a gif (requires photoshopper role)

**Profile**
isekai: start playing
stats: shows your profile (most of the stats are unused as of the moment don't concern yourself with anything other than gems which are your gacha currency)`)
            .setColor("#00ecff")
        return interaction.reply({embeds: [embed]});
	},
};
