const { SlashCommandBuilder } = require('@discordjs/builders');

const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('white')
    .setDescription('makes an embed!'),
    async execute(interaction) {
        const embed = new MessageEmbed();

        embed.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#ffffff")
            .addField("BBot Version", "1.0.0", true);
        const embedg = new MessageEmbed();

        embedg.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#55cc00")
            .addField("BBot Version", "1.0.0", true);
        const embedb = new MessageEmbed();

        embedb.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#0070dd")
            .addField("BBot Version", "1.0.0", true);
        const embedp = new MessageEmbed();

        embedp.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#a335ee")
            .addField("BBot Version", "1.0.0", true);
        const embedl = new MessageEmbed();

        embedl.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#ffd700")
            .addField("BBot Version", "1.0.0", true);
        var off = 0;
        await interaction.reply({ embeds: [embed] });
        await interaction.followUp({ embeds: [embedg] });
        await interaction.followUp({ embeds: [embedb] });
        await interaction.followUp({ embeds: [embedp] });
        await interaction.followUp({ embeds: [embedl] });
        

    }
};