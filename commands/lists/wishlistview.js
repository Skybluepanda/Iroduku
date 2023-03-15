const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');

async function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Wishlisting")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("wishlisting...")
        .setColor(color.aqua)
    
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wl')
        .setDescription('Displays wishlist')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The target user if you want to view someone else.')),
    async execute(interaction) {
        const embed = await createEmbed(interaction);
        try {
            const user = await interaction.options.getUser('user')
            if (user) {
                const uid = user.id
                const list = [];
                const wishlist = await database.Wishlist.findAll({order: [['characterID', 'ASC']], where: {playerID: uid}});
                var listString
                for (let i = 0; i < wishlist.length; i++) {
                    const char = await database.Character.findOne({where: {characterID: wishlist[i].characterID}});
                    const id = await wishlist[i].characterID;
                    const cname = await char.characterName
                    list[i] = [id, cname].join(" | ");
                    listString = [listString, list[i]].join(`\n`);
                }
                embed
                    .setTitle(`Wishlisting ${user.username}`)
                    .setDescription(`${user.username}'s Wishlist
                ${listString}`);
            } else {
                const uid = interaction.user.id
                const list = [];
                const wishlist = await database.Wishlist.findAll({order: [['characterID', 'ASC']], where: {playerID: uid}});
                var listString
                for (let i = 0; i < wishlist.length; i++) {
                    const char = await database.Character.findOne({where: {characterID: wishlist[i].characterID}});
                    const id = await wishlist[i].characterID;
                    const cname = await char.characterName
                    list[i] = [id, cname].join(" | ");
                    listString = [listString, list[i]].join(`\n`);
                }
                embed
                    .setTitle(`Wishlisting ${interaction.user.username}`)
                    .setDescription(`${interaction.user.username}'s Wishlist
                ${listString}`);
            }
            return await interaction.reply({embeds: [embed]});
        } catch (error) {
            return await interaction.channel.send("Error has occured.");
        }
    },
};