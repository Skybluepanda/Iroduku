const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purgecard')
        .setDescription('purges a card using admin powers.')
        .addUserOption(option => 
            option
                .setName("target")
                .setDescription("The user account")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("lid")
                .setDescription("The lid")
                .setRequired(true)
                )
        .addStringOption(option => 
            option
                .setName("reason")
                .setDescription("Reason?")
                .setRequired(true)
                ),


    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        
        const embed = new MessageEmbed();
        const embedDone = new MessageEmbed();
        const embedError = new MessageEmbed();

        embed.setTitle("Purging Card")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor("#00ecff")

        embedDone.setTitle("Purged Card")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setColor("#7cff00")

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor("#ff0000")

        await interaction.reply({ embeds: [embed] }, {ephemeral: true});
        try {
            
            if (!interaction.member.roles.cache.has('947442920724787260')) {
                embedError.setDescription("You don't have the gemmod role!")

                return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});

            };
            console.log("you have gemmod role");
            const target = await interaction.options.getUser('target');
            const lid = await interaction.options.getInteger('lid');
            const reason = await interaction.options.getString('reason');
            embedDone.setDescription(`${target.toString()}'s card ${lid} was destroyed...?
            Reason: ${reason}`);
            const card = await database.Card.findOne({where: {playerID: target.id, inventoryID: lid}});
            await database.Azurite.destroy({where: {cardID: card.cardID}});
            await database.Special.destroy({where: {cardID: card.cardID}});
            await card.destroy();
            await interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
            
            
        } catch (error) {
            embedError.setDescription(`Error occured: ${error}`)
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};