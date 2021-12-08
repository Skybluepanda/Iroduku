const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skilladd')
        .setDescription('Adds a skill')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of the skill.')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('max_level')
                .setDescription("Maximum level the skill has.")
                .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
                .setDescription("Description of your skill.")
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has('908920221568483368')) return;
        await interaction.reply('Adding skill...');
        const skillName = interaction.options.getString('name');
        const maxLevel =  interaction.options.getInteger('max_level');
        const skillDescription = interaction.options.getString('description');
        try {
            const skill = await database.SkillDesc.create({
                name: skillName,
                maxLevel: maxLevel,
                description: skillDescription,
            });
            return interaction.editReply(`Skill ${skillName} added!`);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply(`The skill \`${skillName}\` already exists.`);
            }
            return interaction.editReply('Something went wrongt with adding a skill.');
        }
    },
};