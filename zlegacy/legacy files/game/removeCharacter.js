const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removecharacter')
        .setDescription('Removes the Character')
        .addStringOption(option => 
            option.setName('id')
                .setDescription('discord ID of the profile being removed')
                .setRequired(false)),
    async execute(interaction) {
        const targetId = interaction.user.id;
        if (interaction.options.getString('id') != null) {
            targetId = interaction.options.getString('id');
        }
        const rowCount = await database.Character.destroy({ where: { characterID: targetId } });

        const embed = new MessageEmbed();
        const embedNew = new MessageEmbed();
        const embedError = new MessageEmbed();
        const embedExist = new MessageEmbed();

        embed.setTitle("Removing Profile")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Removing Profile ${targetId}.`)
            .setColor("AQUA")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedNew.setTitle("Profile Removed")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Profile ${targetId} was removed.`)
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("RED")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedExist.setTitle("Account Doesn't Exist")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Profile with ID ${targetId} deosn't exist.`)
            .setColor("RED")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        await interaction.reply({ embeds: [embed] });
        
        if (!rowCount) {
            return interaction.editReply({ embeds: [embedExist] });
        }
        return interaction.editReply({ embeds: [embedNew] });
    },
};