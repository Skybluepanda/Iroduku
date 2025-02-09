const { SlashCommandBuilder } = require('@discordjs/builders');
const color = require('../../color.json');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton, Collection } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rateinfo')
		.setDescription('gives information regarding gacha rates.'),
	async execute(interaction) {
		const embed = new MessageEmbed();
		embed.setTitle(`Gacha Rates and Info`)
			.setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({ dynamic: true })})
			.setDescription(`
**Standard Gacha Rates: costs 10 gems**
60% Quartz
20% Jade
15% Lapis
4.2% Amethyst
0.7% Ruby (0.003% increased / pity)
0.095% Diamond
0.005% Stellarite

**Character Pool Rates:**
Main: Rank 1 & 2 + Wishlisted characters from Rank 3
Extra: All characters
Setllarites will boost chance for wishlisted characters.

**Karma Gacha Rates: costs 10 karma**
55% Lapis
40% Amethyst
4.7% Ruby
0.29% Diamond (0.01% increased diamond rate/10 Karma pity. Guaranteed at 200)
0.01% Stellarite


*Karma Gacha chooses characters from your wishlist.
Therefore you must have at least 5 wishlist characters to use Karma Gacha.*

**Quartz:** Can only have image 1.
**Jade:** Can only have image 1.
**Lapis:** Can have any of the image and gifs of the character.
**Amethyst:** Stores date pulled and it's image isn't swapped when the image is swapped in the database. You can manually swap to the new image using */amethystupdate*
**Ruby:** Same as amethyst. You can use /rubygamble to spend 500 coins for an attempt to upgrade to Pink Diamond
**Pink Diamond:** Upgraded from Ruby. Can change the image using */diaset*.
**Diamond:** Can change the image using */diaset*.
**Stellarite:** Upload your choice of image of the character using */stellarupload*. Send the correct representation of the characters please.
`)
			.setColor(color.successgreen)
		await interaction.reply({embeds: [embed]});
	},
};
