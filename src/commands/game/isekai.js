const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isekai')
        .setDescription('Becomes a character in the game'),
    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        
        const embed = new MessageEmbed();
        const embedNew = new MessageEmbed();
        const embedError = new MessageEmbed();
        const embedDupe = new MessageEmbed();

        embed.setTitle("Incoming Truck-kun.")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Brooom`)
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedNew.setTitle("Isekaied")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Player ${username} was Isekaied`)
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedError.setTitle("Failed to Isekai")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please find another truck-kun.`)
            .setColor("RED")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedDupe.setTitle("Already Isekaied")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`You already Isekaied.`)
            .setColor("RED")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        

        await interaction.reply({ embeds: [embed] });
        try {
            const character = await database.Character.create({
                characterID: userId,
                name: username,
            });
            return interaction.editReply({ embeds: [embedNew] });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedDupe] });
            }
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};