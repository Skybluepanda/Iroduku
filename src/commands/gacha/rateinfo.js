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
**Standard Gacha Rates:**
60% Quartz
20% Jade
15% Lapis
4.2% Amethyst
0.7% Ruby
0.095% Diamond (inheriting rubyset)
0.005% Azurite

**Character Pool Rates:**
Main: Wishlist 3% ; Main 27% ; Side 70%
Side: Wishlist 9% ; Main and Side 91%
Extra: Wishlist 15% ; All 85%
(If your wishlist has less than 5 characters, main will be used)

**Karma Gacha Rates:**
60% Lapis
36.84% Amethyst
3% Ruby
0.16% Diamond

Karma Gacha chooses characters from your wishlist.
Therefore you must have 5 wishlist characters to use Karma Gacha.
`)
			.setColor(color.successgreen)
		await interaction.reply({embeds: [embed]});
	},
};
