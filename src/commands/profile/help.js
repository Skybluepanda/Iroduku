const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');



module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('lists commands')
        ,
	async execute(interaction) {
        const embed = new MessageEmbed();

        embed.setTitle("List of commands and their functions")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`
**Profile**
/isekai - start playing the bot.
/daily - collect everyday for 250 + 25 x streak gems. (up to 10 streak) and 5 karma.
/collect - generates 8 gems every 5 minutes up to 650 gems. First 5 generation is tripled.
/vote - votes for the bot on top.gg for 5 karma. (12hr cooldown)
/cds - where you can check your daily timer, collect timer, cvote status, and isvote status
    •/cvote - vote for characters to earn gems (1 vote = 1 karma)
    •/isvote - votes for swaps (1 vote = 1 karma)

/stats - where you check for level, amount of gems, money, karma, pity for ruby, karma pity, gacha toggles
/gacha - consumes gems
    • /gtenroll consumes 100 gems to roll gacha 10 times
    • /gkarma consumes 10 karma to roll a karma roll from your wishlist
    •/gktenroll consumes 100 karma to roll karma roll 10 times from your wishlist
/togglegacha - turns on or off gachas for ranks (main, sides, extras)
/gultimate - auto gacha (add amount of times you want to gacha, along with inputting rarity u want to burn)
    •if you input amethyst in rarity, it automatically burns amethyst and below)
/bruh - bruh
/gift - gifts one specific card to a user (both parties need to press accept)
/rubygamble - attemps to upgrade a ruby card to a pink diamond
    •uses 500 coins per attempt, with [ 2% Success : 4.5% Fail ]
`)
            .setColor(color.aqua)
        return interaction.reply({embeds: [embed]});
	},
};
