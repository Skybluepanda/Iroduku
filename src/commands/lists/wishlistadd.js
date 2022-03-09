const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('wa')
        .setDescription('Adds a character into your wishlist')
        .addIntegerOption(option => 
            option.setName('cid')
                .setDescription('Character ID.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            console.log('1')
            const uid = await interaction.user.id;
            const cid = await interaction.options.getInteger('cid')
            const character = await database.Character.findOne({where: {characterID: cid}})
            const wishCount = await database.Wishlist.count({where: {playerID: uid}});
            console.log('2')
            if (wishCount >= 20) {
                console.log('3')
                return await interaction.reply("Current maximum wishlist is 20!");
                console.log('4')
            }
            const wishCheck = await database.Wishlist.findOne({where: {playerID: uid, characterID: cid}});
            console.log(wishCheck);
            if (wishCheck) {
                console.log('6')
                
                await interaction.reply(`${cid}|${character.characterName} is already in your wishlist!`)
                console.log('7')
            } else {
                console.log('8')
                const wishlist = await database.Wishlist.create({
                    playerID: uid,
                    characterID: cid,
                });
                console.log('9')
                if (wishlist) {return await interaction.reply(`${cid}|${character.characterName} has been added to your wishlist!`)}
                console.log('10')
                
            }
        } catch (error) {
        }
    },
};