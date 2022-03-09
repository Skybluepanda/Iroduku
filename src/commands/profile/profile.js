const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');

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
            .setColor("#00ecff")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedDone.setTitle("Stats")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setColor("#7cff00")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("#ff0000")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        await interaction.reply({ embeds: [embed] });
        try {
            const player = await database.Player.findOne({ where: { playerID: userId } });
            if (player) {
                embedDone.setDescription(`
**Level:** ${player.level} (${player.xp}/10)
**Gems:** ${player.gems} <:waifugem:947388797916700672>
**Money:** ${player.money} <:datacoin:947388797828612127>
**Karma:** ${player.karma} <:karma:947388797627281409>
**Pity:** ${player.pity}
                `)
            } else {
                embedDone.setDescription('Player does not exist.')
                        .setColor(color.aqua);
            }
            return interaction.editReply({ embeds: [embedDone] });
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};