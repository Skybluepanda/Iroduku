const { SlashCommandBuilder, spoiler } = require('@discordjs/builders');

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

        embedl.setTitle("This is a test embed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("this is some plain text")
            .setColor("#ffd700")
            .addField("BBot Version", "1.0.0", true);
        var off = 0;
        await interaction.reply('||https://cdn.discordapp.com/attachments/947664706464776223/949254844261203998/IMG_3338.jpg||')
        await interaction.editReply({ embeds: [embedg] });
        msg = await interaction.followUp('||https://cdn.discordapp.com/attachments/947664706464776223/949254844261203998/IMG_3338.jpg||');
        await msg.edit({ embeds: [embedp] });
        await interaction.followUp({ embeds: [embedl] });
    }
};