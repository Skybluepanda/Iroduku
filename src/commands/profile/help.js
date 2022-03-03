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

**Profile**
isekai: start playing
stats: shows your profile (most of the stats are unused as of the moment don't concern yourself with anything other than gems which are your gacha currency)
daily: collect dailies of 50 gem, each consequtive daily will add bonus up to maximum of 10 streak for 100 gems!
bruh: returns bruh.


**Gacha**
addgem: 10% chance to add a gem.
gacha: spend 10 gems to roll for one card.
gtenroll: spend 100 gems to roll 10 cards.
gkarma: uses 10 karma to do a higher quality gacha
gktenroll: does gkarma 10 times for 100 karma
toggle sides: turns on and off Kiri's strange husbando series from your gacha
Check out rates at #gacha-info


**Inventory management**
list: displays inventory. Use subcommands and filter to get desired results
tag: tags cards with emotes, uses same filters as list please use normal emotes or it'll deform your list
burn: either burns one card or burns all cards tagged with an emote. (ideal use) tag all quartz card then burn the tag.
burn-cont: burn cannot delete ruby cards and refunds coins and gems depending on card rarity.
Rubyset: changes image of a ruby card
Amethystupdate: updates image of a amethyst card.


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
gdelete: uploads a gif (requires photoshopper role)`)
            .setColor("#00ecff")
        return interaction.reply({embeds: [embed]});
	},
};
