const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('wr')
        .setDescription('Removes a character from your wishlist')
        .addSubcommand(subcommand => 
            subcommand
            .setName("cid")
            .setDescription("Removes a character from your wishlist")
            .addIntegerOption(option => 
                option.setName('cid')
                    .setDescription('Character ID.')
                    .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand
            .setName("all")
            .setDescription("Removes all characters from your wishlist")),
    async execute(interaction) {
        try {
            const uid = await interaction.user.id;
            if (interaction.options.getSubcommand() === 'cid') {
                const cid = await interaction.options.getInteger('cid')
                const character = await database.Character.findOne({where: {characterID: cid}})
                const wishCheck = await database.Wishlist.findOne({where: {playerID: uid, characterID: cid}});
                if (wishCheck) {
                    await wishCheck.destroy();
                    await interaction.reply(`${cid}|${character.characterName} has been removed from your wishlist.`)
                } else {
                    if (wishlist) {return await interaction.reply(`${cid}|${character.characterName} is not in your wishlist.`)}
                }
            } else if (interaction.options.getSubcommand() === 'all') {
                await database.Wishlist.destroy({where: {playerID: uid}});
                await interaction.reply(`Your wishlist has been reset.`)
            }
        } catch (error) {
            interaction.channel.send("Error while wishlist adding.")
        }
    },
};