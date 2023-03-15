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
Use **/isekai** to start!
**/collect** and **/daily** are your primary gacha resource commands.

Refer to ${interaction.guild.channels.cache.get('947135038473011270').toString()} for help with commands.

Use **/rateinfo** to learn more about the gacha.
`)
            .setColor(color.aqua)
        return interaction.reply({embeds: [embed]});
	},
};
