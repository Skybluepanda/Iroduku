const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eat')
        .setDescription('Eat a fish'),
    async execute(interaction) {
        const embed = new MessageEmbed();

        embed.setTitle("Eating Fish")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("Eating")
            .setColor("GREEN")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        const username = interaction.user.username;
        const userId = interaction.user.id;
        const character = await database.Character.findOne({ where: { characterID: userId } })
        if (character) {
            // remove hunger here
            if (character.fish > 0) {
                character.increment('hunger', { by: 3 });
                character.increment('fish', { by: -1 });
                embed.setDescription(`
                Ate a fish!
                Hunger: ${character.hunger+3}
                Fish: ${character.fish-1}
                `);
                return interaction.reply({ embeds: [embed] });
            } else {
                embed.setDescription(`
                No fish to eat :(
                Hunger: ${character.hunger}
                Fish count: ${character.fish}
                `);
                return interaction.reply({ embeds: [embed] });
            }
        } else {
            embed.setDescription(`Character doesn't exist`)
            embed.setColor("RED");
            return interaction.reply({ embeds: [embed] });
        }
    },
};