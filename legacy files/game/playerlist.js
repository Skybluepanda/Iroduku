const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playerlist')
        .setDescription('Shows list of players'),
    async execute(interaction) {
        const playerList = await database.Player.findAll({ attributes: ['name'] });
        const playerString = playerList.map(p => p.name).join('\n') || 'No players set.';
        const embedNew = new MessageEmbed();

        embedNew.setTitle("Players List")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`${playerString}`)
            .setColor("AQUA")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        await interaction.reply({ embeds: [embedNew] });
    }
};