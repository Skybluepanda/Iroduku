const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('archivegif')
		.setDescription('archives gifs')
        .addIntegerOption(option => 
            option
                .setName("gifid")
                .setDescription("The start gif")
                .setRequired(true)
                )
        .addIntegerOption(option => 
            option
                .setName("amount")
                .setDescription("number of gif")
                .setRequired(true)
                ),
	async execute(interaction) {
        try {
            console.log("1");
            const startid = interaction.options.getInteger('gifid');
            const amount = interaction.options.getInteger('amount');
            console.log("2");
            for (let i = 0; i < amount; i++) {
                console.log("3");
                const gif = await database.Gif.findOne({where: {gifID: (startid+i)}});
                console.log("4");
                if (gif) {
                    console.log("5");
                    const char = await database.Character.findOne({where: {characterID: gif.characterID}});
                    console.log("5.1");
                    const series = await database.Series.findOne({where: {seriesID: char.seriesID}});
                    console.log("5.2");
                    const url = await gif.gifURL;
                    console.log("5.3");
                    await interaction.channel.send(`${gif.gifID}| ${char.characterName} from ${series.seriesName}\nArt by ${gif.artist} and uploaded by ${gif.uploader}`);
                    await interaction.channel.send(`${url}`);
                    console.log("6");
                }
            }
            await interaction.channel.send(`done`);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}