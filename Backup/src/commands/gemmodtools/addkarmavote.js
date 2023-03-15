const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addkamravote')
        .setDescription('rewards karma to everyone.')
        .addIntegerOption(option => 
            option
                .setName("quantity")
                .setDescription("Quantity of the gem")
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

        embed.setTitle("Adding Karma")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor("#00ecff")

        embedDone.setTitle("Added Karma")
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
            embedDone.setDescription(`Adding karma for votes they did. Do this once and never again.`);
            const total = await database.Votetrack.count();
            console.log(1)
            for (let i = 1; i <= total; i++) {
                console.log(2)
                const vote = await database.Votetrack.findOne({where: {id: i}});
                console.log(3)
                const cvotes = await vote.charVote + vote.imageVote;
                console.log(4)
                const player = await database.Player.findOne({where: {playerID: vote.playerID}});
                console.log(5)
                console.log(i);
                console.log(6)
                console.log(player.name);
                // await database.Player.increment({karma: cvotes}, {where: {playerID: vote.playerID}});
            }
            await interaction.editReply({ embeds: [embedDone] }, {ephemeral: true});
        } catch (error) {
            return interaction.editReply({ embeds: [embedError] }, {ephemeral: true});
        }
    }
};