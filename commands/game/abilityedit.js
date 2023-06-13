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
    embedError.setTitle("Unknown Error")
        .setAuthor(interaction.user.username, interaction.user.avatarURL({ dynamic: true }))
        .setDescription(`Please report the error if it persists.`)
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

async function newAbility(interaction) {
    const embedD = await embedDupe(interaction);
    const embedE = await embedError(interaction);
    try {
        const name = interaction.options.getString('name');
        const text = interaction.options.getString('text');
        const weaponID = interaction.options.getInteger('weaponid');
        const abilitySlot = interaction.options.getInteger('abilityslot');
        const abilityID = weaponID*10 + abilitySlot;
        const target = interaction.options.getInteger('target');
        const range = interaction.options.getInteger('range');
        const damage = interaction.options.getInteger('damage');
        const dmgvar = interaction.options.getInteger('dmgvar');
        const pen = interaction.options.getInteger('pen');
        const acc = interaction.options.getInteger('acc');
        const crt = interaction.options.getInteger('crt');
        const crd = interaction.options.getInteger('crd');
        const effect = interaction.options.getString('effect');
        const self = interaction.options.getString('self');
        const cooldown = interaction.options.getInteger('cooldown');
        const ability = await database.Ability.create({
            abilityID: abilityID,
            abilityName: name,
            name: name,
            abilityText: text,
            weaponID: weaponID,
            abilitySlot: abilitySlot,
            target: target,
            range: range,
            damage: damage,
            dmgvar: dmgvar,
            pen: pen,
            acc: acc,
            crt: crt,
            crd: crd,
            effect: effect,
            self: self,
            cooldown: cooldown,
        });
        return viewAbility(interaction, ability);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return interaction.editReply({ embeds: [embedD] });
        }
        return interaction.editReply({ embeds: [embedE] });
    }
    
}


async function editAbility(interaction) {
    const id = await interaction.options.getInteger('id');
    const name = await interaction.options.getString('name');
    const text = await interaction.options.getString('text');
    const weaponID = await interaction.options.getInteger('weaponid');
    const abilitySlot = await interaction.options.getInteger('abilityslot');
    const target = await interaction.options.getInteger('target');
    const range = await interaction.options.getInteger('range');
    const damage = await interaction.options.getInteger('damage');
    const dmgvar = await interaction.options.getInteger('dmgvar');
    const pen = await interaction.options.getInteger('pen');
    const acc = await interaction.options.getInteger('acc');
    const crt = await interaction.options.getInteger('crt');
    const crd = await interaction.options.getInteger('crd');
    const effect = await interaction.options.getString('effect');
    const self = await interaction.options.getString('self');
    const cooldown = await interaction.options.getInteger('cooldown');
    const ability = await database.Ability.findOne({where: {abilityID: id}});
    if(name !== null) {
        await ability.update({abilityName: name});
    }
    if(text !== null) {
        await ability.update({abilityText: text});
    }
    if(weaponID !== null) {
        await ability.update({weaponID: weaponID});
    }
    if(abilitySlot !== null) {
        await ability.update({abilitySlot: abilitySlot});
    }
    if(target !== null) {
        await ability.update({target: target});
    }
    if(range !== null) {
        await ability.update({range: range});
    }
    if(damage !== null) {
        await ability.update({damage: damage});
    }
    if(dmgvar !== null) {
        await ability.update({dmgvar: dmgvar});
    }
    if(pen !== null) {
        await ability.update({pen: pen});
    }
    if(acc !== null) {
        await ability.update({acc: acc});
    }
    if(crt !== null) {
        await ability.update({crt: crt});
    }
    if(crd !== null) {
        await ability.update({crd: crd});
    }
    if(effect !== null) {
        await ability.update({effect: effect});
    }
    if(self !== null) {
        await ability.update({self: self});
    }
    if(cooldown !== null) {
        await ability.update({cooldown: cooldown});
    }
    return viewAbility(interaction, ability);
}



async function selectOption(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "new":
            return newAbility(interaction);

        case "edit":
            return editAbility(interaction);

        case "info":
            const id = interaction.options.getInteger('id');
            const ability = await database.Ability.findOne({where: {abilityID: id}});
            return viewAbility(interaction, ability);

        default:
            break;
    }
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('acreatedit')
		.setDescription('Creates a new ability')
        .addSubcommand(subcommand => subcommand
            .setName("new")
            .setDescription("Create a new ability")
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the ability")
                .setRequired(true))
            .addStringOption(option => option
                .setName("text")
                .setDescription("The text of the ability")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("weaponid")
                .setDescription("Weapon ID")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("abilityslot")
                .setDescription("ability health")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("target")
                .setDescription("ability target")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("range")
                .setDescription("ability range")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("damage")
                .setDescription("ability damage")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("dmgvar")
                .setDescription("ability dmgvar")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("pen")
                .setDescription("ability pen")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("acc")
                .setDescription("ability acc")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("crt")
                .setDescription("ability crt")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("crd")
                .setDescription("ability crd")
                .setRequired(true))
            .addStringOption(option => option
                .setName("effect")
                .setDescription("ability effect")
                .setRequired(true))
            .addStringOption(option => option
                .setName("self")
                .setDescription("ability self")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("cooldown")
                .setDescription("ability cooldown")
                .setRequired(true)))
        .addSubcommand(subcommand =>subcommand
            .setName("edit")
            .setDescription("Edit existing ability.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the ability")
                .setRequired(true))
            .addStringOption(option => option
                .setName("name")
                .setDescription("The name of the ability")
                .setRequired(false))
            .addStringOption(option => option
                .setName("text")
                .setDescription("The text of the ability")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("weaponid")
                .setDescription("Weapon id")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("abilityslot")
                .setDescription("ability health")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("target")
                .setDescription("ability target")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("range")
                .setDescription("ability range")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("damage")
                .setDescription("ability damage")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("dmgvar")
                .setDescription("ability dmgvar")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("pen")
                .setDescription("ability pen")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("acc")
                .setDescription("ability acc")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("crt")
                .setDescription("ability crt")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("crd")
                .setDescription("ability crd")
                .setRequired(false))
            .addStringOption(option => option
                .setName("effect")
                .setDescription("ability effect")
                .setRequired(false))
            .addStringOption(option => option
                .setName("self")
                .setDescription("ability self")
                .setRequired(false))
            .addIntegerOption(option => option
                .setName("cooldown")
                .setDescription("ability cooldown")
                .setRequired(false)))
        .addSubcommand(subcommand =>subcommand
            .setName("info")
            .setDescription("Edit existing ability.")
            .addIntegerOption(option => option
                .setName("id")
                .setDescription("The id of the ability")
                .setRequired(true))),
	async execute(interaction) {
        const embedN = await embedNew(interaction);
        const embedD = await embedDupe(interaction);
        const embedE = await embedError(interaction);
        
        try {
            await interaction.reply({ embeds: [embedN] });
            if (!interaction.member.roles.cache.has('1086819458800177213')) {
                embedE.setTitle("Insufficient Permissions")
                    .setDescription("You don't have the blacksmith role!");
                return interaction.editReply({ embeds: [embedE] }, {ephemeral: true});
            };
            if (interaction.channel.id === '1086674842893438976') {
                return selectOption(interaction);
            } else {
                interaction.channel.send("Please use #series and characters channel for this command.")
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
