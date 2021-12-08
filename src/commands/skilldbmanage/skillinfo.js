const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skillinfo')
        .setDescription('Displays information about a skill')
        .addStringOption(option => 
            option.setName('name')
                .setDescription('Name of your skill.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.roles.cache.has('908920221568483368')) return;
        await interaction.reply('Finding skill...');
        const skillName = interaction.options.getString('name');
        const skill = await database.SkillDesc.findOne({ where: { name: skillName } });
        if (skill) {
            return interaction.editReply(`Skill Name: ${skill.name}
            Max Level: ${skill.maxLevel}
            Description: ${skill.description}`);
        }
        return interaction.editReply(`Could not find tag: ${tagName}`);
    },
};