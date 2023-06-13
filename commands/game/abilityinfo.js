const { SlashCommandBuilder } = require('@discordjs/builders');
const database = require('../../database');
const { MessageEmbed } = require('discord.js');
const color = require('../../color.json');


async function embedNew(interaction) {
    const embedNew = new MessageEmbed();
    embedNew.setTitle("Ability Created")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Ability is being created.`)
        .setColor(color.purple)
    return embedNew;
};

async function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Ability not found")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Try a different ability ID. Reminder that ability id is weaponID + ability slot.\n For example weapon 1 passive is ability ID 10.`)
        .setColor(color.failred);
    return embedError;asd
};
async function embedDupe(interaction) {
    const embedDupe = new MessageEmbed();
    embedDupe.setTitle("Ability with same name Exists")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Ability with same name exists, make sure they are not same 
        Ability and edit either Ability name to allow coexistence`)
        .setColor("#ff0000");
    return embedDupe;
};

async function embedError(interaction) {
    const embedError = new MessageEmbed();
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
        .setColor(color.failred);
    return embedError;
};

async function viewAbility(interaction, ability) {
    const embed = new MessageEmbed();
    if(ability.self)
    embed.setTitle(`${ability.abilityName}`)
        .setDescription(`${ability.abilityText}`)
        .setColor(color.successgreen)
        .setFields({name: "Ability Details",
            value:
`**weaponID: ** ${ability.weaponID}
**Slot: ** ${ability.abilitySlot}
**Target: ** ${ability.target}
**Range: **${ability.range}
**Damage: ** ${ability.damage}
**Damage Variance: ** ${ability.dmgvar}
**Armor Penetration: ** ${ability.pen}
**Accuracy: ** ${ability.acc}
**Critical Chance: ** ${ability.crt}
**Critical Damage: ** ${ability.crd}
**Effect: ** ${ability.effect}
**Self: ** ${ability.self}
**Cooldown: ** ${ability.cooldown}
`})
    await interaction.editReply({embeds: [embed]});
}



module.exports = {
	data: new SlashCommandBuilder()
		.setName('ai')
		.setDescription('ability info')
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the ability")
                .setRequired(true)),
	async execute(interaction) {
        const embedN = await embedNew(interaction);
        const embedD = await embedDupe(interaction);
        const embedE = await embedError(interaction);
        
        try {
            await interaction.reply({ embeds: [embedN] });
            const id = interaction.options.getInteger('id');
            const ability = await database.Ability.findOne({where: {abilityID: id}});
            if (ability) {
                return viewAbility(interaction, ability);
            } else {
                interaction.editReply({ embeds: [embedE] });
            }
            
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return interaction.editReply({ embeds: [embedD] });
            }
            return interaction.editReply({ embeds: [embedE] });
        }
        console.log("there are no errors here.")
	},
};
