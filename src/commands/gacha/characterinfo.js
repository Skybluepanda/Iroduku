const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message } = require('discord.js');
const { Op } = require("sequelize");

/**
 * Creates an embed for the command.
 * @param {*} interaction the interaction that the bot uses to reply.
 * @returns an embed template for the command.
 */
function createEmbed(interaction) {
    const embed = new MessageEmbed();

    embed.setTitle("Char Search")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription("Character Not Found. It's possible that the character doesn't exist.")
        .setColor("RED")
        .setThumbnail(interaction.user.avatarURL({ dynamic: true }));
    
    return embed;
}

async function subcommandProcess(embed, interaction) {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
        case "name":
            cinfoName(embed, interaction);
            break;
        
        case "id":
            cinfoID(embed, interaction);
            break;
            
        default:
            interaction.reply("Please use the subcommands");
            break;
    }
}

async function cinfoName(embed, interaction) {
    const cname = interaction.options.getString("name");
    if (cname.length < 3){
        return interaction.reply("Short names will yield a large list of characters. Use /clist command to find the id than try again with the cinfo id subcommand.");
    } else {
        const charCount = await database.Character.count({ 
            where: { characterName: {[Op.like]: '%' + cname + '%'},}
        })
        console.log(`${charCount}`);
        switch (charCount) {
            case 0:
                interaction.reply({embeds: [embed]});
                break;
            
            case 1:
                const char = database.Character.findOne({
                    attributes: ['characterID'],
                    where: { characterName: {[Op.like]: '%' + cname + '%'},}
                })
                return updateEmbed(char, interaction, embed);

            default:
                charList(interaction, embed);
            };
    }
}

function joinBar(character){
    return [character.characterID, character.characterName].join("| ");
}

async function charList(interaction, embed){
    const cname = interaction.options.getString("name");
    const list = await database.Character.findAll(
        {attributes: ['characterID', 'characterName'],
        order: ['characterID'],
        limit: 20,
        where: {
            characterName: {[Op.like]: '%' + cname + '%'},
        }}
    );
    const listString = await list.map(joinBar).join(`\n`);
    await embed
        .setTitle("Multiple characters with same name found")
        .setDescription(`
        ${listString}
        If there are 20 listed characters and you don't see yours, try /clist!`)
        .setColor("GREEN");
    return await interaction.reply({embeds: [embed]});
}

async function cinfoID(embed, interaction) {
    const cid = await interaction.options.getInteger("id");
    const char = await database.Character.findOne({
        where: {
            characterID: cid
        }
    })
    const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
    await embed
        .setDescription(`
        Character ID: ${char.characterID}
        Character Alias: ${char.alias}
        Character Link: ${char.infoLink}
        Simps: ${char.simps}
        Series: ${char.seriesID}| ${series.seriesName}
        Image Count: ${char.imageCount}
        `)
        .setTitle(`${char.characterName}`)
        .setColor("GREEN");
    return await interaction.reply( {embeds: [embed]});
}

async function updateEmbed(cid, interaction, embed) {
    const cname = interaction.options.getString("name")
    const char = await database.Character.findOne({
        where: { characterName: {[Op.like]: '%' + cname + '%'},}
        });
    const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
    await embed
        .setDescription(`
        Character ID: ${char.characterID}
        Character Alias: ${char.alias}
        Character Link: ${char.infoLink}
        Simps: ${char.simps}
        Series: ${char.seriesID}| ${series.seriesName}
        Image Count: ${char.imageCount}
        `)
        .setTitle(`${char.characterName}`)
        .setColor("GREEN");
    return await interaction.reply( {embeds: [embed]});
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('cinfo')
		.setDescription('Shows information of a character')
        .addSubcommand(subcommand =>
            subcommand
                .setName("name")
                .setDescription("Searches for a character with the name and displays info if they are unique.")
                .addStringOption(option => 
                    option
                        .setName("name")
                        .setDescription("The name you want find")
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("id")
                .setDescription("Finds info of a character")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the character")
                        )),
	async execute(interaction) {
		const embed = createEmbed(interaction);
        try {
            subcommandProcess(embed, interaction);
        } catch(error) {
            return interaction.reply("Error has occured.")
        }
    }
}