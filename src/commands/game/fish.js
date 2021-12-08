const { SlashCommandBuilder, channelMention } = require('@discordjs/builders');
const database = require('../../database.js');
const { MessageEmbed, Guild } = require('discord.js');

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
 * finds character of the user performing the command
 * @param {*} id if of the user performing the command
 * @returns the character if it exists, otherwise null.
 */
function findCharacter(id) {
    if (database.Character.findOne({ where: { characterID: id } }) != null) {
        const character = database.Character.findOne({ where: { characterID: id } })
        return character;
    } else {
        const character = null;
        return character;
    }
    
}

function xpCheck(character, interaction, xp) {
    const xpUp = new MessageEmbed();
    const lvlUp = new MessageEmbed();
    const xpCap = 10;
    const xpTotal = character.fishXP + xp;

    xpUp.setTitle("Fishing XP gained")
        .setDescription(`Gained ${xp} fishing XP.`)
        .setColor("AQUA");
    
    lvlUp.setTitle("Fishing Level gained")
        .setDescription(`Gained a fishing level.
        Your fishing level is now ${character.fishLevel+1}.`)
        .setColor("GOLD");

    character.increment('fishXP', { by: xp });
    interaction.channel.send({ embeds: [xpUp] });
    if (xpTotal >= xpCap) {
        //levelup
        character.increment('fishXP', { by: -xpCap });
        character.increment('fishLevel', { by: 1 });
        interaction.channel.send({ embeds: [lvlUp] });
    }
}

/**
 * performs resulting actions of catching a fish.
 * @param {*} embed the embed that needs to be altered.
 * @param {*} character the character that is performing the action
 * @param {*} interaction the interaction that the command is working with
 * @returns 
 */
function fishCaught(embed, character, interaction) {
    embed.setColor("GREEN")
    embed.setDescription(`
    One fish caught!
    Hunger: ${character.hunger-1}
    Fish: ${character.fish+1}
    `);
    interaction.reply({ embeds: [embed] });
    return;
}

/**
 * performs resulting actions of catching a fish.
 * @param {*} embed the embed that needs to be altered.
 * @param {*} character the character that is performing the action
 * @param {*} interaction the interaction that the command is working with
 * @returns 
 */
function fishFail(embed, character, interaction) {
    embed.setColor("ORANGE")
    embed.setDescription(`
        No fish caught :(
        Hunger: ${character.hunger-1}
        Fish: ${character.fish}
        `);
    interaction.reply({ embeds: [embed] });
    return;
}

/**
 * performs resulting actions when character runs out of hunger.
 * @param {*} embed the embed that needs to be altered.
 * @param {*} character the character that is performing the action
 * @param {*} interaction the interaction that the command is working with
 * @param {*} userId id of the user performing the action.
 * @returns 
 */
function death(embed, character, interaction, userId) {
    embed.setColor("RED")
    embed.setDescription(`
    You died of Hunger bruh
    Hunger: 0
    Fish count: ${character.fish}
    `);
    interaction.reply({ embeds: [embed] });
    database.Character.destroy({ where: { characterID: userId } });
    return;
}

/**
 * Reply when character doesn't exists.
 * @param {*} embed the embed that needs to be altered.
 * @param {*} interaction the interaction that the command is working with
 * @returns 
 */
function noChar(embed, interaction) {
    embed.setColor("BLACK")
    embed.setDescription(`You don't have a character do /isekai to create a new character.`);
    interaction.reply({ embeds: [embed]});
    return;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Try to catch one fish'),
    async execute(interaction) {
        const embed = createEmbed(interaction);
        const username = interaction.user.username;
        const userId = interaction.user.id;
        const character = await findCharacter(userId);
        if (character) {
            character.increment('hunger', { by: -1 });
            // chance calculation
            var succeedChance = 0.5;
            if (character.hunger > 0) {
                
                if (Math.random() < succeedChance) {
                    // add the fish to database here
                    character.increment('fish', { by: 1 });
                    xpCheck(character, interaction, 3);
                    // fish caught!
                    fishCaught(embed, character, interaction);
                    return;
                } else {
                    // failed
                    fishFail(embed, character, interaction);
                    xpCheck(character, interaction, 1);
                    return;
                    // TODO: maybe randomize the failed message
                }
            } else {
                // do death checking here
                death(embed, character, interaction, userId);
                return;
            }
        }
        noChar(embed, interaction);
        return;
    },
};