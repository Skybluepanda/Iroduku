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
            console.log(1);
            const user = await interaction.options.getUser('user')
            console.log(2);
            console.log(user);
            if (user) {
                console.log(3);
                const uid = user.id
                const list = [];
                const wishlist = await database.Wishlist.findAll({order: [['characterID', 'ASC']], where: {playerID: uid}});
                console.log(wishlist);
                var listString
                for (let i = 0; i < wishlist.length; i++) {
                    console.log("inside the for loop");
                    const char = await database.Character.findOne({where: {characterID: wishlist[i].characterID}});
                    console.log("find char");
                    const id = await wishlist[i].characterID;
                    console.log("get id");
                    const cname = await char.characterName
                    console.log("get name");
                    list[i] = [id, cname].join(" | ");
                    console.log("join them "+ list[i]);
                    listString = [listString, list[i]].join(`\n`);
                    console.log("next line"+ listString);
                }
                console.log(list);
                console.log(listString);
                embed
                    .setTitle(`Wishlisting ${user.username}`)
                    .setDescription(`${user.username}'s Wishlist
                ${listString}`);
            } else {
                console.log(5);
                const uid = interaction.user.id
                const list = [];
                const wishlist = await database.Wishlist.findAll({order: [['characterID', 'ASC']], where: {playerID: uid}});
                console.log(wishlist);
                console.log(wishlist.length);
                var listString
                for (let i = 0; i < wishlist.length; i++) {
                    console.log("inside the for loop");
                    const char = await database.Character.findOne({where: {characterID: wishlist[i].characterID}});
                    console.log("find char");
                    const id = await wishlist[i].characterID;
                    console.log("get id");
                    const cname = await char.characterName
                    console.log("get name");
                    list[i] = [id, cname].join(" | ");
                    console.log("join them "+ list[i]);
                    listString = [listString, list[i]].join(`\n`);
                    console.log("next line"+ listString);
                }
                console.log(list);
                console.log(listString);
                embed
                    .setTitle(`Wishlisting ${interaction.user.username}`)
                    .setDescription(`${interaction.user.username}'s Wishlist
                ${listString}`);
                console.log("embed altered.")
            }
            return await interaction.reply({embeds: [embed]});
        } catch (error) {
            return await interaction.channel.send("Error has occured.");
        }
    },
};