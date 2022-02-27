const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addgem')
        .setDescription('adds gem to your profile.'),
    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        
        const embed = new MessageEmbed();
        const embedDone = new MessageEmbed();
        const embedError = new MessageEmbed();

        embed.setTitle("Adding Gem")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor("AQUA")

        embedDone.setTitle("Added Gems")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setColor("GREEN")

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("RED")

        await interaction.reply({ embeds: [embed] }, {ephemeral: true});
        try {
            if (!interaction.member.roles.cache.has('947442920724787260')) return;
            const player = await database.Player.findOne({ where: { playerID: userId } })
            if (player) {
                var succeedChance = 0.1;
                if (Math.random() < succeedChance) {
                    await player.increment('gems', {by: 1});
                    await embedDone.setDescription(`
                    Gems: ${player.gems+1}`);
                } else {
                    await embedDone.setDescription(`Failed to mine a gem. 10% chance as of current patch.`)
                        .setColor("ORANGE");
                    // TODO: maybe randomize the failed message
                }
            } else {
                embedDone.setDescription('You must first create an account using /isekai.')
                        .setColor('RED');
            }
            return interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};