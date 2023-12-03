const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('changerarity')
        .setDescription('changes rarity of a card')
        .addUserOption(option => 
            option
                .setName("target")
                .setDescription("The user account")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("Quantity of the money")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("rarity")
                .setDescription("Reason?")
                .setRequired(true)
                ),


    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        try {
            
            if (!interaction.member.roles.cache.has('947442920724787260')) {
                embedError.setDescription("You don't have the gemmod role!")

                return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});

            };
            console.log("you have gemmod role");
            const target = await interaction.options.getUser('target');
            const quantity = await interaction.options.getInteger('lid');
            const reason = await interaction.options.getInteger('rarity');
            await database.Card.update({rarity: reason}, {where: {playerID: target.id, inventoryID: quantity}})
            await interaction.reply("Card Rarity Changed!")
            
            
        } catch (error) {
            console.log(error)
        }
    }
};