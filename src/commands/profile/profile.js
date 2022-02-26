const { SlashCommandBuilder } = require('@discordjs/builders');
const database2 = require('../../database2.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Check your character stats'),
    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        
        const embed = new MessageEmbed();
        const embedDone = new MessageEmbed();
        const embedError = new MessageEmbed();

        embed.setTitle("Checking Stats")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor("AQUA")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedDone.setTitle("Stats")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("RED")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        await interaction.reply({ embeds: [embed] });
        try {
            const player = await database2.Player.findOne({ where: { playerID: userId } });
            console.log(player);
            if (player) {
                embedDone.setDescription(`
                Name: ${player.name}
                Level: ${player.level} (${player.xp}/10)
                Gems: ${player.gems}
                Money: ${player.money}
                Karma: ${player.karma}
                Inventory: ${player.inventory}
                Permissions: Weeblet
                `)
            } else {
                embedDone.setDescription('Character does not exist.')
                        .setColor('RED');
            }
            return interaction.editReply({ embeds: [embedDone] });
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};