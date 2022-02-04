const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../src/database.js');

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Fishing once")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Casting...")
        .setColor("AQUA")
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    
    return embed;
}

/**
 * Listing series
 * Options
 * Name search
 * List all with buttons.
 * Lets say list 20 items per embed
 * Next page, previous page, go to specific page.
 * 
 */
module.exports = {
	data: new SlashCommandBuilder()
		.setName('slist')
		.setDescription('Shows a list of series')
        .addSubcommand(subcommand => 
            subcommand
                .setName("name")
                .setDescription("Search by name of series")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("Lists series that have the same name.")
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("page")
                .setDescription("Lists pages of series with no filter. ")
                .addIntegerOption(option => 
                    option
                        .setName("page")
                        .setDescription("The page you want to open.")
                        )),
	async execute(interaction) {
		const embed = createEmbed(interaction);
		await interaction.reply();
		//first bring up list from 1 for default call.
		//then select pages
		//then select by name
		//then lets embed.
		if (interaction.options.getSubcommand() === "name") {
			//do name here
			return interaction.reply(`You tried to do name search but it doesn't work yet.`)
		} else if (interaction.options.getSubcommand() === "page") {
			if (interaction.options.getInteger('page')) {
				const page = interaction.options.getInteger('page')
				//Show page at page number if it exists.
			} else {
				//Show page 1
			}

			return interaction.reply(`You tried to do page search but it doesn't work yet.`)
		}
        
        const id = interaction.options.getInteger('id');
        try {
            await selectOption(interaction, database)
        } catch (error) {
            return interaction.editReply(`Error has occured, report to a dev if it reoccurs.`);
        }
	},
};