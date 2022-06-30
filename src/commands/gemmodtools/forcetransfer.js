const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtransfer')
        .setDescription('transfers a card using admin powers')
        .addUserOption(option => 
            option
                .setName("target")
                .setDescription("The user account")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("cardid")
                .setDescription("cardid")
                .setRequired(true)
                ),
    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        
        const embed = new MessageEmbed();
        const embedDone = new MessageEmbed();
        const embedError = new MessageEmbed();

        embed.setTitle("Moving Card")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor("#00ecff")

        embedDone.setTitle("Moved Card")
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
            const lid = await interaction.options.getInteger('cardid');
            const lastCard = await database.Card.max('inventoryID', {where: {playerID: target.id}});
            embedDone.setDescription(`Card ${lid} was added to ${target}'s inventory at lid ${lastCard+1}`);
            await database.Card.update({playerID: target.id, inventoryID: lastCard+1},{where: {cardID: lid}});
            await interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};