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
        try {
            const player = await database.Player.findOne({ where: { playerID: userId } });
            if (player) {
                let toggle;
                const sideson = await database.Sideson.findOne({ where: { playerID: userId } });
                const trashon = await database.Trashon.findOne({ where: { playerID: userId } });
                let xpLimit;
                if (player.level > 5) {
                    xpLimit = 300;
                } else {
                    xpLimit = (2**player.level)*10;
                }
                if (trashon) {
                    toggle = "extras";
                } else if (sideson) {
                    toggle = "sides";
                } else {
                    toggle = "main";
                }
                embedDone.setDescription(`
**Level:** ${player.level} (${player.xp}/${xpLimit})
**Gems:** ${player.gems} <:waifugem:947388797916700672>
**Money:** ${player.money} <:datacoin:947388797828612127>
**Karma:** ${player.karma} <:karma:947388797627281409>
**Pity:** ${player.pity}
**Karma Pity:** ${player.kpity}
**Gacha Toggles:** ${toggle}
**Image Prestige:** ${player.imagePrestige}
                `)
            } else {
                embedDone.setDescription('Player does not exist.')
                        .setColor(color.successgreen);
            }
            return interaction.reply({ embeds: [embedDone] });
        } catch (error) {
            return interaction.reply({ embeds: [embedError] });
        }
    },
};