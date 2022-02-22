const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed, Guild, Message, MessageActionRow, MessageButton } = require('discord.js');
const { Op } = require("sequelize");

var currentImage;
var totalImage;
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
        .setColor("RED");
    
    return embed;
}

async function createButton() {
    try {
        const row = await new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('prev')
                    .setLabel('prev')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle('PRIMARY')
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('search')
                    .setLabel('search')
                    .setStyle('PRIMARY')
            )
        return row;
    } catch(error) {
        console.log("error has occured in crearteButton");
    }
}

async function countImage(cid) {
    try {
        const char = await database.Character.findOne({where: {characterID: cid}});
        return await (char.imageCount - 1);
    } catch(error) {
        console.log("Error has occured in countImageg");
    }
}

async function checkInumber(embed, interaction, direction, currentImage, totalImage){
    try {
        if (currentImage == 0 && direction == -1) {
            currentImage = totalImage;
        } else if (currentImage == totalImage && direction == 1) {
            currentImage = 0;
        } else {
            currentImage += direction;
        }
        const image = await currentImage;

        viewImage(embed, interaction, image);
        updateEmbed(embed, interaction);
        buttonManager(embed, interaction, msg, currentImage, totalImage);
    } catch(error) {
        console.log("Error has occured in checkInumber");
    }
}

async function buttonManager(embed, interaction, msg, currentImage, totalImage) {
        try {   
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({ filter, max:1, time: 15000 });
        collector.on('collect', async i => {
            switch (i.customId){
                case 'prev':
                    checkInumber(embed, interaction, -1, currentImage, totalImage);
                    
                    break;
                
                case 'next':
                    checkInumber(embed, interaction, 1, currentImage, totalImage);
                    break;
                
                case 'search':
                    await interaction.followUp('search is not functional.');
                    buttonManager(embed, interaction, msg, currentImage, totalImage);
                    break;
            };
            i.deferUpdate();
        }
        );
    } catch(error) {
        console.log("Error has occured in button Manager");
    }
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
    try {
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
                    return sendEmbed(interaction, embed);

                default:
                    charList(interaction, embed);
                };
        } 
    } catch(error) {
        console.log("error has occured in cinfoName");
    }
}

function joinBar(character){
    return [character.characterID, character.characterName].join("| ");
}

async function charList(interaction, embed){
    try {
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
    } catch(error) {
        console.log("Error has occured with charList");
    }
}

async function viewImage(embed, interaction, imageNumber, cid) {
    try {
        var art = await database.Image.findOne({
            offset: imageNumber, 
            order: [['imageNumber', 'ASC']],
            where: {
                characterID: cid,}
            })
        currentImage = imageNumber;
        console.log("currentimage is" + currentImage);
        const url = art.imageURL;
        const artist = art.artist;
        const source = art.source;
        const uploader = art.uploader;
        const footer = `#${art.imageNumber} Art by ${artist} | Uploaded by ${uploader}
        Image ID is ${art.imageID} report any errors using ID.
        `;
        await embed
            .setImage(url)
            .setFooter({content: `${footer}`})
    } catch(error) {
        console.log("error has occured with view image");
    }
}

async function updateEmbed(embed, interaction){
    await interaction.editReply({ embeds:[embed], fetchReply: true});
}

async function cinfoID(embed, interaction) {
    try {
        const cid = await interaction.options.getInteger("id");
        const char = await database.Character.findOne({
            where: {
                characterID: cid
            }
        })

        if (char) {
            if (char.imageCount > 0){
            await viewImage(embed, interaction, 0, cid);
            }
        } else {
            embed.addField('No images found', 'add some', true);
        }
        const totalImage = await countImage(cid);
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
            const row = await createButton();
        msg = await interaction.reply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, 0, totalImage);
    } catch(error) {
        console.log("error has occured in cinfoID.");
    }
}

async function sendEmbed(interaction, embed) {
    try {
        const cname = interaction.options.getString("name")
        const char = await database.Character.findOne({
            where: { characterName: {[Op.like]: '%' + cname + '%'},}
            });
        const series = await database.Series.findOne({ where: { seriesID: char.seriesID}})
        const cid = await char.characterID;
        const totalImage = await coucntImage(cid);
        if (char.imageCount > 0) {
            await viewImage(embed, interaction, 0, cid);
        } 
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
        const row = await createButton();
        msg = await interaction.reply( {embeds: [embed], components: [row], fetchReply: true});
        await buttonManager(embed, interaction, msg, 0, totalImage);
    } catch(error){
        console.log("error has occured in sendEmbed.");
    }
    
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
                        .setRequired(true)
                        ))
        .addSubcommand(subcommand =>
            subcommand
                .setName("id")
                .setDescription("Finds info of a character")
                .addIntegerOption(option => 
                    option
                        .setName("id")
                        .setDescription("The id of the character")
                        .setRequired(true)
                        )),
	async execute(interaction) {
		const embed = createEmbed(interaction);
        try {
            await subcommandProcess(embed, interaction);
        } catch(error) {
            await  interaction.reply("Error has occured while performing the command.")
        }        
    }
}