const { SlashCommandBuilder } = require('@discordjs/builders');

const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('makes an embed!'),
    async execute(interaction) {
        const embed = new MessageEmbed();

        embed.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("AQUA")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .addField("BBot Version", "1.0.0", true);

        await interaction.reply({ embeds: [embed] });

    }
};