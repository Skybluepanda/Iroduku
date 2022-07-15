const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');
var dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
//import dayjs from 'dayjs' // ES 2015
dayjs().format()
dayjs.extend(duration)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('isekai')
        .setDescription('Initiates player profile')
        .addUserOption(option => 
            option
                .setName("reference")
                .setDescription("The person who introduced you to the bot.")
                .setRequired(false)
                ),
    async execute(interaction) {
        const username = interaction.user.username;
        const userId = interaction.user.id;
        
        const embed = new MessageEmbed();
        const embedNew = new MessageEmbed();
        const embedError = new MessageEmbed();
        const embedDupe = new MessageEmbed();

        embed.setTitle("Creating Profile")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Checking for ${username}'s account.`)
            .setColor(color.purple)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

        embedNew.setTitle("Profile Created")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Profile ${username} was created using discord ID ${userId}`)
            .setColor(color.successgreen)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

        embedError.setTitle("Unknown Error")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Please report the error if it persists.`)
            .setColor(color.failred)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

        embedDupe.setTitle("Account Exists")
            .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
            .setDescription(`Account with discord ID ${userId} already exists`)
            .setColor(color.failred)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }));

        

        await interaction.reply({ embeds: [embed] });
        try {
            const now = Date.now();
            const age = interaction.user.createdTimestamp;
            
            const exist = await database.Player.findOne({where: {playerID: interaction.user.id}});
            if (exist) {
                return interaction.editReply({ embeds: [embedDupe] });
            } else {
                const player = await database.Player.create({
                    playerID: userId,
                    name: username,
                    karma: 300
                });
                await database.Votetrack.create({
                    playerID: user
                });
                const reference = await interaction.options.getUser('reference');
                if (reference) {
                    const refplayer = await database.Player.findOne({whhere: {playerID: reference.id}});
                    if (refplayer) {
                        await database.Player.increment({karma: 100}, {where: {playerID: reference.id}});
                        embedNew.setDescription(`Profile ${username} was created using discord ID ${userId}
    Reference ${reference.toString()} was rewarded 100 karma!`);
                    }
                }
            }
            
            return interaction.editReply({ embeds: [embedNew] });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedDupe] });
            }
            return interaction.editReply({ embeds: [embedError] });
        }
    },
};