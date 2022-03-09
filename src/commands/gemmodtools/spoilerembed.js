const { SlashCommandBuilder } = require('@discordjs/builders');

const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('spoiler')
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

        const url = 'https://cdn.discordapp.com/attachments/947123054570512395/949226979419369522/SPOILER_undefined.png';
        embedl.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#ffd700")
            .addField("BBot Version", "1.0.0", true)
            .addImage(`||W${url}||`);
        await interaction.reply('||https://cdn.discordapp.com/attachments/947664706464776223/949254844261203998/IMG_3338.jpg||')
        await interaction.editReply({ embeds: [embedg] });
        await interaction.followUp({ embeds: [embedl] });
    }
};