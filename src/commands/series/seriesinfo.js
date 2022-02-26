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
        .setColor("AQUA")
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    
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
        console.log("0");
		const embed = createEmbed(interaction);
        const sid = await interaction.options.getInteger('sid');
        console.log("1");
        try {
            console.log("2");
            const series = await database.Series.findOne({ where: { seriesID: sid }});
            console.log("2.5");
            if (series) {
                console.log("3");
                await embed.setDescription(`
                Series ID: ${series.seriesID}
                Series Name: ${series.seriesName}
                Series Link: ${series.malLink}
                `);
                console.log("4");
                return await interaction.reply( {embeds: [embed]});
                console.log("5");
            }
        } catch(error) {
            return interaction.reply("Error has occured.")
        }
	},
};