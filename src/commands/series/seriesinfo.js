const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Series Info")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("No Info found")
        .setColor("#00ecff")
    
    return embed;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('sinfo')
		.setDescription('Shows information of a series')
        .addIntegerOption(option => 
            option
                .setName("sid")
                .setDescription("The page you want to open.")
                .setRequired(true)
                ),
	async execute(interaction) {
		const embed = createEmbed(interaction);
        const sid = await interaction.options.getInteger('sid');
        
        try {
            const series = await database.Series.findOne({ where: { seriesID: sid }});
            if (series) {
                await embed.setDescription(`
                Series ID: ${series.seriesID}
                Series Name: ${series.seriesName}
                Series Link: ${series.malLink}
                `);
                return await interaction.reply( {embeds: [embed]});
            }
        } catch(error) {
            return interaction.reply("Error has occured.")
        }
	},
};