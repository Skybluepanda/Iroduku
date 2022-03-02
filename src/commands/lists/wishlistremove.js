const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('wremove')
        .setDescription('Removes a character from your wishlist')
        .addIntegerOption(option => 
            option.setName('cid')
                .setDescription('Character ID.')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const uid = await interaction.user.id;
            const cid = await interaction.options.getInteger('cid')
            const character = await database.Character.findOne({where: {characterID: cid}})
            const wishCheck = await database.Wishlist.findOne({where: {playerID: uid, characterID: cid}});
            if (wishCheck) {
                await wishCheck.destroy();
                await interaction.reply(`${cid}|${character.characterName} has been removed from your wishlist.`)
            } else {
                if (wishlist) {return await interaction.reply(`${cid}|${character.characterName} is not in your wishlist.`)}
                
            }
        } catch (error) {
            interaction.channel.send("Error while wishlist adding.")
        }
    },
};