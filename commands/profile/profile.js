const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');

async function embedLvl(interaction) {
    const player = await database.Player.findOne({ where: { playerID: interaction.user.id } });
    const username = interaction.user.username;
    const embedL = new MessageEmbed();
    await embedL.setTitle("Level Up!")
            .setAuthor(username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Level ${player.level+1} reached!\nLevel up karma reward +${(player.level+1)*100} Karma\nDaily gem reward increased by 100!`)
            .setColor(color.stellar);
    return await embedL;
}

async function checkLevelup(interaction) {
    const player = await database.Player.findOne({ where: { playerID: interaction.user.id } })
    const embed = await embedLvl(interaction, player);
    let xpLimit;
    if (player.level > 6) {
        xpLimit = 500;
    } else {
        xpLimit = (2**player.level)*10;
    }
    if (player.xp >= xpLimit) {
        await database.Player.increment({Karma: (player.level+1)*100, xp: -xpLimit, level: 1}, {where: {playerID: interaction.user.id}});
        await interaction.followUp({ embeds: [embed] }, {ephemeral: true});
    };
}

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
            await interaction.reply({embeds: [embed]});
            await checkLevelup(interaction);
            const player = await database.Player.findOne({ where: { playerID: userId } });
            if (player) {
                let toggle;
                const sideson = await database.Sideson.findOne({ where: { playerID: userId } });
                const trashon = await database.Trashon.findOne({ where: { playerID: userId } });
                let xpLimit;
                if (player.level > 6) {
                    xpLimit = 500;
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
            return interaction.editReply({ embeds: [embedDone] });
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};