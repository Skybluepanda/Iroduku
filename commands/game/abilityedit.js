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
        .setFields({name: "Weapon Details",
            value:
`**weaponID: ** ${ability.weaponID}
**Slot: ** ${ability.abilitySlot}
**Target: ** ${ability.target}
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
    const id = interaction.options.getInteger('id');
    const name = interaction.options.getString('name');
    const text = interaction.options.getString('text');
    const weaponID = interaction.options.getInteger('weaponid');
    const abilitySlot = interaction.options.getInteger('abilityslot');
    const target = interaction.options.getInteger('target');
    const damage = interaction.options.getInteger('damage');
    const dmgvar = interaction.options.getInteger('dmgvar');
    const pen = interaction.options.getInteger('pen');
    const acc = interaction.options.getInteger('acc');
    const crt = interaction.options.getInteger('crt');
    const crd = interaction.options.getInteger('crd');
    const effect = interaction.options.getString('effect');
    const self = interaction.options.getString('self');
    const cooldown = interaction.options.getInteger('cooldown');
    const ability = await database.ability.findOne({where: {abilityID: id}});
    if(name) {
        ability.update({name: name});
    }
    if(text) {
        ability.update({abilityText: text});
    }
    if(weaponID) {
        ability.update({weaponID: weaponID});
    }
    if(abilitySlot) {
        ability.update({abilitySlot: abilitySlot});
    }
    if(target) {
        ability.update({target: target});
    }
    if(damage) {
        ability.update({damage: damage});
    }
    if(dmgvar) {
        ability.update({dmgvar: dmgvar});
    }
    if(pen) {
        ability.update({pen: pen});
    }
    if(acc) {
        ability.update({acc: acc});
    }
    if(crt) {
        ability.update({crt: crt});
    }
    if(crd) {
        ability.update({crd: crd});
    }
    if(effect) {
        ability.update({effect: effect});
    }
    if(self) {
        ability.update({self: self});
    }
    if(cooldown) {
        ability.update({cooldown: cooldown});
    }
    return viewAbility(interaction, ability);
}



async function selectOption(interaction) {
    switch (interaction.options.getSubcommand()) {
        case "new":
            return newAbility(interaction);

        case "edit":
            return editAbility(interaction);

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
                .setRequired(true))
            .addStringOption(option => option
                .setName("text")
                .setDescription("The text of the ability")
                .setRequired(true))
            .addIntegerOption(option => option
                .setName("weaponid")
                .setDescription("Weapon id")
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
