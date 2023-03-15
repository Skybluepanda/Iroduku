const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archiveimg')
		.setDescription('archives images')
        .addIntegerOption(option => 
            option
                .setName("imageid")
                .setDescription("The start Image")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("amount")
                .setDescription("number of pics")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            const startid = interaction.options.getInteger('imageid');
            const amount = interaction.options.getInteger('amount');
            for (let i = 0; i < amount; i++) {
                const image = await database.Image.findOne({where: {imageID: (startid+i)}});
                if (image) {
                    const char = await database.Character.findOne({where: {characterID: image.characterID}})
                    const series = await database.Series.findOne({where: {seriesID: char.seriesID}})
                    const url = await image.imageURL;
                    await interaction.channel.send(`${image.imageID}| ${char.characterName} from ${series.seriesName}\nArt by ${image.artist} and uploaded by ${image.uploader}`);
                    await interaction.channel.send(`${url}`);
                }
            }
            await interaction.channel.send(`done`);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}