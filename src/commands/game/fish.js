const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Try to catch one fish'),
    async execute(interaction) {
        const embed = new MessageEmbed();

        embed.setTitle("Fishing once")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription("Casting...")
            .setColor("AQUA")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        const username = interaction.user.username;
        const userId = interaction.user.id;
        if (database.Character.findOne({ where: { characterID: userId } }) != null) {
            const character = await database.Character.findOne({ where: { characterID: userId } })
                if (character) {
                character.increment('hunger', { by: -1 });
                // chance calculation
                var succeedChance = 0.5;
                if (character.hunger > 0) {
                    if (Math.random() < succeedChance) {
                        // add the fish to database here
                        character.increment('fish', { by: 1 });
                        
                        // fish caught!
                        embed.setColor("GREEN")
                        embed.setDescription(`
                        One fish caught!
                        Hunger: ${character.hunger-1}
                        Fish: ${character.fish+1}
                        `);
                        return interaction.reply({ embeds: [embed] });

                    } else {
                        // failed
                        embed.setColor("ORANGE")
                        embed.setDescription(`
                            No fish caught :(
                            Hunger: ${character.hunger-1}
                            Fish: ${character.fish}
                            `);
                        return interaction.reply({ embeds: [embed] });
                        // TODO: maybe randomize the failed message
                    }
                } else {
                    // do death checking here
                    embed.setColor("RED")
                    embed.setDescription(`
                    You died of Hunger bruh
                    Hunger: 0
                    Fish count: ${character.fish}
                    `)
                    interaction.reply({ embeds: [embed] });
                    database.Character.destroy({ where: { characterID: userId } });
                    return;
                }
            }
        }
        embed.setColor("BLACK")
        embed.setDescription(`You don't have a character do /isekai to create a new character.`)
        return interaction.reply({ embeds: [embed] });
    },
};