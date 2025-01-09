const fs = require('fs');
const mc = require('minecraft-protocol');
const Discord = require('discord.js');
const axios = require('axios');
const ms = require('ms');
const math = require('mathjs')
const moment = require('moment')

const config = require('./config.json');


let rawdata = fs.readFileSync('./databases/userdata.json', 'utf-8');
let userdata = JSON.parse(rawdata);

let rawdata2 = fs.readFileSync('./databases/hardconfig.json', 'utf-8');
let hardconfig = JSON.parse(rawdata2);

let rawdata3 = fs.readFileSync('./databases/times.json', 'utf-8');
let times = JSON.parse(rawdata3);

let rawdata4 = fs.readFileSync('./databases/permissions.json', 'utf-8');
let permissions = JSON.parse(rawdata4);

let rawdata5 = fs.readFileSync('./databases/settings.json', 'utf-8');
let settings = JSON.parse(rawdata5);



///////////////////////////////////////////
client = new Discord.Client()
//VARIABLES
//////////////////////////////////////////////////////////////////////
const realms = {
    creeper: {
        joincmd: `/server creeper`,
        msg: /\[Creeper Realm\] \[([\w]+) -> me\] (.+)/,
        fchat: /\[Faction\] .+ (\w+): (.+)/,
        ftop: / \* (\#\d+) (\w+) - (\$[\d,]+) \[. -?[\d.]+\%\] \[. (\$[\d,]+)\]/
    },
    warlock: {
        joincmd: '/server warlock',
        msg: /\[Warlock Realm\] \[([\w]+) -> me\] (.+)/,
        fchat: /\[Faction\] .+ (\w+): (.+)/,
        ftop: / \* (\#\d+) (\w+) - (\$[\d,]+) \[. -?[\d.]+\%\] \[. (\$[\d,]+)\]/
    },
    overlord: {
        joincmd: '/server overlord',
        msg: /\[Overlord Realm\] \[([\w]+) -> me\] (.+)/,
        fchat: /\[Faction\] .+ (\w+): (.+)/,
        ftop: / \* (\#\d+) (\w+) - (\$[\d,]+) \[. -?[\d.]+\%\] \[. (\$[\d,]+)\]/
    }
}
const wallperms = {
    ftop: false,
    addvalue: true,
    announce: false,
    sudo: false,
    runcmd: false,
    ban: false,
    kick: false,
    strike: false,
    restart: false,
    viewlogs: false,
    settings: false,
    online: false,
    mute: false,
    linkaccount: true,
    force_unlink_account: false,
    check: true,
    grace: false,
    purgemessages: false,
    dmrole: false,
    lock: false,
    blacklist: false,
    setstats: false,
    toggle: false,
    resetallscores: false,
    resetstats: false,
    bancmd: false,
    managepermissions: false
}
const advancedperms = {
    ftop: true,
    addvalue: true,
    announce: true,
    sudo: false,
    runcmd: true,
    ban: false,
    kick: false,
    strike: true,
    restart: false,
    viewlogs: true,
    settings: false,
    online: true,
    mute: true,
    linkaccount: true,
    force_unlink_account: false,
    check: true,
    grace: false,
    purgemessages: true,
    dmrole: false,
    lock: false,
    blacklist: false,
    setstats: false,
    toggle: false,
    resetallscores: false,
    resetstats: false,
    bancmd: false,
    managepermissions: false
}
const adminperms = {
    ftop: true,
    addvalue: true,
    announce: true,
    sudo: true,
    runcmd: true,
    ban: true,
    kick: true,
    strike: true,
    restart: true,
    viewlogs: true,
    settings: true,
    online: true,
    mute: true,
    linkaccount: true,
    force_unlink_account: true,
    check: true,
    grace: true,
    purgemessages: true,
    dmrole: true,
    lock: true,
    blacklist: true,
    setstats: true,
    toggle: true,
    resetallscores: true,
    resetstats: true,
    bancmd: true,
    managepermissions: true
}

const noun = string => string.replace(/^\w/, c => c.toUpperCase());

const toBool = (text) => {
    if (typeof text !== 'string') return;
    text = text.toLowerCase()
    if (text == 'yes' || text == 'true' || text == 'on' || text == 'y' || text == 'enable') return true;
    else if (text == 'no' || text == 'false' || text == 'off' || text == 'n' || text == 'disable') return false;
    else return;
}
let cmd;

const warning = (sent, msg) => {
    if (!msg) return console.log("NO MESSAGE FOR THE WARNING")
    const warnembed = new Discord.MessageEmbed()
        .setTitle("Warning")
        .setDescription(`:warning: ${sent}`)
        .setColor('DARK_ORANGE')
        .setFooter(`${msg.author.tag}`);
    msg.channel.send(warnembed).then(msg => msg.delete({
        timeout: 60000
    })).catch(console.error);
}

const writeJSON = (object, objectname) => fs.writeFile(`./databases/${objectname.toLowerCase()}.json`, JSON.stringify(object, null, 4), err => {
    if (err) console.log(err)
})

//backup every 8.5 hours
setInterval(() => {
    fs.writeFile(`./backup/userdata.json`, JSON.stringify(userdata, null, 4), err => {
        if (err) console.log(err)
    });
    fs.writeFile(`./backup/permissions.json`, JSON.stringify(permissions, null, 4), err => {
        if (err) console.log(err)
    });
    fs.writeFile(`./backup/settings.json`, JSON.stringify(settings, null, 4), err => {
        if (err) console.log(err)
    });
    fs.writeFile(`./backup/hardconfig.json`, JSON.stringify(hardconfig, null, 4), err => {
        if (err) console.log(err)
    });
    writeJSON(hardconfig, 'hardconfig')
    writeJSON(settings, 'settings')
    writeJSON(permissions, 'permissions')
}, 30600000)


if (hardconfig.update === true && (!('shieldend' in settings))) {
    settings.shieldstart = '';
    settings.shieldend = '';
    hardconfig.update = false;
    writeJSON(hardconfig, 'hardconfig');
    writeJSON(settings, 'settings');
    console.log('Updated bot')
}




if (!hardconfig.setup) {
    let setupprogress = {
        setupstarted: false,
        prefix: false
    }
    let setupuser;
    let setupguild;
    let settings = {
        wallsenabled: false,
        bufferenabled: false,
        cactusenabled: false,
        valueenabled: false,
        strikesenabled: false,
        ftopenabled: false,
        fchatenabled: false,
        weewooinvoice: false,
        verifyregister: true,
        fchatcommands: false,
        wallremindertime: 15,
        wallreminderinterval: 10,
        bufferremindertime: 60,
        bufferreminderinterval: 15,
        cactusremindertime: 20,
        cactusreminderinterval: 10,
        ftopinterval: 30,
        minwalltime: 3,
        minbuffertime: 15,
        mincactustime: 10,
        blacklists: [],
        muted: [],
        bannedcommands: [],
        wallremindermessage: "/ff The walls have not been checked in [since]. Check walls!",
        bufferremindermessage: "/ff The buffers have not been checked in [since]. Check buffers!",
        cactusremindermessage: "/ff The cactus walls have not been checked in [since]!",
        addvaluemessage: "/ff [user] added [value]. Their total is now [totalvalue]",
        strikemessage: "/ff [mod] has given [striked] a strike for [reason]",
        wallclearmessage: "/ff The walls have been cleared by [checker] after [since]. [[score]]",
        wallweewoomessage: "/ff WEEWOO!! WE ARE BEING RAIDED!! /tpa [checker]. Checked after [since].",
        cactusclearmessage: "/ff The cactus walls have been cleared by [checker] after [since] through [platform]. [[score]]",
        cactusweewoomessage: "/ff WEEWOO!! OUR CACTUS IS BEING RAIDED!! /tpa [checker]. Checked after [since].",
        bufferclearmessage: "/ff The buffers have been cleared by [checker] after [since] through [platform]. [[score]]",
        bufferalertmessage: "/ff ALERT: [checker] has found new claims or builds near our buffer: [info]",
        bufferweewoomessage: "/ff WEEWOO!! WE ARE BEING SET UP ON!! /tpa [checker]. Checked after [since].",
        discordwallreminder: ":bell: **CHECK WALLS** :bell:\n @here [wallsrole] It has been `[since]` since the last wall check by [lastchecker]! CHECK WALLS!",
        discordbufferreminder: "@here [wallsrole] The buffers have not been checked in [since]. They were last checked by [lastchecker] through [platform].",
        discordcactusreminder: ":bell: **CHECK CACTUS WALLS** :bell:\n @here [wallsrole] It has been `[since]` since the last cactus wall check by [lastchecker]! CHECK WALLS!"
    }
    let announcechannel;
    client.on('ready', () => {
        console.log('SaicoPvP Discord Bot started for setup.');
        console.log('---------------------------------------------------------------------');
        console.log('Created by Bleezed#2895');
        console.log('-------------------------------------------------------');
        announcechannel = client.guilds.cache.find(guild => guild.available == true).systemChannel
        setupembed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTitle("SaicoPVP Discord Bot")
            .addFields({
                name: "BEGIN",
                value: "Send `$setup` to begin the setup."
            }, {
                name: "Made by:",
                value: "<@319512181597274115>"
            }, {
                name: "Currently using version:",
                value: `**\`1.3.2\`**`
            }, {
                name: `Support Server:`,
                value: `https://discord.gg/9QH8aUU`
            })
        if (announcechannel) announcechannel.send(setupembed).catch(console.error)

    });

    client.on('message', message => {
        if ((message.content == '$setup') && (!setupprogress.setupstarted) && (message.channel.type !== 'dm')) {
            console.log('Setup started')
            message.author.send("Setup started.\nReply to all following messages with the values you want the corresponding value to be.")
                .then(message.reply('Sent you a private message to begin the setup'))
                .then(message.delete())
                .then(setupuser = message.author)
                .then(setupguild = message.guild)
                .then(hardconfig.guild = setupguild.id)
                .catch((err) => {
                    warning("There was an error beginning the setup. Please check your hardconfig.json file or the bot client and try again", message);
                    message.delete().catch(console.error);
                    console.log(err)
                    return;
                })
            setupuser.send("What do you want the prefix of the bot to be?\nFor example: if you want to use commands like `$help`, reply with `$`")
                .then(setupstarted = true)
                .then(setupprogress.prefix = true)
                .then(setupprogress.setupstarted = true)
                .catch(console.error);

        } else if ((message.content == '$setup') && (message.channel.type != 'dm') && (setupprogress.setupstarted)) {
            warning(`Setup has been started already by <@${setupuser.id}>`, message);
            message.delete().catch(console.error);
            return;
        } else if ((setupprogress.setupstarted) && (message.channel.type == 'dm') && (message.author == setupuser)) {
            if (setupprogress.prefix) {
                hardconfig.prefix = message.content;
                setupuser.send("Bot prefix set to `" + hardconfig.prefix + "`\nWhat realm do you want to use the bot on? You can choose betweeen `Creeper, Overlord, Warlock`")
                    .then(setupprogress.prefix = false)
                    .then(setupprogress.realm = true)
                    .catch(console.error)
                setupprogress.prefix = false;
                setupprogress.realm = true;
            } else if (setupprogress.realm) {
                let realmsetup = message.content.toLowerCase()
                if (realms[realmsetup]) {
                    hardconfig.realm = realmsetup;
                    setupuser.send("Realm set to `" + noun(hardconfig.realm) + `\`\nDo you want to enable the ingame bot now? \`yes\` or \`no\``)
                        .then(setupprogress.realm = false)
                        .then(() => {
                            setupprogress.ingame = true;
                        })
                        .catch(console.error);
                } else setupuser.send("Please enter a valid realm from the list of: `Creeper, Overlord, Warlock`").catch(console.error);
            } else if (setupprogress.ingame) {
                if (typeof toBool(message.content) !== 'undefined') {
                    hardconfig.ingame = toBool(message.content);
                    setupuser.send(`Ingame features ${(hardconfig.ingame) ? `enabled` : `disabled`}.\nWhat should the ingame command be to clear walls. For example if you want to clear walls by messaging the bot \`/msg BOT .clear walls\` then reply with \`.clear walls\``)
                        .then(setupprogress.ingame = false)
                        .then(setupprogress.clearwallcmd = true)
                        .catch(console.error);
                } else setupuser.send('Please reply with either `yes` or `no`.')
            } else if (setupprogress.clearwallcmd) {
                cmd = message.content.toLowerCase();
                hardconfig.clearwallcommand = cmd
                setupuser.send("Clear walls command set to`" + hardconfig.clearwallcommand + "`\nWhat should the ingame command be to weewoo the walls?\n")
                    .then(setupprogress.clearwallcmd = false)
                    .then(setupprogress.weewoowallcmd = true)
                    .catch(console.error);

            } else if (setupprogress.weewoowallcmd) {
                cmd = message.content.toLowerCase();
                hardconfig.weewoowallcommand = cmd;
                setupuser.send("Weewoo walls command set to`" + hardconfig.weewoowallcommand + "`\nWhat should the ingame command be to clear the cactus walls?\n")
                    .then(setupprogress.weewoowallcmd = false)
                    .then(setupprogress.clearcactuscmd = true)
                    .catch(console.error);

            } else if (setupprogress.clearcactuscmd) {
                cmd = message.content.toLowerCase();
                hardconfig.clearcactuscommand = cmd
                setupuser.send("Clear cactus walls command set to`" + hardconfig.clearcactuscommand + "`\nWhat should the ingame command be to weewoo the cactus walls?\n")
                    .then(setupprogress.clearcactuscmd = false)
                    .then(setupprogress.weewoocactuscmd = true)
                    .catch(console.error);

            } else if (setupprogress.weewoocactuscmd) {
                cmd = message.content.toLowerCase();
                hardconfig.weewoocactuscommand = cmd;
                setupuser.send("Weewoo cactus walls command set to`" + hardconfig.weewoocactuscommand + "`\nWhat should the ingame command be to clear the buffer?\n")
                    .then(setupprogress.weewoocactuscmd = false)
                    .then(setupprogress.clearbuffercmd = true)
                    .catch(console.error);

            } else if (setupprogress.clearbuffercmd) {
                cmd = message.content.toLowerCase();
                hardconfig.clearbuffercommand = cmd;
                setupuser.send("Clear buffer command set to`" + hardconfig.clearbuffercommand + "`\nWhat should the ingame command be to weewoo the buffer?\n")
                    .then(setupprogress.clearbuffercmd = false)
                    .then(setupprogress.weewoobuffercmd = true)
                    .catch(console.error);

            } else if (setupprogress.weewoobuffercmd) {
                cmd = message.content.toLowerCase();
                hardconfig.weewoobuffercommand = cmd;
                setupuser.send("Weewoo buffer command set to`" + hardconfig.weewoobuffercommand + "`\nWhat should the ingame command be to alert of new buffer claims in the format `/msg BOT <command> [information]`?\n")
                    .then(setupprogress.weewoobuffercmd = false)
                    .then(setupprogress.alertbuffercmd = true)
                    .catch(console.error);

            } else if (setupprogress.alertbuffercmd) {
                cmd = message.content.toLowerCase();
                hardconfig.alertbuffercommand = cmd;
                setupuser.send("Alert buffer command set to`" + hardconfig.alertbuffercommand + "`\nWhat should the ingame command be to strike a player in the format `/msg BOT <command> <player> <reason>`?")
                    .then(setupprogress.alertbuffercmd = false)
                    .then(setupprogress.strikecmd = true)
                    .catch(console.error);

            } else if (setupprogress.strikecmd) {
                cmd = message.content.toLowerCase();
                hardconfig.strikecommand = cmd;
                setupuser.send("Strike command set to`" + hardconfig.strikecommand + "`\nWhat should the ingame command be to add value in the format `/msg BOT <command> [value]`?")
                    .then(setupprogress.strikecmd = false)
                    .then(setupprogress.valuecmd = true)
                    .catch(console.error);

            } else if (setupprogress.valuecmd) {
                cmd = message.content.toLowerCase();
                hardconfig.addvaluecommand = cmd;
                setupuser.send("Add value command set to`" + hardconfig.addvaluecommand + "`\nWhat is the name of the role of Wallcheckers on your server? \nFor example: `Walls or Wall-Checkers`")
                    .then(setupprogress.valuecmd = false)
                    .then(setupprogress.wallrole = true)
                    .catch(console.error);

            } else if (setupprogress.wallrole) {
                if (setupguild.roles.cache.some(role => role.name == message.content)) {
                    wallsid = setupguild.roles.cache.find(role => role.name == message.content).id
                    permissions[wallsid] = wallperms;
                    hardconfig.wallsrole = message.content;
                    setupuser.send("Wallsrole set to `" + hardconfig.wallsrole + "`\nWhat is the name of the role of Moderators on your server? These users have access to more commands than regular wallcheckers. You will be able to configure the allowed commands for these players.\n```NOTE: There is still an Admin  role that has access to all commands```")
                        .then(setupprogress.wallrole = false)
                        .then(setupprogress.modrole = true)
                        .catch(console.error)
                } else setupuser.send("This role does not exist on the server. Please enter another role that already exists on the server.").catch(console.error);
            } else if (setupprogress.modrole) {
                if (setupguild.roles.cache.some(role => role.name == message.content)) {
                    modid = setupguild.roles.cache.find(role => role.name == message.content).id
                    permissions[modid] = advancedperms;
                    hardconfig.modrole = message.content;
                    setupuser.send("Modrole set to `" + hardconfig.modrole + "`\nWhat is the name of the role of Admins on your server? Users with this role on your server will be able to perform all bot commands.")
                        .then(setupprogress.modrole = false)
                        .then(setupprogress.adminrole = true)
                        .catch(console.error);
                } else setupuser.send("This role does not exist on the server. Please enter another role that already exists on the server.").catch(console.error);
            } else if (setupprogress.adminrole) {
                if (setupguild.roles.cache.some(role => role.name == message.content)) {
                    adminid = setupguild.roles.cache.find(role => role.name == message.content).id
                    permissions[adminid] = adminperms;
                    hardconfig.adminrole = message.content;
                    setupuser.send("Adminrole set to `" + hardconfig.adminrole + "`\nWhat is the name of the Channel for Wallchecks on your server? ```For any channels for features that you do not need, simply enter any already existing channel, as the channel will only be used when the feature is enabled. The channels can also be changed later.```")
                        .then(setupprogress.adminrole = false)
                        .then(setupprogress.wallchannel = true)
                        .catch(console.error);
                } else setupuser.send("This role does not exist on the server. Please enter another role that already exists on the server.").catch(console.error);
            } else if (setupprogress.wallchannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.wallchannel = message.content;
                    setupuser.send("Wallcheck channel set to `" + hardconfig.wallchannel + "`\nWhat is the name of the channel for cactus wall checks on your server?")
                        .then(setupprogress.wallchannel = false)
                        .then(setupprogress.cactuschannel = true)
                        .catch(console.error);
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            } else if (setupprogress.cactuschannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.cactuschannel = message.content;
                    setupuser.send("Cactus check channel set to `" + hardconfig.cactuschannel + "`\nWhat is the name of the channel for bufferchecks on your server?")
                        .then(setupprogress.cactuschannel = false)
                        .then(setupprogress.bufferchannel = true)
                        .catch(console.error);
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            } else if (setupprogress.bufferchannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.bufferchannel = message.content;
                    setupuser.send("Buffercheck channel set to `" + hardconfig.bufferchannel + "`\nWhat is the name of the channel for Value logs on your server?")
                        .then(setupprogress.bufferchannel = false)
                        .then(setupprogress.valuechannel = true)
                        .catch(console.error);
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            } else if (setupprogress.valuechannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.valuechannel = message.content;
                    setupuser.send("Value log channel set to `" + hardconfig.valuechannel + "`\nWhat is the name of the channel for FTop Updates on your server?")
                        .then(setupprogress.valuechannel = false)
                        .then(setupprogress.ftopchannel = true)
                        .catch(console.error);
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            } else if (setupprogress.ftopchannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.ftopchannel = message.content;
                    setupuser.send("Ftop Update channel set to `" + hardconfig.ftopchannel + "`\nWhat is the name of the channel to log Ingame Faction Chat on your server?")
                        .then(setupprogress.ftopchannel = false)
                        .then(setupprogress.fchatchannel = true)
                        .catch(console.error);
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            } else if (setupprogress.fchatchannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.fchatchannel = message.content;
                    setupuser.send("F Chat channel set to `" + hardconfig.fchatchannel + "`\nWhat is the name of the channel to log Strikes on your server?")
                        .then(setupprogress.fchatchannel = false)
                        .then(setupprogress.strikechannel = true)
                        .catch(console.error);
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            } else if (setupprogress.strikechannel) {
                if (setupguild.channels.cache.some(channel => channel.name == message.content)) {
                    hardconfig.strikeschannel = message.content;
                    setupuser.send("Strike channel set to `" + hardconfig.strikeschannel + `\`\nSetup Complete. Bot restarting to be fully functional. You can then use **\`${hardconfig.prefix}help\`** to view all the commands.`)
                        .then(setupprogress.strikechannel = false)
                        .then(permissions[message.author.id] = adminperms)
                        .then(writeJSON(permissions, 'permissions'))
                        .then(hardconfig.setup = true)
                        .then(() => {
                            writeJSON(hardconfig, 'hardconfig')
                            settings.shieldstart = '';
                            settings.shieldend = '';
                            writeJSON(settings, 'settings');
                            setTimeout(() => process.exit(), 8000);
                        })
                        .catch(console.error);
                    const setupdoneembed = new Discord.MessageEmbed()
                    if (announcechannel) announcechannel.send(setupdoneembed)
                } else setupuser.send(`This channel does not exist on the server. Please enter the name of a channel that already exists on the server.`).catch(console.error);
            }

        }
    });
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////    Actual Bot  ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
else {

    let wallmark;
    let buffermark;
    let cactusmark;
    let cactusmethod;
    let wallmethod;
    let buffermethod;
    let wallsmessage;
    let wallsreminder;
    let buffermessage;
    let bufferreminder;
    let weewooconfirm;
    let bufferconfirm;
    let cactusconfirm;
    let wallweewooer;
    let bufferweewooer;
    let cactusweewooer;
    let cactusmessage;
    let lastwallign;
    let lastcactusign;
    let lastbufferign;
    let bot;
    let cactusreminder;
    let lastwallchecker;
    let lastbufferchecker;
    let lastcactuschecker;
    let dataone = [];
    let datatwo = [];
    let canedataone = [];
    let canedatatwo = [];
    let datathree = [];
    let runcmddata = [];
    let ftop;
    let canetop;
    let online;
    let runcmd;
    let fchatmessage;
    let striked;
    let botchannel;
    let wallweewoo;
    let cactusweewoo;
    let wallschannel;
    let valuenames;
    let transferstatuser;
    let transferstatreceiver;
    let mentioned;
    let connection;
    const valuenamesv2 = {
        million: [1000000, 'm', 'mil', 'million', 'mill', 'millions'],
        billion: [1000000000, 'b', 'bil', 'billion', 'billions'],
        cow: [90000, 'cows', 'cow'],
        mooshroom: [50000, 'shroom', 'mshroom', 'mooshroom', 'mooshrooms', 'mshrooms'],
        pig: [25000, 'pig', 'pigs'],
        sheep: [35000, 'sheep', 'sheeps'],
        chicken: [50000, 'chicken', 'chickens'],
        rabbit: [70000, 'rabbit', 'rabbits', 'bunny', 'bunnys', 'bunnies'],
        horse: [100000, 'horse', 'horses'],
        skeleton: [300000, 'skele', 'skelly', 'skeleton', 'skeletons', 'skeles', 'skellys'],
        zombie: [200000, 'zombie', 'zombies'],
        wolf: [150000, 'wolf', 'wolfs', 'wolves'],
        ocelot: [150000, 'ocelot', 'ocelots', 'cat', 'cats'],
        squid: [170000, 'squid', 'squids'],
        slime: [190000, 'slime', 'slimes'],
        spider: [215000, 'spiders', 'spider', 'spooder', 'spooders'],
        cavespider: [215000, 'cspider', 'cavespider', 'cavespiders', 'cspiders'],
        magmacube: [250000, 'mcube', 'magma', 'magmas', 'cube', 'mcubes', 'cubes', 'magmacube', 'magmacubes'],
        creeper: [1000000, 'creeper', 'creepers'],
        guardian: [500000, 'guardians', 'guardian'],
        enderman: [700000, 'eman', 'emen', 'emans', 'emens', 'enderman', 'endermen', 'endermens'],
        witch: [900000, 'witch', 'witches', 'witchs'],
        villager: [1250000, 'vill', 'villager', 'villagers', 'villy', 'villies', 'villie', 'villys'],
        pigzombie: [1500000, 'pigman', 'pigmen', 'pigzombie', 'pmen', 'pman', 'pigzombies', 'pigmans', 'pigmens', 'pmens', 'pmans'],
        blaze: [1000000, 'blaze', 'blazes'],
        crophopper: [250000, 'ch', 'crophopper', 'crophoppers'],
        hopper: [25000, 'hoppers', 'hopper'],
        thousand: [1000, 'k', 'grand', 'thousand']
    }
    const valuenamesv1 = {
        million: [1000000, 'm', 'mil', 'million', 'mill', 'millions'],
        billion: [1000000000, 'b', 'bil', 'billion', 'billions'],
        pig: [50000, 'pig', 'pigs'],
        silverfish: [200000, 'silver', 'silverfish', 'silverfishes', 'silverfishs', 'silvers', 'sf', 'sfish'],
        endermite: [200000, 'emite', 'endermite', 'endermites', 'emites'],
        sheep: [60000, 'sheep', 'sheeps'],
        chicken: [60000, 'chicken', 'chickens'],
        wolf: [50000, 'wolf', 'wolfs', 'wolves'],
        ocelot: [150000, 'ocelot', 'ocelots', 'cat', 'cats'],
        rabbit: [75000, 'rabbit', 'rabbits', 'bunny', 'bunnys', 'bunnies'],
        cow: [95000, 'cows', 'cow'],
        magmacube: [500000, 'mcube', 'magma', 'magmas', 'cube', 'mcubes', 'cubes', 'magmacube', 'magmacubes'],
        mooshroom: [95000, 'shroom', 'mshroom', 'mooshroom', 'mooshrooms', 'mshrooms'],
        horse: [120000, 'horse', 'horses'],
        spider: [260000, 'spiders', 'spider', 'spooder', 'spooders'],
        cavespider: [260000, 'cspider', 'cavespider', 'cavespiders', 'cspiders'],
        squid: [150000, 'squid', 'squids'],
        slime: [225000, 'slime', 'slimes'],
        guardian: [400000, 'guardians', 'guardian'],
        bat: [525000, 'bat', 'bats'],
        ghast: [750000, 'ghast', 'ghasts'],
        skeleton: [300000, 'skele', 'skelly', 'skeleton', 'skeletons', 'skeles', 'skellys'],
        zombie: [300000, 'zombie', 'zombies'],
        creeper: [900000, 'creeper', 'creepers'],
        enderman: [900000, 'eman', 'emen', 'emans', 'emens', 'enderman', 'endermen', 'endermens'],
        witherskeleton: [1400000, 'witherskeleton', 'witherskeletons', 'witherskele', 'wskelly', 'witherskelly', 'witherskeles', 'wskeleton', 'witherskellys', 'wskeletons', 'wskeles', 'wskellys'],
        witch: [1100000, 'witch', 'witches', 'witchs'],
        villager: [1750000, 'vill', 'villager', 'villagers', 'villy', 'villies', 'villie', 'villys'],
        pigzombie: [1400000, 'pigman', 'pigmen', 'pigzombie', 'pmen', 'pman', 'pigzombies', 'pigmans', 'pigmens', 'pmens', 'pmans'],
        blaze: [1100000, 'blaze', 'blazes'],
        skeletonhorse: [2500000, 'skelehorse', 'skeletonhorses', 'skeletonhorse', 'shorse', 'skellyhorse', 'skelehorses', 'shorses', 'skellyhorses'],
        undeadhorse: [2500000, 'undead', 'undeads', 'undeadhorse', 'uhorse', 'undeadhorses', 'zombiehorse', 'zhorse'],
        hopper: [25000, 'hoppers', 'hopper'],
        mobhopper: [500000, 'mobhopper', 'mobhoppers'],
        thousand: [1000, 'k', 'grand', 'thousand']
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    })
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ////////////////////FUNCTIONS//////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////

    const weewooInVoice = async () => {
        let channellist = client.guilds.cache.get(hardconfig['guild']).channels.cache.filter(channel => channel.type === 'voice');
        channellist = channellist.filter(channel => channel.members.size > 0);
        channellist = channellist.array();
        if (channellist.length == 0)
            return;
        for (let i of channellist) {
            var doneplaying = new Promise(async (resolve, reject) => {
                let connection = await i.join();
                let dispatcher = await connection.play('WEEWOO.mp3');
                dispatcher.on('finish', () => {
                    connection.disconnect();
                    setTimeout(() => resolve('Done'), 1500);
                });
                dispatcher.on('error', () => {
                    console.error;
                    connection.disconnect();
                    setTimeout(() => resolve('Failed'), 1500);
                });
            });
            await doneplaying;
            continue;
        }
    };


    const getUUIDjson = async name => axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`).catch(console.error) //to get the UUID, use x.data.id
    const sinceInHours = lasttime => Math.floor(((Date.now() - lasttime) / 1000) / 3600);
    const sinceInMinutes = lasttime => (((Date.now() - lasttime) / 1000) / 60);
    const sinceInMinutesInt = lasttime => Math.floor((((Date.now() - lasttime) / 1000) / 60) % 60);
    const sinceInSeconds = lasttime => Math.floor(((Date.now() - lasttime) / 1000) % 60);

    const checkedAfter = lasttime => {
        if (sinceInHours(lasttime) > 0) return `${sinceInHours(lasttime)}h ${sinceInMinutesInt(lasttime)}m ${sinceInSeconds(lasttime)}s`
        else if (sinceInMinutesInt(lasttime) > 0) return `${sinceInMinutesInt(lasttime)}m ${sinceInSeconds(lasttime)}s`
        else return `${sinceInSeconds(lasttime)}s`
    }

    const sinceCheck = lasttime => {
        if (sinceInHours(lasttime) > 0) {
            minutesstring = (sinceInMinutesInt(lasttime) == 1) ? ` ${sinceInMinutesInt(lasttime)} minute` : ` ${sinceInMinutesInt(lasttime)} minutes`
            if (sinceInMinutesInt(lasttime) == 0) minutesstring = ''
            if (sinceInHours(lasttime) == 1) return `${sinceInHours(lasttime)} hour${minutesstring}`
            else return `${sinceInHours(lasttime)} hours${minutesstring}`
        } else if (sinceInMinutesInt(lasttime) == 1) return `${sinceInMinutesInt(lasttime)} minute`
        else return `${sinceInMinutesInt(lasttime)} minutes`
    }

    const uuidToDiscordID = uuid => ids = Object.keys(userdata).find(key => userdata[key].uuids.includes(uuid));
    const ignToDiscordID = ign => ids = Object.keys(userdata).find(key => userdata[key].names.includes(ign));
    const codeToDiscordID = code => ids = Object.keys(userdata).find(key => userdata[key].code == code);

    const isRegExpFormat = (message, regEx) => regEx.test(message);
    const initAcc = (id, ign, uuid) => {
        if (uuid) {
            userdata[id].uuids.push(uuid)
            userdata[id].names.push(ign);
        } else throw TypeError("You need to enter a valid IGN")
    }


    const calcValue = text => {
        text = text.replace(/[ \$]+/g, '');
        numbers = parseFloat(text.replace(/[A-Za-z]+/g, ''));

        type = text.replace(/[0-9.]+/g, '');
        type = type.toLowerCase();
        type = type.replace(/spawners/g, '');
        type = type.replace(/spawner/g, '');
        if (hardconfig.realm == 'overlord' || hardconfig.realm == 'warlock') valuenames = valuenamesv2
        else valuenames = valuenamesv1
        if (type == '') return (numbers ? numbers : 0)
        else {
            const keys = Object.keys(valuenames)
            for (i in keys) {
                key = keys[i]
                if (valuenames[key].includes(type)) {
                    return (numbers ? numbers : 1) * valuenames[key][0];
                }
                continue;
            }
            return 0
        }
    }

    const shieldIsOff = () => {
        if (!isRegExpFormat(settings.shieldstart, /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/) || !isRegExpFormat(settings.shieldend, /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/))
            return true;
        let startmin = parseInt(settings.shieldstart.split(':')[0]) * 60 + parseInt(settings.shieldstart.split(`:`)[1]);
        let endmin = parseInt(settings.shieldend.split(':')[0]) * 60 + parseInt(settings.shieldend.split(`:`)[1]);
        let nowmin = Math.floor(((Date.now() % 86400000) / 60000));
        if ((startmin < endmin) && (nowmin >= startmin) && (nowmin < endmin))
            return false;
        else if ((startmin > endmin) && ((nowmin < endmin) || (nowmin >= startmin)))
            return false;
        else if ((startmin == endmin) && (nowmin == startmin))
            return false;
        return true;
    };

    //COMMAND FUNCTIONS
    const hasPerms = (member, perm) => {
        if (member.hasPermission("ADMINISTRATOR")) return true;
        if (member.id in permissions) {
            if (permissions[member.id][perm] === true) return true;
            else if (permissions[member.id][perm] === false) return false;
        }
        for (role of member.roles.cache.array()) {
            if (role.id in permissions && permissions[role.id][perm] == true) {
                return true;
            }
        }
        return false;
    }

    const hasSpecialPerms = (member, perm) => {
        if (member.id in permissions) {
            if (permissions[member.id][perm] === true) return true;
        }
        return false;
    }

    const clearCactus = async (ign, id, platform) => {
        cactusweewoo = false;
        if (sinceInMinutes(times.lastcactuscheck) >= parseFloat(settings.mincactustime)) userdata[id].cactuschecks += 1;
        checker = client.users.cache.get(id)
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (cactusmessage && cactusmessage.reactions) cactusmessage.reactions.removeAll().catch(console.error)
        const clearcactusembed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setFooter(`${checker.tag}`, `${checker.displayAvatarURL()}`)
            .setTimestamp()
            .setThumbnail(link)
            .setTitle(`:white_check_mark: ${ign} marked the cactus walls clear through ${platform}`)
            .addFields({
                name: `Checked by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Score:`,
                value: `${userdata[id].cactuschecks}`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastcactuscheck)}`,
                inline: true
            })

        cactuschannel.send(clearcactusembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                cactusmessage = message;
            })
            .catch(console.error)
        if (bot) bot.write('chat', {
            message: `${settings[`cactusclearmessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastcactuscheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].cactuschecks}`)}`
        })
        times.lastcactuscheck = Date.now();
        times.lastcactusreminder = Date.now();
        if ((cactusreminder) && (!cactusreminder.deleted)) cactusreminder.delete().catch(console.error)
        lastcactuschecker = checker;
        cactusmethod = platform;
        lastcactusign = ign;
        cactusmark = "Clear";
        fs.appendFile(`./logs/cactuschecks.txt`, `:white_check_mark:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })
    }

    const weewooCactus = async (ign, id, platform) => {
        cactusweewoo = true;
        if (sinceInMinutes(times.lastcactuscheck) >= parseFloat(settings.mincactustime)) userdata[id].cactuschecks += 1;
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (cactusmessage && cactusmessage.reactions) cactusmessage.reactions.removeAll().catch(console.error)
        const weewoocactusembed = new Discord.MessageEmbed()
            .setColor('DARK_RED')
            .setFooter(`${checker.tag}`, `${checker.displayAvatarURL()}`)
            .setTimestamp()
            .setThumbnail('https://i.imgur.com/oAJOKSy.jpg')
            .setTitle(`:bangbang: WEEWOO :bangbang: OUR CACTUS IS BEING RAIDED`)
            .addFields({
                name: `Marked by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Score:`,
                value: `${userdata[id].cactuschecks}`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastcactuscheck)}`,
                inline: true
            })

        cactuschannel.send(weewoocactusembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                cactusmessage = message;
            })
            .then(() => {
                for (let i = 0; i < 3; i++) {
                    cactuschannel.send(`@here <@&${client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.wallsrole).id}> **WE ARE BEING RAIDED! GET ON NOW!!!**`)
                }
            })
            .catch(console.error)
        if (bot) bot.write('chat', {
            message: `${settings[`cactusweewoomessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastcactuscheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].cactuschecks}`)}`
        })
        times.lastcactuscheck = Date.now();
        times.lastcactusreminder = Date.now();
        if ((cactusreminder) && (!cactusreminder.deleted)) cactusreminder.delete().catch(console.error)
        lastcactuschecker = checker;
        cactusmethod = platform;
        lastcactusign = ign;
        cactusmark = "WeeWoo";
        fs.appendFile(`./logs/cactuschecks.txt`, `:x:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })
    }

    const clearWalls = async (ign, id, platform) => {
        wallweewoo = false;
        if (sinceInMinutes(times.lastwallcheck) >= parseFloat(settings.minwalltime)) userdata[id].wallchecks += 1;
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (bot) bot.write('chat', {
            message: `${settings[`wallclearmessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastwallcheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].wallchecks}`)}`
        })
        if (wallsmessage && wallsmessage.reactions) wallsmessage.reactions.removeAll().catch(console.error)
        const clearwallembed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setFooter(`${checker.tag}`, `${checker.displayAvatarURL()}`)
            .setTimestamp()
            .setThumbnail(link)
            .setTitle(`:white_check_mark: ${ign} marked the walls clear through ${platform}`)
            .addFields({
                name: `Checked by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Score:`,
                value: `${userdata[id].wallchecks}`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastwallcheck)}`,
                inline: true
            })

        wallschannel.send(clearwallembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                wallsmessage = message;
            })
            .catch(console.error)
        times.lastwallcheck = Date.now();
        times.lastwallreminder = Date.now();
        if ((wallsreminder) && (!wallsreminder.deleted)) wallsreminder.delete().catch(console.error)
        lastwallchecker = checker;
        lastwallign = ign
        wallmethod = platform;
        wallmark = "Clear";
        fs.appendFile(`./logs/wallchecks.txt`, `:white_check_mark:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })
    }

    const weewooWalls = async (ign, id, platform) => {
        wallweewoo = true;
        if (sinceInMinutes(times.lastwallcheck) >= parseFloat(settings.minwalltime)) userdata[id].wallchecks += 1;
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (bot) bot.write('chat', {
            message: `${settings[`wallweewoomessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastwallcheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].wallchecks}`)}`
        })
        if (wallsmessage && wallsmessage.reactions) wallsmessage.reactions.removeAll().catch(console.error)
        const weewoowallembed = new Discord.MessageEmbed()
            .setColor('DARK_RED')
            .setFooter(`${checker.tag}`, `${checker.displayAvatarURL()}`)
            .setTimestamp()
            .setThumbnail('https://i.imgur.com/oAJOKSy.jpg')
            .setTitle(`:bangbang: WEEWOO :bangbang: WE ARE BEING RAIDED`)
            .addFields({
                name: `Marked by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Score:`,
                value: `${userdata[id].wallchecks}`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastwallcheck)}`,
                inline: true
            })

        wallschannel.send(weewoowallembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                wallsmessage = message;
            })
            .then(() => {
                for (let i = 0; i < 3; i++) {
                    wallschannel.send(`@here <@&${client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.wallsrole).id}> **WE ARE BEING RAIDED! GET ON NOW!!!**`)
                }
            })
            .catch(console.error)
        times.lastwallcheck = Date.now();
        times.lastwallreminder = Date.now();
        if ((wallsreminder) && (!wallsreminder.deleted)) wallsreminder.delete().catch(console.error)
        lastwallchecker = checker;
        wallmethod = platform;
        lastwallign = ign;
        wallmark = "WeeWoo";
        if (settings.weewooinvoice) weewooInVoice()
        fs.appendFile(`./logs/wallchecks.txt`, `:x:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })
        for (memid in userdata) {
            if (userdata[memid].pmweewoo && hasPerms(client.guilds.cache.get(hardconfig.guild).members.cache.get(memid), "check")) {
                client.guilds.cache.get(hardconfig.guild).members.cache.get(memid).send(`<@${memid}> :bangbang:WE ARE BEING RAIDED: MARKED BY <@${id}>:bangbang:`).catch(console.error)
                client.guilds.cache.get(hardconfig.guild).members.cache.get(memid).send(`<@${memid}> :bangbang:WE ARE BEING RAIDED: MARKED BY <@${id}>:bangbang:`).catch(console.error)
                client.guilds.cache.get(hardconfig.guild).members.cache.get(memid).send(`<@${memid}> :bangbang:WE ARE BEING RAIDED: MARKED BY <@${id}>:bangbang:`).catch(console.error)
            }
        }
    }

    const clearBuffer = async (ign, id, platform) => {
        if (sinceInMinutes(times.lastbuffercheck) >= parseFloat(settings.minbuffertime)) userdata[id].bufferchecks += 1;
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (buffermessage && buffermessage.reactions) buffermessage.reactions.removeAll().catch(console.error)
        if (bot) bot.write('chat', {
            message: `${settings[`bufferclearmessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastbuffercheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].bufferchecks}`)}`
        })
        const clearbufferembed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setFooter(`${checker.tag}`, `${checker.displayAvatarURL()}`)
            .setTimestamp()
            .setThumbnail(link)
            .setTitle(`:white_check_mark: ${ign} marked the buffers clear through ${platform}`)
            .addFields({
                name: `Checked by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Score:`,
                value: `${userdata[id].bufferchecks}`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastbuffercheck)}`,
                inline: true
            })

        bufferchannel.send(clearbufferembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                buffermessage = message;
            })
            .catch(console.error)
        times.lastbuffercheck = Date.now();
        times.lastbufferreminder = Date.now();
        if ((bufferreminder) && (!bufferreminder.deleted)) bufferreminder.delete().catch(console.error)
        lastbufferchecker = checker;
        buffermethod = platform;
        lastbufferign = ign;
        buffermark = "Clear";
        fs.appendFile(`./logs/bufferchecks.txt`, `:white_check_mark:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })
    }


    const weewooBuffer = async (ign, id, platform) => {
        if (sinceInMinutes(times.lastbuffercheck) >= parseFloat(settings.minbuffertime)) userdata[id].bufferchecks += 1;
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (buffermessage && buffermessage.reactions) buffermessage.reactions.removeAll().catch(console.error)
        if (bot) bot.write('chat', {
            message: `${settings[`bufferweewoomessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastbuffercheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].bufferchecks}`)}`
        })
        const weewoobufferembed = new Discord.MessageEmbed()
            .setColor('DARK_RED')
            .setFooter(`${checker.tag}`, `${checker.displayAvatarURL()}`)
            .setTimestamp()
            .setThumbnail('https://i.imgur.com/oAJOKSy.jpg')
            .setTitle(`:bangbang: WEEWOO :bangbang: SOMEONE IS SETTING UP ON US`)
            .addFields({
                name: `Marked by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Score:`,
                value: `${userdata[id].bufferchecks}`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastbuffercheck)}`,
                inline: true
            })

        bufferchannel.send(weewoobufferembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                buffermessage = message;
            })
            .then(() => bufferchannel.send(`@here <@&${client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.wallsrole).id}> **WE ARE BEING SET UP ON! GET ON NOW!!!**`).catch(console.error))
            .catch(console.error)
        times.lastbuffercheck = Date.now();
        times.lastbufferreminder = Date.now();
        if ((bufferreminder) && (!bufferreminder.deleted)) bufferreminder.delete().catch(console.error)
        lastbufferchecker = checker;
        buffermethod = platform;
        lastbufferign = ign;
        buffermark = "WeeWoo";
        fs.appendFile(`./logs/bufferchecks.txt`, `:x:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })
    }

    const displayFtop = () => {
        if (!bot) return;
        bot.write('chat', {
            message: `/f top`
        })
        ftop = true;
        setTimeout(() => {
            if (dataone == "" || datatwo == "" || datathree == "") return;
            const ftopembed = new Discord.MessageEmbed()
                .setTitle(`Faction Top - ${noun(hardconfig.realm)} Realm`)
                .setTimestamp()
                .addField("Faction", dataone.join("\n"), true)
                .addField("Value", datatwo.join("\n"), true)
                .addField("Change since Reboot", datathree.join("\n"), true)
                .setColor('NAVY');
            ftopchannel.send(ftopembed).catch(console.error);

            ftop = false;
            dataone = [];
            datatwo = [];
            datathree = [];
        }, 1000);
        times.lastftopcheck = Date.now()
    }



    const alertBuffer = async (ign, id, info, platform) => {
        if (sinceInMinutes(times.lastbuffercheck) >= parseFloat(settings.minbuffertime)) userdata[id].bufferchecks += 1;
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.tag
        }
        if (bot) bot.write('chat', {
            message: `${settings[`bufferalertmessage`].replace(/\[checker\]/g, `${ign}`).replace(/\[since\]/g, `${sinceCheck(times.lastbuffercheck)}`).replace(/\[platform\]/, `${platform}`).replace(/\[score\]/g, `${userdata[id].bufferchecks}`).replace(/\[info\]/g, `${info}`)}`
        })
        if (buffermessage && buffermessage.reactions) buffermessage.reactions.removeAll().catch(console.error)
        const alertembed = new Discord.MessageEmbed()
            .setTimestamp()
            .setColor('DARK_ORANGE')
            .setTitle(`:exclamation: BUFFER ALERT :exclamation:`)
            .addFields({
                name: `INFO:`,
                value: `\`${info}\``,
                inline: true
            }, {
                name: `Found by:`,
                value: `<@${id}>`,
                inline: true
            }, {
                name: `Checked after:`,
                value: `${checkedAfter(times.lastbuffercheck)}`,
                inline: true
            })
        bufferchannel.send(alertembed)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                buffermessage = message;
                message.pin({
                    reason: `Buffer alert`
                }).catch(console.error)
            })
            .catch(console.error)
        times.lastbuffercheck = Date.now();
        times.lastbufferreminder = Date.now();
        if ((bufferreminder) && (!bufferreminder.deleted)) bufferreminder.delete().catch(console.error)
        lastbufferchecker = checker;
        buffermethod = platform;
        lastbufferign = ign;
        buffermark = "Alert";
        fs.appendFile(`./logs/bufferchecks.txt`, `:alert:**:** <@${id}>  **- ${new Date().toUTCString()}**\r\n`, err => {
            if (err) console.log(err)
        })

    }

    const remindWalls = () => {
        if (bot) bot.write('chat', {
            message: `${settings["wallremindermessage"].replace(/\[since\]/g, `${sinceCheck(times.lastwallcheck)}`).replace(/\[lastchecker\]/g, `${(lastwallign) ? `${lastwallign}` : `none`}`).replace(/\[platform\]/, wallmethod)}`
        });
        if (wallsreminder && !wallsreminder.deleted) wallsreminder.delete().catch(console.error);
        if (wallsmessage && wallsmessage.reactions) wallsmessage.reactions.removeAll().catch(console.error)
        wallschannel.send(`${settings['discordwallreminder'].replace(/\[wallsrole\]/g, `${wallsrole}`).replace(/\[since\]/g, `${sinceCheck(times.lastwallcheck)}`).replace(/\[lastchecker\]/g, `${(lastwallchecker) ? lastwallchecker.tag : "`No one this session`"}`)}`)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                wallsreminder = message;
            })
            .catch(console.error)
        times.lastwallreminder = Date.now();
    }

    const remindCactus = () => {
        if (bot) bot.write('chat', {
            message: `${settings["cactusremindermessage"].replace(/\[since\]/g, `${sinceCheck(times.lastcactuscheck)}`).replace(/\[lastchecker\]/g, `${(lastcactusign) ? `${lastcactusign}` : `none`}`).replace(/\[platform\]/, cactusmethod)}`
        });
        if (cactusreminder && !cactusreminder.deleted) cactusreminder.delete().catch(console.error);
        if (cactusmessage) cactusmessage.reactions.removeAll().catch(console.error)
        cactuschannel.send(`${settings['discordcactusreminder'].replace(/\[wallsrole\]/g, `${wallsrole}`).replace(/\[since\]/g, `${sinceCheck(times.lastcactuscheck)}`).replace(/\[lastchecker\]/g, `${(lastcactuschecker) ? lastcactuschecker.tag : "`No one this session`"}`)}`)
            .then(message => {
                message.react('✅')
                return message
            })
            .then(message => {
                message.react('💣');
                cactusreminder = message;
            })
            .catch(console.error)
        times.lastcactusreminder = Date.now();
    }
    const remindBuffer = () => {
        if (bot) bot.write('chat', {
            message: `${settings["bufferremindermessage"].replace(/\[since\]/g, `${sinceCheck(times.lastbuffercheck)}`).replace(/\[lastchecker\]/g, `${(lastbufferign) ? `${lastbufferign}` : `none`}`).replace(/\[platform\]/, buffermethod)}`
        });
        if (bufferreminder && !bufferreminder.deleted) bufferreminder.delete().catch(console.error);
        if (buffermessage) buffermessage.reactions.removeAll().catch(console.error)
        bufferchannel.send(`${settings['discordbufferreminder'].replace(/\[wallsrole\]/g, `${wallsrole}`).replace(/\[since\]/g, `${sinceCheck(times.lastbuffercheck)}`).replace(/\[lastchecker\]/g, `${(lastbufferchecker) ? lastbufferchecker.tag : "`No one this session`"}`).replace(/\[platform\]/, buffermethod)}`)
            .then(message => {
                message.react('✅')
                return message;
            })
            .then(message => {
                message.react('💣');
                bufferreminder = message;
            })
            .catch(console.error)
        times.lastbufferreminder = Date.now();
    }

    const addValue = async (id, text, ign) => {
        value = calcValue(text)
        checker = client.users.cache.get(id);
        if (!checker) {
            checker = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!checker) return;
        }
        link = `https://minotar.net/helm/${ign}.png`
        if (!ign) {
            link = `https://minotar.net/helm/Alex.png`
            ign = checker.username
        }
        userdata[id].value = parseInt(userdata[id].value) + value;
        if (value < 1) return false;
        if (bot) bot.write('chat', {
            message: `${settings["addvaluemessage"].replace(/\[user\]/g, `${ign}`).replace(/\[value\]/g, `${formatter.format(value)}`).replace(/\[totalvalue\]/, `${formatter.format(userdata[id].value)}`)}`
        })
        const valueembed = new Discord.MessageEmbed()
            .setTitle("💰Value Added💰")
            .setTimestamp()
            .setColor('PURPLE')
            .setThumbnail(link)
            .addFields({
                name: 'Amount added:',
                value: `${formatter.format(value)}`
            }, {
                name: 'Added as',
                value: `\`${text}\``
            })
            .addField('Added by', `<@${id}>`, true)
            .addField('User\'s Total value: ', `${formatter.format(userdata[id].value)}`, true)

        valuechannel.send(valueembed).catch(console.error);
        fs.appendFile(`./logs/valuelogs.txt`, `**[${new Date().toUTCString()}]** <@${id}> added \`${text}\` worth \`${formatter.format(value)}\`\r\n`, err => {
            if (err) console.log(err)
        })
        return true;
    }

    const initID = (id) => {
        if (!userdata[id]) userdata[id] = {};
        if (!userdata[id].code) userdata[id].code = ""
        if (!userdata[id].uuids) userdata[id].uuids = [];
        if (!userdata[id].names) userdata[id].names = [];
        if (!userdata[id].cactuschecks) userdata[id].cactuschecks = 0;
        if (!userdata[id].wallchecks) userdata[id].wallchecks = 0;
        if (!userdata[id].bufferchecks) userdata[id].bufferchecks = 0;
        if (!userdata[id].value) userdata[id].value = 0;
        if (!userdata[id].strikes) userdata[id].strikes = 0;
    }
    const setUUID = async (id, name) => getUUIDjson(name).then(x => initAcc(id, x.data.name, x.data.id))

    const success = (sent, msg) => {
        if (!msg) return console.log("NO MESSAGE FOR THE SUCCESS")
        const successembed = new Discord.MessageEmbed()
            .setTitle("**Success**")
            .setDescription(":white_check_mark: " + sent)
            .setColor('DARK_GREEN')
            .setFooter(`${msg.author.tag}`);
        msg.channel.send(successembed);
    }

    const strike = async (id, modid, add, reason, ign, modign) => {
        if (add) userdata[id].strikes += 1;
        else userdata[id].strikes -= 1;

        user = client.users.cache.get(id);
        if (!user) {
            user = await client.guilds.cache.get(hardconfig.guild).members.fetch(id)
            if (!user) return;
        }
        mod = client.users.cache.get(modid);
        if (!mod) {
            mod = await client.guilds.cache.get(hardconfig.guild).members.fetch(modid)
            if (!mod) return;
        }
        const strikeembed = new Discord.MessageEmbed()
            .setTitle(`${mod.tag} ${(add) ? 'added' : 'removed'} a strike for ${(user) ? user.username : `unknown`}`)
            .setColor((add) ? 'RED' : 'GREEN')
            .addFields({
                name: `Reason:`,
                value: `${(!reason) ? "none" : reason}`,
                inline: true
            }, {
                name: `Total Strikes:`,
                value: `${userdata[id].strikes}`,
                inline: true
            }, {
                name: `\u200b`,
                value: '\u200b',
                inline: true
            }, {
                name: "User:",
                value: `<@${id}>`
            }, {
                name: "Striked by:",
                value: `<@${modid}>`
            })
            .setTimestamp()

        strikeschannel.send(strikeembed).catch(console.error)
        user.send(`You have been striked by ${mod} for reason: ${reason}.`).catch(console.error)
        if (hardconfig.ingame && add) bot.write('chat', {
            message: `${settings["strikemessage"].replace(/\[striked\]/g, `${(ign) ? ign : user.tag}`).replace(/\[mod\]/g, `${(modign) ? modign : mod.tag}`).replace(/\[reason]/, `${(!reason) ? "none" : reason}`).replace(/\[strikes\]/g, `${userdata[id].strikes}`)}`
        })

    }

    const usage = (sent, command, msg) => {
        if (!msg) return console.log("NO MESSAGE FOR THE USAGE")
        const embed = new Discord.MessageEmbed()
            .setTitle(`**${command} Help**`)
            .setDescription(`:warning: Improper usage for this command.\n**Usage**: ${hardconfig.prefix}${sent}`)
            .setColor('GOLD')
            .setFooter(`<> = required, [] = optional | ${msg.author.tag}`)
        msg.channel.send(embed).then(message => message.delete({
            timeout: 60000
        })).catch(console.error);
    }


    ////////////////////////////////////////////////


    if (hardconfig.ingame) {


        bot = mc.createClient({
            version: '1.8.9',
            host: 'play.saicopvp.com',
            port: 25565,
            username: config.email,
            password: config.password,
            auth: config.microsoftaccount === true ? 'microsoft':'mojang'
        });

        ChatMessage = require('prismarine-chat')(bot.version);



        bot.on("connect", async () => {
            console.log(`Ingame bot is online on account: ${bot.username}`);
            console.log(`───────────────────────────────────────────────────────────────────────────`);
            setTimeout(() => bot.write('chat', {
                message: `${realms[hardconfig.realm].joincmd}`
            }), 5000)
        })



        bot.on("disconnect", async packet => {
            console.log(`Bot kicked for ${packet.reason}. Reconnecting.`);
            setTimeout(async () => {
                process.exit()
            }, 5000)
        })

        bot.on("end", async () => {
            console.log("Connection lost. Reconnecting.");
            writeJSON(times, 'times')
            writeJSON(userdata, 'userdata')
            if (botchannel) botchannel.send("The ingame bot has been disconnected. Restarting to attempt to reconnect.").catch(console.error)
            setTimeout(async () => {
                process.exit()
            }, 7000)

        })

        bot.on("error", function (err) {
            console.log('Error occured:')
            console.log(err)
            process.exit(1)
        })

        setInterval(() => bot.write('chat', {
            message: realms[hardconfig.realm].joincmd
        }), 30000)

        bot.on("chat", async packet => {
            if (!ChatMessage) {
                return console.log("ChatMessage not loaded yet")
            }
            const j = JSON.parse(packet.message);
            const chat = new ChatMessage(j);
            msg = chat.toString();

            console.log(chat.toAnsi());

            if ((isRegExpFormat(msg, realms[hardconfig.realm].msg)) || (isRegExpFormat(msg, realms[hardconfig.realm].fchat) && (settings.fchatcommands === true))) {

                if (isRegExpFormat(msg, realms[hardconfig.realm].msg)) {
                    text = msg.match(realms[hardconfig.realm].msg)
                } else if (isRegExpFormat(msg, realms[hardconfig.realm].fchat)) {
                    text = msg.match(realms[hardconfig.realm].fchat)
                }

                username = text[1];
                message = text[2].toLowerCase();

                if (ignToDiscordID(username)) {
                    sender = ignToDiscordID(username)
                    permcheck = client.guilds.cache.get(hardconfig.guild).members.cache.get(sender)
                    if (!permcheck) {
                        permcheck = await client.guilds.cache.get(hardconfig.guild).members.fetch(sender)
                        if (!permcheck) return;
                    }
                    if ((message == hardconfig.clearwallcommand || (message.includes("wall") && message.includes("clear") && (!message.includes('cac') && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/)))) && (hasPerms(permcheck, "check")) && (settings.wallsenabled === true)) {
                        clearWalls(username, sender, "Minecraft")
                    } else if ((message == hardconfig.clearcactuscommand || (message.includes("cac") && message.includes("clear") && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/))) && (hasPerms(permcheck, "check")) && (settings.cactusenabled === true)) {
                        clearCactus(username, sender, "Minecraft")
                    } else if (((message == hardconfig.clearbuffercommand) || (message.includes('clear') && message.includes('buffer') && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/))) && (hasPerms(permcheck, "check")) && (settings.bufferenabled === true)) {
                        clearBuffer(username, sender, "Minecraft")
                    } else if ((message == hardconfig.weewoowallcommand || (message.includes("wall") && message.includes("weewoo") && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/))) && (hasPerms(permcheck, "check")) && (settings.wallsenabled === true)) {
                        weewooWalls(username, sender, "Minecraft")
                    } else if ((message == hardconfig.weewoocactuscommand || (message.includes("cactus") && message.includes("weewoo") && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/))) && (hasPerms(permcheck, "check")) && (settings.cactusenabled === true)) {
                        weewooCactus(username, sender, "Minecraft")
                    } else if ((message == hardconfig.weewoobuffercommand || (message.includes("buffer") && message.includes("weewoo") && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/))) && (hasPerms(permcheck, "check")) && (settings.bufferenabled === true)) {
                        weewooBuffer(username, sender, "Minecraft")
                    } else if ((message.startsWith(`${hardconfig.alertbuffercommand} `)) && (hasPerms(permcheck, "check")) && (settings.bufferenabled === true)) {
                        text[2] = text[2].replace(hardconfig.alertbuffercommand, '')
                        text[2] = text[2].replace('alert', '')
                        text[2] = text[2].replace('buffer', '')
                        console.log('alert')
                        alertBuffer(username, sender, text[2], "Minecraft")
                    } else if ((message.startsWith(`${hardconfig.addvaluecommand} `) || (message.startsWith('add ') && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/))) && (settings.valueenabled) && (hasPerms(permcheck, 'addvalue'))) {
                        message = message.replace(`${hardconfig.addvaluecommand} `, '')
                        message = message.replace('add ', '')
                        if (message != '') addValue(sender, message, username);
                    } else if ((message.startsWith(`${hardconfig.strikecommand} `)) && (settings.strikesenabled) && (hasPerms(permcheck, 'strike'))) {
                        message = text[2].replace(`${hardconfig.strikecommand} `, '')
                        reason = message.split(' ')
                        if (reason[0] != '' && ignToDiscordID(reason[0])) {
                            striked = reason.shift()

                            reason = reason.join(' ')

                            if (ignToDiscordID(striked)) {
                                strike(ignToDiscordID(striked), sender, true, reason, striked, username);
                            }
                        }

                    } else if ((message == 'tpyes') && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/) && (hasPerms(permcheck, 'sudo') || hasPerms(permcheck, 'runcmd'))) {
                        bot.write('chat', {
                            message: `/tpyes ${username}`
                        })
                    } else if ((message == 'joinme') && !isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/) && (hasPerms(permcheck, 'sudo') || hasPerms(permcheck, 'runcmd'))) {
                        bot.write('chat', {
                            message: `/f join ${username}`
                        })
                    }
                    else if (message == '.last' && isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/) && hasPerms(permcheck, 'check')) {
                        bot.write('chat', {
                            message: `/ff Last wall check was ${sinceCheck(times.lastwallcheck)} ago. Checked by: ${lastwallchecker}. Marked: ${wallmark}`
                        })
                    }
                    else if (message.startsWith(`.calc `) && isRegExpFormat(msg, /\[Faction\] .+ (\w+): (.+)/)) {
                        let eq = message.replace('.calc ', '')
                        if (!eq) {
                            bot.write('chat', {
                                message: `/ff You need to provide an equation`
                            })
                        }
                        else {
                            bot.write('chat', {
                                message: `/ff Answer is: ${math.evaluate(eq)}`
                            })
                        }
                    }
                } else if (message.startsWith(',.;') && !isRegExpFormat(msg, realms[hardconfig.realm].fchat)) {
                    msgedcode = text[2];
                    if (codeToDiscordID(msgedcode) && (!ignToDiscordID(text[1]))) {
                        console.log('code')
                        discordid = codeToDiscordID(msgedcode)
                        failed = false
                        setUUID(discordid, username).catch((error) => {
                            if (error instanceof TypeError) {
                                failed = true
                            }
                        })
                        setTimeout(() => {
                            if (!failed) {
                                const successlinkembed = new Discord.MessageEmbed()
                                    .setColor('GREEN')
                                    .setTitle(`You have linked the account ${username}`)
                                    .setDescription(`Your discord account is now linked to the account ${username}.\nYou are now able to perform commands through the ingame bot. If you ever change your IGN, this should also be registered by the bot. \nIf you ever want to unlink the account from your discord account, use\n **${hardconfig.prefix}unlink** *<IGN>*\n in the discord server. If you have changed your IGN and the bot has not registered that, you might need to unlink it using your previous IGN.`)

                                client.guilds.resolve(hardconfig.guild).members.cache.get(discordid).send(successlinkembed).catch(console.error)
                                userdata[discordid].code = '';
                            } else if (failed == false) {
                                const failedlinkembed = new Discord.MessageEmbed()
                                    .setColor('RED')
                                    .setTitle(`There was an error linking your account`)
                                    .setDescription(`It seems there has been an error linking your account. Try again later.`)

                                client.guilds.resolve(hardconfig.guild).members.cache.get(discordid).send(failedlinkembed).catch(console.error)
                            }
                        }, 5000)
                    }

                } else {
                    getUUIDjson(username).then(x => {
                        uuid = x.data.id;
                        if (uuidToDiscordID(uuid)) {

                            sender = uuidToDiscordID(uuid)
                            userdata[sender].names.splice(userdata[sender].names.indexOf(uuid), 1)
                            userdata[sender].uuids.splice(userdata[sender].uuids.indexOf(uuid), 1);
                            userdata[sender].uuids.push(uuid)
                            userdata[sender].names.push(username)
                            permcheck = client.guilds.cache.get(hardconfig.guild).members.cache.get(sender)
                            if ((message == hardconfig.clearwallcommand || (message.includes("wall") && message.includes("clear") && !(message.includes("cac")))) && (hasPerms(permcheck, "check")) && (settings.wallsenabled === true)) {
                                clearWalls(username, sender, "Minecraft")
                            } else if ((message == hardconfig.clearcactuscommand || (message.includes("cac") && message.includes("clear"))) && (hasPerms(permcheck, "check")) && (settings.cactusenabled === true)) {
                                clearCactus(username, sender, "Minecraft")
                            } else if ((message == hardconfig.clearbuffercommand || (message.includes("buffer") && message.includes("clear"))) && (hasPerms(permcheck, "check")) && (settings.bufferenabled === true)) {
                                clearBuffer(username, sender, "Minecraft")
                            } else if ((message == hardconfig.weewoowallcommand || (message.includes("wall") && message.includes("weewoo"))) && (hasPerms(permcheck, "check")) && (settings.wallsenabled === true)) {
                                weewooWalls(username, sender, "Minecraft")
                            } else if ((message == hardconfig.weewoocactuscommand || (message.includes("cactus") && message.includes("weewoo"))) && (hasPerms(permcheck, "check")) && (settings.cactusenabled === true)) {
                                weewooCactus(username, sender, "Minecraft")
                            } else if ((message == hardconfig.weewoobuffercommand || (message.includes("buffer") && message.includes("weewoo"))) && (hasPerms(permcheck, "check")) && (settings.bufferenabled === true)) {
                                weewooBuffer(username, sender, "Minecraft")
                            } else if ((message == hardconfig.alertbuffercommand || (message.includes("buffer") && message.includes("alert"))) && (hasPerms(permcheck, "check")) && (settings.bufferenabled === true)) {
                                text[2] = text[2].replace(hardconfig.alertbuffercommand, '')
                                text[2] = text[2].replace('alert', '')
                                text[2] = text[2].replace('buffer', '')
                                alertBuffer(username, sender, text[2], "Minecraft")
                            } else if ((message == hardconfig.addvaluecommand || message.startsWith('add ')) && (settings.valueenabled) && (hasPerms(permcheck, 'addvalue'))) {
                                message = message.replace(`${hardconfig.addvaluecommand} `, '')
                                message = message.replace('add ', '')
                                if (message != '') addValue(sender, message, username);
                            } else if ((message == hardconfig.strikecommand || message.startsWith('strike')) && (settings.strikesenabled) && (hasPerms(permcheck, 'strike'))) {
                                message = message.replace(`${hardconfig.strikecommand} `, '')
                                message = message.replace('strike ', '')
                                username = message.split(' ')
                                if (username != '') {
                                    if (username[0] != '' && ignToDiscordID(username[0])) {
                                        striked = username.shift()
                                        reason = username.join(' ')
                                        if (ignToDiscordID(striked)) {
                                            strike(ignToDiscordID(striked), sender, true, reason, striked);
                                        }
                                    }
                                }
                            }

                        }
                    })
                        .catch(console.error)

                }
            }


            if ((msg.includes(" * ")) && (msg.includes("has overtaken")) && (settings.ftopenabled)) {
                msg = msg.replace(' * ', '');
                const ftopupEmbed = new Discord.MessageEmbed()
                    .setColor("DARK_VIVID_PINK")
                    .setTimestamp()
                    .setTitle('AN FTOP change has happened')
                    .addField("The following FTOP change has happened: ", "**```" + msg + "```**")
                ftopchannel.send(ftopupEmbed)
                displayFtop();
            }

            if (isRegExpFormat(msg, /\[Faction\] .+ (\w+: .+)/) && settings.fchatenabled) {

                fchatmessage = msg.match(/\[Faction\] .+ (\w+: .+)/);
                fchatmessage[1] = fchatmessage[1].replace(/\@/g, ' @ ')
                if (!fchatmessage[1].startsWith(bot.username)) fchatchannel.send(`\`${fchatmessage[1]}\``).catch(console.error);
            }

            if (ftop && (isRegExpFormat(msg, realms[hardconfig.realm].ftop))) {
                text = msg.match(realms[hardconfig.realm].ftop);
                var pos = text[1]; // Rank (e.g., #1)
                var facname = text[2]; // Faction name (e.g., Pluto)
                var value = text[3]; // Total value (e.g., $1,015,519,095,470)
                var increase = text[4]; // Change (e.g., $2,418,000,000 or -$374,431,216)
            
                // Determine if the increase should be negative
                const percentChangeRegex = /\[. (-?[\d.]+%)\]/;
                const percentMatch = msg.match(percentChangeRegex);
                if (percentMatch && percentMatch[1].startsWith('-')) {
                    // If the percentage is negative, prepend a negative sign to the increase
                    increase = `-${increase}`;
                }
            
                dataone.push(`**${pos}** ${facname}`);
                datatwo.push(`${value}`);
                datathree.push(`${increase}`);
            }

            if (runcmd) {
                runcmddata.push(msg)
            }
            if (online && (isRegExpFormat(msg, /\* Members Online \[([0-9]+)\/[0-9]+\]: (.+)/))) {
                text = msg.match(/\* Members Online \[([0-9]+)\/[0-9]+\]: (.+)/);
                number = text[1];
                players = text[2];
                players = players.split(', ')
                for (player in players) {
                    playerreg = players[player].match(/([\w]+)$/)
                    players[player] = playerreg[1]
                }

                players = players.join('\n');
                if (!players) players = "None"
            }
            
            if (canetop && (isRegExpFormat(msg, /^ \* \#\d+ (?:\*{1,3}|\+{1,2}|\-)(?:[A-Za-z]+ )?(\w+) - ([\d,]+)/))){
                let data = msg.match(/^ \* (\#\d+) (?:\*{1,3}|\+{1,2}|\-)(?:[A-Za-z]+ )?(\w+) - ([\d,]+)/);

                let ranking = `${data[1]} ${data[2]}`
                if (ignToDiscordID(data[2])){
                    canedataone.push(`**__${ranking}__**`);
                    canedatatwo.push(`**${data[3]}**`)
                }
                else {
                    canedataone.push(ranking);
                    canedatatwo.push(data[3]);
                }

            }
            if (isRegExpFormat(msg, /^\(!\) (Online|Offline): \w{2,16}$/) && settings.fchatenabled) {
                fchatchannel.send(`\`${msg}\``).catch(console.error);
            }
            // Check for faction rotation
            if (isRegExpFormat(msg, /^\(!\) \w{2,16} has been rotated out for \w{2,16}!$/) && settings.fchatenabled) {
                fchatchannel.send(`\`${msg}\``).catch(console.error);
            }

        })

    }
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////
    setInterval(async () => {
        writeJSON(times, 'times')
        writeJSON(userdata, 'userdata')
    }, 60000)


    setInterval(async () => {
        if (settings.wallsenabled && shieldIsOff()) {
            if (((parseFloat(settings.wallremindertime)) <= (sinceInMinutes(times.lastwallcheck))) && ((parseFloat(settings.wallreminderinterval)) <= (sinceInMinutes(times.lastwallreminder)))) {
                remindWalls()
                for (id in userdata) {
                    if (userdata[id].pmremind && hasPerms(client.guilds.cache.get(hardconfig.guild).members.cache.get(id), "check")) client.guilds.cache.get(hardconfig.guild).members.cache.get(id).send(`It has now been \`${sinceCheck(times.lastwallcheck)}\` since the last wall check.`).catch(console.error)
                }
            }


        }
        if (settings.bufferenabled && shieldIsOff()) {
            if (((parseFloat(settings.bufferremindertime)) <= (sinceInMinutes(times.lastbuffercheck))) && ((parseFloat(settings.bufferreminderinterval)) <= (sinceInMinutes(times.lastbufferreminder)))) {
                remindBuffer()
                for (id in userdata) {
                    if (userdata[id].pmremind && hasPerms(client.guilds.cache.get(hardconfig.guild).members.cache.get(id), "check")) client.guilds.cache.get(hardconfig.guild).members.cache.get(id).send(`It has now been \`${sinceCheck(times.lastbuffercheck)}\` since the last buffer check.`).catch(console.error)
                }
            }
        }

        if (settings.cactusenabled) {
            if (((parseFloat(settings.cactusremindertime)) <= (sinceInMinutes(times.lastcactuscheck))) && ((parseFloat(settings.cactusreminderinterval)) <= (sinceInMinutes(times.lastcactusreminder)))) remindCactus()
        }
        if ((settings.ftopenabled) && (hardconfig.ingame)) {
            if ((parseFloat(settings.ftopinterval)) <= (sinceInMinutes(times.lastftopcheck))) displayFtop()
        }
    }, 12000)

    setInterval(async () => {
        writeJSON(permissions, 'permissions')
        writeJSON(settings, 'settings')
        writeJSON(hardconfig, 'hardconfig')
    }, 1800612)

    setInterval(async () => {
        if (wallweewoo) {
            const embed = new Discord.MessageEmbed()
                .setDescription(`We are currently **BEING RAIDED**. \nLog online to help patch!\nUse **${hardconfig.prefix}stopweewoo** \nto deactivate the weewoo!`)
                .setColor(`DARK_RED`)
                .setThumbnail("http://icons.iconarchive.com/icons/chrisl21/minecraft/256/Tnt-icon.png")
            if (!settings.wallsenabled) return;
            wallschannel.send(embed);
            wallschannel.send(`${wallsrole}`);
            if (bot) bot.write(`chat`, {
                message: "/ff We are currently being raided. (!) Come patch!"
            })
            for (memid in userdata) {
                if (userdata[memid].pmweewoo && hasPerms(client.guilds.cache.get(hardconfig.guild).members.cache.get(memid), "check")) {
                    client.guilds.cache.get(hardconfig.guild).members.cache.get(memid).send(`<@${memid}> :bangbang:WE ARE BEING RAIDED:bangbang:`).catch(console.error)
                }
            }
        }

        if (cactusweewoo) {
            const embed = new Discord.MessageEmbed()
                .setDescription(`Our cactus is currently **BEING RAIDED**. \nLog online to help patch!\nUse **${hardconfig.prefix}stopweewoo** \nto deactivate the weewoo!`)
                .setColor(`DARK_RED`)
                .setThumbnail("http://icons.iconarchive.com/icons/chrisl21/minecraft/256/Tnt-icon.png")
            if (!settings.cactusenabled) return;
            cactuschannel.send(embed);
            cactuschannel.send(`${wallsrole}`);
            if (bot) bot.write(`chat`, {
                message: "/ff Our cactus is currently being raided. (!) Come patch!"
            })

        }


    }, 120000)



    client.on('ready', async () => {
        channelcache = client.guilds.cache.get(hardconfig.guild).channels.cache;
        wallschannel = channelcache.find(channel => channel.name == hardconfig.wallchannel);
        bufferchannel = channelcache.find(channel => channel.name == hardconfig.bufferchannel);
        valuechannel = channelcache.find(channel => channel.name == hardconfig.valuechannel);
        ftopchannel = channelcache.find(channel => channel.name == hardconfig.ftopchannel);
        fchatchannel = channelcache.find(channel => channel.name == hardconfig.fchatchannel);
        strikeschannel = channelcache.find(channel => channel.name == hardconfig.strikeschannel);
        cactuschannel = channelcache.find(channel => channel.name == hardconfig.cactuschannel);
        botchannel = channelcache.find(channel => channel.name == "bot-logs");
        wallsrole = client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.wallsrole)
        modrole = client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.modrole)
        adminrole = client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.adminrole)
        client.user.setActivity(`${noun(hardconfig.realm)} Realm`, {
            type: 'PLAYING'
        }).catch(console.error);
        console.log("Discord Bot Ready")
        if (botchannel) botchannel.send("Bot started")
    });

    client.on('message', async message => {
        if (message.channel.type == 'dm') return;
        if (message.guild.id != hardconfig.guild) return;
        if ((settings.muted.includes(message.author.id)) && !((hasPerms(message.member, 'mute')) && message.content.startsWith(`${hardconfig.prefix}unmute`))) return message.delete({
            reason: "Muted"
        });

        if (!message.content.startsWith(hardconfig.prefix)) {
            if (settings.fchatenabled && message.channel.id == fchatchannel && userdata[message.author.id]) {
                return bot.write('chat', {
                    message: `/ff [${userdata[message.author.id]?.names?.length ? userdata[message.author.id].names[userdata[message.author.id].names.length - 1] : message.author.tag}]: ${message.content.slice(0, 75)}`
                })
            }
            else return;
        }

        const preargs = message.content.slice((hardconfig.prefix).length).trim().split(/ +/);
        var commandName = preargs.shift().toLowerCase();
        var args = preargs.map(arg => arg.toLowerCase());
        let u = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
        let user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]))
        setTimeout(() => {
            if (!message.deleted) message.delete().catch(console.error)
        }, 30000)
        if ((settings.blacklists.includes(message.channel.id)) && (commandName !== 'unblacklist' || !hasSpecialPerms(message.member, 'blacklist'))) return warning("This channel is currently blacklisted for bot commands", message)
        if ((settings.blacklists.includes(message.author.id)) && !((hasSpecialPerms(message.member, 'blacklist')) && (commandName == 'unblacklist'))) return warning("You are not allowed to perform bot commands", message)
        if (settings.bannedcommands.includes(commandName) && (commandName !== 'bancmd')) return warning("This command is currently banned.", message)





        switch (commandName) {
            case 'link':
                commandName = 'register';
                break;
            case 'iam':
                commandName = 'register';
                break;
            case 'unlink':
                commandName = 'unregister'
                break;
            case 'forceunlink':
                commandName = 'forceunregister'
                break;
            case 'clear':
                if ((args[0] == 'walls') || (args[0] == 'wall') || ((message.channel == wallschannel) && (!args[0]))) commandName = 'clearwalls';
                else if ((args[0] == 'buffer') || (args[0] == 'buffers') || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'clearbuffer';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'clearcactus'
                else commandName = 'wrongcheckchannel'
                break;
            case 'weewoo':
                if ((args[0] == 'walls') || (args[0] == 'wall') || ((message.channel == wallschannel) && (!args[0]))) commandName = 'weewoowalls';
                else if ((args[0] == 'buffer') || (args[0] == 'buffers') || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'weewoobuffer';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'weewoocactus'
                else commandName = 'wrongcheckchannel'
                break;
            case 'addvalue':
                commandName = 'add'
                break;
            case 'removevalue':
                commandName = 'remove'
                break;
            case 'calculate':
                commandName = 'calc'
                break;
            case 'statistics':
                commandName = 'stats'
                break;
            case 'sendcmd':
                commandName = 'runcmd'
                break;
            case 'pmrole':
                commandName = 'dmrole'
                break;
            case 'bl':
                commandName = 'blacklist'
                break;
            case 'av':
                commandName = 'avatar'
                break;
            case 'viewavatar':
                commandName = 'avatar'
                break;
            case "set":
                commandName = 'setstats'
                break;
            case 'leaderboard':
                if ((args[0] == 'walls') || (args[0] == 'wall') || (message.channel == wallschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == wallschannel) && (!args[0]))) commandName = 'walltop';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || (message.channel == cactuschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'cactustop';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || (message.channel == bufferchannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'buffertop';
                else if ((args[0] == 'valueadded') || (args[0] == 'value') || (message.channel == valuechannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == valuechannel) && (!args[0]))) commandName = 'valuetop';
                else commandName = 'wrongtopchannel'
                break;
            case 'top':
                if ((args[0] == 'walls') || (args[0] == 'wall') || (message.channel == wallschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == wallschannel) && (!args[0]))) commandName = 'walltop';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || (message.channel == cactuschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'cactustop';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || (message.channel == bufferchannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'buffertop';
                else if ((args[0] == 'valueadded') || (args[0] == 'value') || (message.channel == valuechannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == valuechannel) && (!args[0]))) commandName = 'valuetop';
                else commandName = 'wrongtopchannel'
                break;
            case 'bclear':
                commandName = 'clearbuffer'
                break;
            case 'wclear':
                commandName = 'clearwalls'
                break;
            case 'bweewoo':
                commandName = 'weewoobuffer';
                break;
            case 'wweewoo':
                commandName = 'weewoowalls';
                break;
            case 'balert':
                commandName = 'alert';
                break;
            case 'cclear':
                commandName = 'clearcactus'
                break;
            case 'cweewoo':
                commandName = 'weewoocactus';
                break;
            case 'sett':
                commandName = 'settings';
                break;
            case 'last':
                if ((args[0] == 'walls') || (args[0] == 'wall') || ((message.channel == wallschannel) && (!args[0]))) commandName = 'lastwall';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'lastcactus';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'lastbuffer';
                else commandName = 'wronglastchannel'
                break;
            case 'viewlogs':
                if ((args[0] == 'walls') || (args[0] == 'wall') || (message.channel == wallschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == wallschannel) && (!args[0]))) commandName = 'viewwalllogs';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || (message.channel == cactuschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'viewcactuslogs';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || (message.channel == bufferchannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'viewbufferlogs';
                else if ((args[0] == 'valueadded') || (args[0] == 'value') || (message.channel == valuechannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == valuechannel) && (!args[0]))) commandName = 'viewvaluelogs';
                else if ((args[0] == 'punishments') || (args[0] == 'punish')) commandName = 'viewpunishmentlogs';
                else commandName = 'wronglogchannel'
                break;
            case 'showlogs':
                if ((args[0] == 'walls') || (args[0] == 'wall') || (message.channel == wallschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == wallschannel) && (!args[0]))) commandName = 'viewwalllogs';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || (message.channel == cactuschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'viewcactuslogs';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || (message.channel == bufferchannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'viewbufferlogs';
                else if ((args[0] == 'valueadded') || (args[0] == 'value') || (message.channel == valuechannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == valuechannel) && (!args[0]))) commandName = 'viewvaluelogs';
                else if ((args[0] == 'punishments') || (args[0] == 'punish')) commandName = 'viewpunishmentlogs';
                else commandName = 'wronglogchannel'
                break;
            case 'logs':
                if ((args[0] == 'walls') || (args[0] == 'wall') || (message.channel == wallschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == wallschannel) && (!args[0]))) commandName = 'viewwalllogs';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || (message.channel == cactuschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'viewcactuslogs';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || (message.channel == bufferchannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'viewbufferlogs';
                else if ((args[0] == 'valueadded') || (args[0] == 'value') || (message.channel == valuechannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == valuechannel) && (!args[0]))) commandName = 'viewvaluelogs';
                else if ((args[0] == 'punishments') || (args[0] == 'punish')) commandName = 'viewpunishmentlogs';
                else commandName = 'wronglogchannel'
                break;
            case 'log':
                if ((args[0] == 'walls') || (args[0] == 'wall') || (message.channel == wallschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == wallschannel) && (!args[0]))) commandName = 'viewwalllogs';
                else if ((args[0] == 'cactus') || (args[0] == 'cac') || (message.channel == cactuschannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == cactuschannel) && (!args[0]))) commandName = 'viewcactuslogs';
                else if ((args[0] == 'buffers') || (args[0] == 'buffer') || (message.channel == bufferchannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == bufferchannel) && (!args[0]))) commandName = 'viewbufferlogs';
                else if ((args[0] == 'valueadded') || (args[0] == 'value') || (message.channel == valuechannel && isRegExpFormat(args[0], /[0-9]+/)) || ((message.channel == valuechannel) && (!args[0]))) commandName = 'viewvaluelogs';
                else if ((args[0] == 'punishments') || (args[0] == 'punish')) commandName = 'viewpunishmentlogs';
                else commandName = 'wronglogchannel'
                break;
            case 'permission':
                commandName = 'permissions'
                break;
            case 'perms':
                commandName = 'permissions'
                break;
            case 'setting':
                commandName = 'settings';
                break;
            case 'viewlinkedaccounts':
                commandName = 'viewallaccounts'
                break;
            case 'movestats':
                commandName = 'transferstats'
                break;
            case 'dmremind':
                commandName = 'pmremind'
                break;
            case 'viewpmreminders':
                commandName = 'viewdmreminds'
                break;
            case 'viewdmreminders':
                commandName = 'viewdmreminds'
                break;
            case 'dmweewoo':
                commandName = 'pmweewoo'
                break;
            case 'viewpmweewoos':
                commandName = 'viewdmweewoos'
                break;
            case 'viewdmweewoos':
                commandName = 'viewdmweewoos'
                break;
            case 'message':
                commandName = 'messages'
                break;
            case 'warn':
                commandName = 'strike'
                break;
            case 'warning':
                commandName = 'strike'
                break;
        }

        switch (commandName) {

            case 'register':
                if (!hasPerms(message.member, 'check')) return warning(`<@${message.author.id}> You do not have permissions for this command.`, message)
                if (!settings.verifyregister) {

                    if (!args[0]) return warning(`Please enter an IGN to link to your discord in the format \`${hardconfig.prefix}register <IGN>.\``, message)
                    ign = args[0]
                    failed = false
                    if ((!isRegExpFormat(ign, /^\w+$/)) || (ign.length > 16)) {
                        return warning(`\`${ign}\` is not a valid IGN`, message)
                    }
                    if (!userdata[message.author.id]) initID(message.author.id);
                    if (ignToDiscordID(ign) == message.author.id) return warning(`The Account \`${preargs[0]}\` is already linked to your discord account.`, message)
                    if (typeof ignToDiscordID(ign) !== 'undefined') return warning(`The Account\`${preargs[0]}\` has already been linked to <@${ignToDiscordID(ign)}> Contact a **${hardconfig.adminrole}** if this is a mistake.`, message)
                    message.react('⏳').catch(console.error)
                    setUUID(message.author.id, ign).catch((error) => {
                        if (error instanceof TypeError) {
                            warning(`The IGN \`${preargs[0]}\` is not a valid IGN.`, message)
                            return failed = true
                        }
                    })
                    setTimeout(() => {
                        if (!failed) success(`Successfully linked the Account \`${userdata[message.author.id].names[userdata[message.author.id].names.length - 1]}\` to your discord account.`, message)
                    }, 4000)
                } else if (!hardconfig.ingame && settings.verifyregister) {
                    return warning("You are currently unable to register, as the ingame bot is not enabled", message)
                } else if (hardconfig.ingame && settings.verifyregister) {
                    let code = `,.;${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                    if (!userdata[message.author.id]) initID(message.author.id)
                    userdata[message.author.id].code = code;
                    const registerembed = new Discord.MessageEmbed()
                        .setTitle("Link Account")
                        .setDescription(`Follow the steps below to link your ingame account to your discord.
                        
                        **1).** Log-in to the server 
                        **2).** Message **${(bot) ? `${bot.username}` : "the bot"}** your code.

                        **Your Code:** ${code}
                        **Usage:** \`/msg ${(bot) ? `${bot.username}` : "BOT"} ${code}\``)
                        .setColor('DARK_VIVID_PINK')
                    message.author.send(registerembed).catch((error) => {
                        warning("There seems to have been an error initialising the verification code. Ensure that the bot is able to message you", message)
                        return console.log(error)
                    })
                    success("You have been messaged a verification code.", message)

                }

                break;

            case 'unregister':
                if (!args[0]) return warning(`Please enter an IGN to unlink from your discord account in the format \`${hardconfig.prefix}unregister <IGN>\``, message)
                ign = preargs[0]
                if ((!isRegExpFormat(ign, /^\w+$/)) || (ign.length > 16)) return warning(`<@${message.author.id}> \`${preargs[0]}\` is not a valid IGN`, message)
                if (!userdata[message.author.id]) return warning('You do not have any Account registered under your name', message)
                if (typeof ignToDiscordID(ign) == 'undefined') return warning(`The Account \`${preargs[0]}\` is not linked to any account. Ensure that you capitalised it correctly.`, message)
                if (ignToDiscordID(ign) !== message.author.id) return warning(`The Account \`${preargs[0]}\` is not linked to your discord account. It is linked to <@${ignToDiscordID(ign)}>`, message)
                message.react('⏳').catch(console.error)
                getUUIDjson(ign)
                    .then(x => {
                        uuid = x.data.id
                        userdata[message.author.id].uuids.splice(userdata[message.author.id].uuids.indexOf(uuid), 1);
                        userdata[message.author.id].names.splice(userdata[message.author.id].names.indexOf(ign), 1)
                        message.reply(`Successfully unlinked the Account \`${preargs[0]}\` from your discord account.`)
                    })
                    .catch(console.error)
                break;

            case 'forceunregister':
                if (!hasPerms(message.member, "force_unlink_account")) return warning(`<@${message.author.id}> You do not have permission to execute the command \`${hardconfig.prefix}forceunregister\``, message)
                ign = preargs[0]
                if ((!isRegExpFormat(ign, /^\w+$/)) || (ign.length > 16)) return warning(`\`${preargs[0]}\` is not a valid IGN`, message)
                if (typeof ignToDiscordID(ign) == 'undefined') return warning(`The Account \`${preargs[0]}\` is not linked to any account. Ensure that you capitalised it correctly.`, message)
                message.react('⏳').catch(console.error)
                id = ignToDiscordID(ign)
                getUUIDjson(ign)
                    .then(x => {
                        uuid = x.data.id
                        userdata[id].uuids.splice(userdata[id].uuids.indexOf(uuid), 1);
                        userdata[id].names.splice(userdata[id].names.indexOf(ign), 1)
                        success(`<@${message.author.id}> Successfully unlinked the Account \`${preargs[0]}\` from <@${id}>`, message)
                    })
                    .catch(console.error)
                break;

            case 'clearwalls':
                if (!settings.wallsenabled) return warning("Wall checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check walls`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                clearWalls(userdata[message.author.id].names[0], message.author.id, "Discord")
                return message.delete()

            case 'clearcactus':
                if (!settings.cactusenabled) return warning("Cactus checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check walls`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                clearCactus(userdata[message.author.id].names[0], message.author.id, "Discord")
                return message.delete()

            case 'clearbuffer':
                if (!settings.bufferenabled) return warning("Buffer checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check buffers`)
                if (!userdata[message.author.id]) initID(message.author.id)
                clearBuffer(userdata[message.author.id].names[0], message.author.id, "Discord")
                return message.delete()

            case 'weewoowalls':
                if (!settings.wallsenabled) return warning("Wall checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check walls`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                weewooWalls(userdata[message.author.id].names[0], message.author.id, "Discord")
                return message.delete()

            case 'weewoowalls':
                if (!settings.cactusenabled) return warning("Cactus checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check walls`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                weewooCactus(userdata[message.author.id].names[0], message.author.id, "Discord")
                return message.delete()

            case 'weewoobuffer':
                if (!settings.bufferenabled) return warning("Buffer checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check buffers`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                weewooBuffer(userdata[message.author.id].names[0], message.author.id, "Discord")
                return message.delete()

            case 'wrongcheckchannel':
                warning(`<@${message.author.id}> Please use this command in an appropriate channel.`, message)
                return message.delete()

            case 'alert':
                if (!settings.bufferenabled) return warning("Buffer checks are not enabled", message);
                if (!hasPerms(message.member, "check")) return warning(`<@${message.author.id}> You do not have permissions to check buffers`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                info = preargs.join(" ")
                info = info.replace("buffer", "")
                alertBuffer(userdata[message.author.id].names[0], message.author.id, info, "Discord")
                return message.delete()

            case 'restart':
                if (!hasPerms(message.member, "restart")) return warning(`${message.author} You do not have permissions to restart the bot`, message)
                success(`Bot restarting. Be patient`, message)
                writeJSON(times, 'times')
                writeJSON(userdata, 'userdata')
                writeJSON(settings, 'settings')
                writeJSON(permissions, 'permissions')
                writeJSON(hardconfig, 'hardconfig')
                setTimeout(() => process.exit(0), 10000)
                break;

            case 'help':
                let menu = 'General';

                helpembed1 = new Discord.MessageEmbed() // Define a new embed
                    .setColor('BLUE') // Set the color
                    .setTitle("Discord General Command Help Page 1")
                    .setDescription(`Support server: https://discord.gg/9QH8aUU`)
                    .addField('⏹️: Delete Message', `
                        **${hardconfig.prefix}link** *<ign>*  \`Link your Minecraft Account to your discord Account\`
                        **${hardconfig.prefix}unlink** *<ign>* \`Unlink a Minecraft Account from your Discord\`
                        **${hardconfig.prefix}clear** *[walls/buffer/cactus]* \`Clear walls or buffer\`
                        **${hardconfig.prefix}alert** *[info]* \`Alert of new buffer claims\`
                        **${hardconfig.prefix}weewoo** *[walls/buffer/cactus]* \`Weewoo the walls or buffers\`
                        **${hardconfig.prefix}add** *<value>* \`Add value\`
                        **${hardconfig.prefix}remove** *<value>* \`Remove value from your total\`
                        **${hardconfig.prefix}last** *[walls/buffer/cactus]* \`View info about the last walls/buffer check\`
                        **${hardconfig.prefix}ftop** \`Force a ftop update\`
                        **${hardconfig.prefix}online** \`View currently online players\`
                        **${hardconfig.prefix}help** \`Show this menu\`
                        
                        `)
                    .addField('\u200b', `
                        **${hardconfig.prefix}top** *[walls/buffers/value/cactus]* \`View the leaderboards\`
                        **${hardconfig.prefix}stats** *[@user]* \`View a user's stats\`
                        **${hardconfig.prefix}pmremind** *[@user]* <on/off> \`Toggle check reminders in DMs.\`
                        **${hardconfig.prefix}pmweewoo** *[@user]* <on/off> \`Toggle weewoo alerts in DMs.\`
                        **${hardconfig.prefix}userinfo** *[@user]* \`View information about a user\`
                        **${hardconfig.prefix}serverinfo** \`View information about the server\`
                        **${hardconfig.prefix}calc** *<equation>* \`Run a calculation\`
                        **${hardconfig.prefix}avatar** *[@user]* \`Show a user's avatar\``)
                    .setFooter(`<> = required, [] = optional | Page 1: General commands`)

                const ingamehelp = new Discord.MessageEmbed()
                    .setColor('BLUE') // Set the color
                    .setTitle(`Ingame Command Help /msg ${(bot) ? `${bot.username}` : 'BOT'} **command**`)
                    .addField(`Ingame features are currently **${(hardconfig.ingame) ? `enabled` : `disabled`}**`, `
                        **${hardconfig.clearwallcommand}** \`Clears walls\`
                        **${hardconfig.clearbuffercommand}** \`Clears buffers\`
                        **${hardconfig.clearcactuscommand}** \`Clears cactus walls\`
                        **${hardconfig.weewoowallcommand}** \`Weewoos walls\`
                        **${hardconfig.weewoocactuscommand}** \`Weewoos cactus walls\`
                        **${hardconfig.weewoobuffercommand}** \`Weewoos Buffer\`
                        **${hardconfig.alertbuffercommand}** *[info]* \`Alert the buffer\`
                        **${hardconfig.addvaluecommand}** *<value>* \`Add value\`
                        ${(settings.strikesenabled) ? `**${hardconfig.strikecommand}** *<IGN> [reason]* \`Give a player a strike\`\n` : ``}**tpyes** \`Forces /tpyes on the bot (requires sudo or runcmd permission)\`
                        **joinme** \`The bot will attempt to join your faction. Requirs sudo or runcmd perms\``)
                    .setFooter(`<> = required, [] = optional | Page 4: Ingame commands`)

                const adminhelp = new Discord.MessageEmbed()
                    .setColor('BLUE') // Set the color
                    .setTitle("Discord Admin Command Help")
                    .addField('⏹️: Delete Message', `
                        **${hardconfig.prefix}strike** *<add/remove> <@user> [reason]* \`Give/remove a strike from a user\`
                        **${hardconfig.prefix}announce** *<message>* \`Announce a message ingame\`
                        **${hardconfig.prefix}toggle** *<feature / view> [on/off]* \`Toggle various features\`
                        **${hardconfig.prefix}settings** *[<setting> <value>]/show* \`Change the bots settings.\`
                        **${hardconfig.prefix}sudo** *<command>* \`Run a command\`
                        **${hardconfig.prefix}runcmd** *<command>* \`Run a command and view the chatmessages\`
                        **${hardconfig.prefix}setstats** *<@user> <wallchecks/bufferchecks/value> <value>* \`Set a users stats\`
                        **${hardconfig.prefix}addstats** *<@user> <wallchecks/bufferchecks/value> <value>* \`Add stats to a user\`
                        **${hardconfig.prefix}transferstats** *<@touser> <@fromuser>* \`transfers stats from one user to another (resets @fromuser)\`
                        **${hardconfig.prefix}adduserstats** *<@touser> <@fromuser>* \`add stats from one user to another (resets @fromuser)\``)
                    .addField('\u200b', `
                    **${hardconfig.prefix}resetstats** *<@user>* \`Reset all stats for a user\`
                    **${hardconfig.prefix}resetallscores** \`Reset all stored stats\`
                    **${hardconfig.prefix}viewdmreminds** \`Show users that have DM reminders turned on\`
                    **${hardconfig.prefix}viewdmweewoos** \`Show users that have DM weewoo alerts turned on\`
                        **${hardconfig.prefix}viewlogs** *<value/walls/buffers/cactus/punishments>* \`View the corresponding logs\`
                        **${hardconfig.prefix}grace** *<on/off/time>* \`Set a grace period for a specified time\`
                        **${hardconfig.prefix}bancmd** *<command>* \`Bans a command\`
                        **${hardconfig.prefix}restart** \`Restarts the bot\`
                        **${hardconfig.prefix}permissions** *<@role/@user> [init]/[<permname> <value>]/[show]* \`Start setting up permissions\`
                        **${hardconfig.prefix}messages** *<show>/[<messagename> <new message>]* \`Set the messages the bot sends\``)
                    .setFooter(`<> = required, [] = optional | Page 2: Admin commands`)

                const moderationhelp = new Discord.MessageEmbed()
                    .setColor('BLUE') // Set the color
                    .setTitle("Discord Moderation Command Help")
                    .addField('⏹️: Delete Message', `
                        **${hardconfig.prefix}ban** *<@user> [reason]* \`Ban a user from the server\`
                        **${hardconfig.prefix}unban** *<userid>* \`Unban a user from the server\`
                        **${hardconfig.prefix}kick** *<@user> [reason]* \`Kick a user from the server\`
                        **${hardconfig.prefix}mute** *<@user> [time]* \`Mute a user\`
                        **${hardconfig.prefix}unmute** *<@user> <time>* \`Unmute a user\`
                        **${hardconfig.prefix}purge** *<amount>* \`Purge messages in a channel\`
                        **${hardconfig.prefix}dmrole** *<rolename> <message>* \`DM everyone with a specific role\`
                        **${hardconfig.prefix}lock** \`Lock a channel\`
                        **${hardconfig.prefix}unlock**  \`Unlock a locked channel\`
                        **${hardconfig.prefix}blacklist** *<#channel / @user>* \`Prevent/Re-allow a channel/user from bot commands\``)
                    .setFooter(`<> = required, [] = optional | Page 3: Moderation commands`)

                embed = helpembed1;
                if (args[0] == 'ingame') {
                    menu = 'Ingame'
                    embed = ingamehelp
                } else if (args[0] == 'admin') {
                    menu = 'Admin'
                    embed = adminhelp
                } else if (args[0] == 'mod' || args[0] == 'moderation') {
                    menu = "Moderation"
                    embed = moderationhelp
                }

                message.channel.send(embed).then(msg => {
                    msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                        msg.react('⏩')


                        const helpcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                            time: 120000
                        })

                        helpcollector.on('collect', (reaction, user) => {
                            if (reaction.emoji.name == '⏪') {
                                if (menu == 'General') return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                menu = 'General'
                                msg.edit(helpembed1)
                                return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                            } else if (reaction.emoji.name == '⬅️') {
                                switch (menu) {
                                    case 'General':
                                        break;
                                    case 'Admin':
                                        menu = 'General'
                                        msg.edit(helpembed1)
                                        break;
                                    case 'Moderation':
                                        menu = 'Admin'
                                        msg.edit(adminhelp)
                                        break;
                                    case 'Ingame':
                                        menu = 'Moderation'
                                        msg.edit(moderationhelp)
                                        break;
                                }
                                return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                            } else if (reaction.emoji.name == '⏹️') {
                                return msg.delete().catch(console.error)
                            } else if (reaction.emoji.name == '➡️') {
                                switch (menu) {
                                    case 'General':
                                        menu = `Admin`
                                        msg.edit(adminhelp)
                                        break;
                                    case 'Admin':
                                        menu = 'Moderation'
                                        msg.edit(moderationhelp)
                                        break;
                                    case 'Moderation':
                                        menu = 'Ingame'
                                        msg.edit(ingamehelp)
                                        break;
                                    case 'Ingame':
                                        break;
                                }
                                return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                            } else if (reaction.emoji.name == '⏩') {
                                if (menu == 'Ingame') return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                menu = 'Ingame'
                                msg.edit(ingamehelp)
                                return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                            }
                        })
                        helpcollector.on('end', () => {
                            setTimeout(() => {
                                if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                if (!message.deleted) message.delete().catch(console.error)
                            }, 1000)
                        })
                    })
                })
                break;

            case 'add':
                if (!settings.valueenabled) return warning(`<@${message.author.id}> Value is not enabled. Enable it using \`$toggle value\``, message)
                if (!hasPerms(message.member, "addvalue")) return warning(`<@${message.author.id}>You do not have permissions to add value.`, message)
                if (!args[0]) return usage(`${hardconfig.prefix}add <value>`, `Add`, message)
                if (!userdata[message.author.id]) initID(message.author.id)
                text = preargs.join(" ")
                text = text.replace("value", "")
                if (!addValue(message.author.id, text, userdata[message.author.id].names[0])) warning(`\`${text}\` is not valid value (either invalid arguments or below $1)`, message)
                return message.delete().catch(console.error)

            case 'remove':
                if (!settings.valueenabled) return warning("Value is not enabled", message)
                if (!hasPerms(message.member, "addvalue")) return warning(`<@${message.author.id}> You do not have permissions to manage value`, message)
                if (!args[0]) return usage(`${hardconfig.prefix}remove <value>`, `remove`, message)
                if (!userdata[message.author.id]) return warning("You have never added value.", message)
                text = preargs.join(" ")
                text = text.replace("value", "")
                value = calcValue(text)
                newvalue = parseInt(userdata[message.author.id].value) - value;
                if (newvalue < 0) return warning(`Removing that much value would leave your total value below $0`, message)
                userdata[message.author.id].value = newvalue;
                message.reply(`You removed ${formatter.format(value)} from your account. Your total value is now \`${formatter.format(newvalue)}\``).catch(console.error)
                date = new Date()
                utcdate = date.toUTCString()
                fs.appendFile(`./logs/valuelogs.txt`, `**[${utcdate}]** <@${message.author.id}> removed \`${text}\` worth \`${formatter.format(value)}\`\r\n`, err => {
                    if (err) console.log(err)
                })
                return message.delete().catch(console.error)

            case 'stats':
                if (!userdata[u.id]) return warning(`This user does not have any stored data`, message);
                igns = userdata[u.id].names.join(", ")
                link = `https://minotar.net/helm/${userdata[u.id].names[0]}.png`
                if (!userdata[u.id].names[0]) {
                    link = `https://minotar.net/helm/Alex.png`
                    igns = `This user does not have any linked accounts`
                }
                const statsembed = new Discord.MessageEmbed()
                    .setThumbnail(link)
                    .setAuthor(message.author.tag, message.author.displayAvatarURL())
                    .setTitle(`${u.tag}'s Stats`)
                    .setFooter(`${u.tag}`, `${u.displayAvatarURL()}`)
                    .addFields({
                        name: `**Linked IGNs**`,
                        value: `${igns}`
                    }, {
                        name: `**Total Wallchecks (Main + Cactus)**`,
                        value: `${userdata[u.id].wallchecks + userdata[u.id].cactuschecks}`,
                        inline: true
                    }, {
                        name: `**Bufferchecks**`,
                        value: `${userdata[u.id].bufferchecks}`,
                        inline: true
                    }, {
                        name: `**Total Value**`,
                        value: `${formatter.format(userdata[u.id].value)}`,
                        inline: true
                    }, {
                        name: `${(settings.cactusenabled) ? `**Main Wallchecks**` : '\u200B'}`,
                        value: `${(settings.cactusenabled) ? `${userdata[u.id].wallchecks}` : '\u200B'}`,
                        inline: true
                    }, {
                        name: `${(settings.cactusenabled) ? `**Cactus Wallchecks**` : '\u200B'}`,
                        value: `${(settings.cactusenabled) ? `${userdata[u.id].cactuschecks}` : '\u200B'}`,
                        inline: true
                    }, {
                        name: `${(settings.strikesenabled) ? `**Strikes**` : '\u200B'}`,
                        value: `${(settings.strikesenabled) ? `${userdata[u.id].strikes}` : '\u200B'}`,
                        inline: true
                    })
                    .setColor('DARK_NAVY')
                message.channel.send(statsembed).catch(console.error)
                break;

            case 'userinfo':
                const member = message.mentions.members.first() || message.member;
                const userinfoembed = new Discord.MessageEmbed()
                    .setAuthor(u.tag, `${u.displayAvatarURL()}`)
                    .addField('Nickname', member.nickname ? member.nickname : 'None', true)
                    .addField("Username", u.username, true)
                    .addField('Registered', `${moment(u.createdAt).format("LLLL")}`, true)
                    .addField('Status', u.presence.status, true)
                    .addField("Joined", `${moment(member.joinedAt).format("LLLL")}`, true)
                    .addField("Roles (" + (member.roles.cache.size - 1) + ")", member.roles.cache.map(r => r.name).join(', ').replace(', @everyone', ''), true)
                    .setThumbnail(`${u.displayAvatarURL()}`)
                    .setFooter("ID: " + u.id + ` | Requested by ${message.author.tag}`, `${u.displayAvatarURL()}`)
                    .setColor('BLURPLE')
                message.channel.send(userinfoembed).catch(console.error);
                break;

            case 'serverinfo':
                const serverinfoembed = new Discord.MessageEmbed()
                    .setTitle("Server Info")
                    .setThumbnail(message.guild.iconURL())
                    .addField("Owner", message.guild.owner, true)
                    .addField("Region", message.guild.region, true)
                    .addField("Created", moment(message.guild.createdAt).format("LLLL"), true)
                    .addField("Members", message.guild.members.cache.size + " Members", true)
                    .setColor('DARK_AQUA')
                    .setFooter(`Requested by ${message.author.tag}`)
                message.channel.send(serverinfoembed).catch(console.error)
                break;

            case 'calc':
                equation = args.join(" ")
                if (!equation) return usage("calc <equation>", "Calc", message)
                const calcembed = new Discord.MessageEmbed()
                    .setTitle("Calculate")
                    .setDescription(`**Result of** \`${equation}\`:\n\`${math.evaluate(equation)}\``)
                    .setColor('NOT_QUITE_BLACK')
                message.channel.send(calcembed)
                break;

            case 'sudo':
                if ((!hardconfig.ingame)) return warning("Ingame Bot is not enabled", message)
                if (!hasPerms(message.member, "sudo")) return warning(`<@${message.author.id}> You do not have permissions to run \`${hardconfig.prefix}sudo\``)
                pushmsg = preargs.join(" ")
                if (!pushmsg) return usage(`sudo <command to execute>`, "Sudo", message)
                if (pushmsg.length > 99) return warning("That command is too long, I would get kicked from the server.", message)
                bot.write('chat', {
                    message: pushmsg
                });
                return success(`Executed \`${pushmsg}\``, message);

            case 'announce':
                if ((!hardconfig.ingame)) return warning("Ingame Bot is not enabled", message)
                if (!hasPerms(message.member, "announce")) return warning(`<@${message.author.id}> You do not have permissions to run \`${hardconfig.prefix}announce\``, message)
                pushmsg = preargs.join(' ')
                if (!pushmsg) return usage(`announce <Message>`, "Announce", message)
                announcemsg = `/ff ANNOUNCEMENT: ${pushmsg} - ${message.author.tag}`
                if (announcemsg.length > 99) return warning("That announcement is too long, I would get kicked from the game", message)
                bot.write('chat', {
                    message: announcemsg
                })
                return success(`Announcement sent: \`${pushmsg}\``, message)

            case 'ftop':
                if (!hardconfig.ingame) return warning("Ingame Bot is not enabled", message)
                if (!hasPerms(message.member, "ftop")) return warning(`<@${message.author.id}> You do not have permissions to run \`${hardconfig.prefix}ftop\``, message)
                displayFtop()
                return success("Updating ftop", message);

            case 'runcmd':
                if (!hardconfig.ingame) return warning("Ingame Bot is not enabled", message)
                if (!hasPerms(message.member, "runcmd")) return warning(`<@${message.author.id}> You are not allowed to use \`${hardconfig.prefix}runcmd\``, message)
                pushmsg = preargs.join(" ")
                if (!pushmsg) return usage("runcmd <command>", `RunCmd`, message)
                if (pushmsg.length > 99) return warning("That command is too long, I would get kicked from the server.", message)
                runcmd = true;
                bot.write('chat', {
                    message: pushmsg
                });
                setTimeout(() => {
                    runcmd = false
                    if (runcmddata == "") return warning("No messages were collected during this runcmd", message)
                    const runcmdembed = new Discord.MessageEmbed()
                        .setTitle(`Runcmd: \`${pushmsg}\``)
                        .setDescription(`\`\`\`${runcmddata.join(`\n`)}\`\`\``)
                        .setColor('AQUA')
                        .setFooter(`${message.author.tag}`, `${message.author.displayAvatarURL()}`)
                    message.channel.send(runcmdembed)
                    runcmddata = []
                }, 1000)
                break;

            case 'grace':
                if (!hasPerms(message.member, "grace")) return warning(`<@${message.author.id}> You are not allowed to use \`${hardconfig.prefix}grace\``, message)
                if (toBool(args[0]) == true) {
                    if ((!settings.wallsenabled) && (!settings.bufferenabled)) return warning("Grace is already enabled", message)
                    settings.wallsenabled = false;
                    settings.bufferenabled = false;
                    settings.cactusenabled = false;
                    writeJSON(settings, 'settings')
                    success(`**Grace Activated**\n**<@${message.author.id}>** has activated a grace period until further notice.\nNo checks will be pinged within this period. `, message)

                } else if (toBool(args[0]) === false) {
                    if ((settings.wallsenabled) && (settings.bufferenabled)) return warning("Grace is already disabled", message)
                    settings.wallsenabled = true;
                    settings.bufferenabled = true;
                    times.lastwallcheck = Date.now()
                    times.lastwallreminder = Date.now()
                    times.lastbuffercheck = Date.now()
                    times.lastbufferreminder = Date.now()
                    writeJSON(settings, 'settings')
                    const nograce = new Discord.MessageEmbed()
                        .setColor('DARK_RED')
                        .setTitle(":warning:GRACE IS **DISABLED**")
                        .setDescription(`**Grace Disabled**\n**<@${message.author.id}>** has just deactivated the grace period. Wall and Buffer checks are now re-enabled`)
                        .setTimestamp()
                    wallschannel.send(nograce).catch(console.error)
                    success(`**Grace Disabled**\n**<@${message.author.id}>** has just deactivated the grace period. Wall and Buffer checks are now re-enabled`, message)

                } else {
                    if (!args[0]) return usage(`grace <on/off/time>`, `Grace`, message)
                    if (typeof ms(args[0]) == 'undefined') return usage(`grace <on/off/time>`, `Grace`, message)
                    if (!settings.wallsenabled) {
                        success(`**Grace Timer Activated**\n**<@${message.author.id}>** has set the Grace Period Timer for **${args[0]}** \nWhen the time has passed, check reminders will begin.`, message)
                        settings.bufferenabled = false;
                        settings.cactusenabled = false;
                        setTimeout(() => {
                            settings.wallsenabled = true
                            settings.bufferenabled = true
                            times.lastwallcheck = Date.now()
                            times.lastwallreminder = Date.now()
                            times.lastbuffercheck = Date.now()
                            times.lastbufferreminder = Date.now()
                            writeJSON(settings, 'settings')
                            const nograce = new Discord.MessageEmbed()
                                .setColor('DARK_RED')
                                .setTitle(":warning:GRACE IS **DISABLED**")
                                .setDescription("Grace is now **DISABLED**. Wall and Buffer checks are now enabled.")
                                .setTimestamp()
                            wallschannel.send(nograce).catch(console.error)
                            success("Grace is now **DISABLED**. Wall and Buffer checks are now enabled", message)
                        }, ms(args[0]));
                    } else if (settings.wallsenabled) {
                        success(`**Grace Activated**\n**${message.author.tag}** has activated a Grace Period for **${args[0]}** \nNo checks will be pinged within this period. `, message)
                        settings.wallsenabled = false;
                        settings.bufferenabled = false;
                        settings.cactusenabled = false;
                        setTimeout(() => {
                            settings.wallsenabled = true
                            settings.bufferenabled = true
                            times.lastwallcheck = Date.now()
                            times.lastwallreminder = Date.now()
                            times.lastbuffercheck = Date.now()
                            times.lastbufferreminder = Date.now()
                            writeJSON(settings, 'settings')
                            const nograce = new Discord.MessageEmbed()
                                .setColor('DARK_RED')
                                .setTitle(":warning:GRACE IS **DISABLED**")
                                .setDescription("Grace is now **DISABLED**. Wall and Buffer checks are now enabled.")
                                .setTimestamp()
                            wallschannel.send(nograce).catch(console.error)
                            success("Grace is now **DISABLED**. Wall and Buffer checks are now enabled", message)
                        }, ms(args[0]));
                    }
                }
                break;

            case 'purge':
                if (!hasPerms(message.member, "purgemessages")) return warning(`<@${message.author.id}> You do not have permissions to purge messages.`, message)
                let purge = args[0]
                if (!purge) return usage("purge <1-100>", "Purge", message)
                if (purge > 100) return warning("Number must be less than 100", message)
                if (purge < 1) return warning("Number must be greater than 0", message)
                message.delete().catch(console.error)
                setTimeout(() => {
                    message.channel.bulkDelete(purge).catch(error => warning("Can't delete messages older than 14 days.", message))
                }, 300)
                break;

            case 'dmrole':
                if (!hasPerms(message.member, "dmrole")) return warning(`<@${message.author.id}> You don't have permissions to use DmRole`, message)
                if (!args[0] || !args[1]) return usage("dmrole [role] [message]", "Dmrole", message);
                role = message.mentions.roles.first() || message.guild.roles.cache.find(x => x.name == preargs[0]);
                if (!role) return warning(`The role ${preargs[0]} is not a valid role`, message)
                let msg = preargs.slice(1).join(" ")
                message.guild.members.cache.each(m => {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("DM Announcement")
                        .setDescription(msg)
                        .setColor('NAVY')
                        .setFooter("Sent by: " + message.author.tag)
                    if (m.roles.cache.has(role.id)) {
                        m.send(embed).catch((error) => {
                            warning(`${m} has the bot blocked or has DM's disabled`, message)
                        })
                    }
                })
                success(`Sent message \`${msg}\` to all members with role ${role}`, message)
                break;

            case 'lock':
                if (!hasPerms(message.member, 'lock')) return warning(`<@${message.author.id}> You are not allowed to lock channels`, message)
                chann = message.mentions.channels.first() || message.channel
                chann.updateOverwrite(message.guild.id, {
                    SEND_MESSAGES: false
                }).catch(error => {
                    message.delete()
                    return warning("I was not able to lock this channel", message)
                })
                const lockembed = new Discord.MessageEmbed()
                    .setColor('PURPLE')
                    .setTitle("🔒 Channel Locked 🔒")
                    .setDescription("React with 🔓 or use **" + hardconfig.prefix + "unlock** to unlock this channel again\n If this message gets deleted, the channel will automatically be unlocked.")
                    .setFooter(`Locked by ${message.author.tag}`)

                if (chann !== message.channel) success(`Locked ${chann} successfully`, message)
                message.delete()

                chann.send(lockembed).then(msg => {
                    msg.react('🔓')

                    const lockcollector = msg.createReactionCollector((reaction, user) => ((reaction.emoji.name == '🔓') && (user != client.user)))
                    const unlockcollector = msg.channel.createMessageCollector((msg) => msg.content == `${hardconfig.prefix}unlock`);
                    lockcollector.on('collect', (reaction, user) => {
                        if (hasPerms((msg.guild.members.cache.get(user.id)), "lock")) return lockcollector.stop("i can")
                        return reaction.users.remove(reaction.users.cache.filter(u => u === user).first())
                    })
                    unlockcollector.on('collect', m => {
                        if (hasPerms((m.guild.members.cache.get(m.author.id)), "lock")) {
                            lockcollector.stop("$unlock")
                            msg.delete().catch(console.error)
                            return unlockcollector.stop()
                        }
                        return;
                    })
                    lockcollector.on('end', (collected, reason) => {
                        if (reason == '$unlock') return;
                        chann.updateOverwrite(message.guild.id, {
                            SEND_MESSAGES: null
                        }).catch(error => warning("I was not able to unlock this channel", message))
                        unlockembed = new Discord.MessageEmbed()
                            .setTitle(`Unlocked channel`)
                            .setColor('GREEN')
                            .setDescription(`Unlocked channel ${chann} successfully`)
                        chann.send(unlockembed)
                        if (!msg.deleted) msg.delete().catch(console.error)
                    })

                })
                break;

            case 'unlock':
                if (!hasPerms(message.member, 'lock')) return warning(`<@${message.author.id}> You are not allowed to unlock channels`, message)
                chann = message.mentions.channels.first() || message.channel
                chann.updateOverwrite(message.guild.id, {
                    SEND_MESSAGES: null
                }).catch(error => warning("I was not able to unlock this channel", message))
                success(`Unlocked ${chann} successfully`, message)
                break;

            case 'blacklist':
                if (!hasSpecialPerms(message.member, "blacklist")) return warning(`<@${message.author.id}> You are not allowed to use **${hardconfig.prefix}blacklist**`, message)
                if (!args[0]) return usage("blacklist <#channel / @user>", "Blacklist", message)
                var mention = args[0].toString().replace(/[<>@#!]+/g, "")
                if (!mention) return usage("blacklist <#channel / @user>", "Blacklist", message)

                if (!settings.blacklists.includes(mention)) {
                    settings.blacklists.push(mention)
                    success(`Added ${(message.guild.channels.cache.get(mention)) ? `<#${mention}>` : `<@${mention}>`} to the command blacklist. `, message)
                }
                writeJSON(settings, "settings")
                break;

            case 'unblacklist':
                if (!hasSpecialPerms(message.member, 'blacklist')) return warning(`<@${message.author.id}> You are not allowed to use this command`, message);

                if (!args[0]) return usage("unblacklist <#channel / @user>", "Blacklist", message)
                var mention = args[0].toString().replace(/[<>@#!]+/g, "")
                if (settings.blacklists.includes(mention)) {
                    settings.blacklists.splice(settings.blacklists.indexOf(`${mention}`), 1);
                    success(`Removed ${(message.guild.channels.cache.get(mention)) ? `<#${mention}>` : `<@${mention}>`} from the command blacklist. `, message)
                    writeJSON(settings, 'settings')
                } else return warning(`This channel/user is not blacklisted`, message);
                break;

            case 'avatar':
                const avatarembed = new Discord.MessageEmbed()
                    .setTitle(`${u.username}'s Avatar`)
                    .setImage(`${u.displayAvatarURL()}`)
                    .setColor('GREYPLE')
                message.channel.send(avatarembed).catch(console.error)
                break;

            case 'setstats':
                if (!hasPerms(message.member, "setstats")) return warning(`<@${message.author.id}> You do not have permissions to use **${hardconfig.prefix}setstats**`, message)
                statuser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0])) || args[0]
                if ((!statuser) || !args[1] || !args[2]) return usage(`setstats <@user> <wallchecks/bufferchecks/value> <number>`, "Setstats", message)
                if (statuser.id) statuser = statuser.id
                else statuser = args[0]
                if (!userdata[statuser]) return warning("This user does not have any data", message)

                if (args[1] == "walls" || args[1] == "wallchecks" || args[1] == 'wallscore') type = 'wallchecks'
                else if (args[1] == 'buffers' || args[1] == "bufferchecks" || args[1] == "bufferscore") type = "bufferchecks"
                else if (args[1] == 'value' || args[1] == 'totalvalue' || args[1] == 'valueadded' || args[1] == 'added') type = 'value'
                else if (args[1] == 'cactus' || args[1] == "cactuschecks" || args[1] == "cactusscore") type = "cactuschecks"
                else return usage(`setstats <@user> <wallchecks/cactuschecks/bufferchecks/value> <number>`, "Setstats", message)

                if (!isRegExpFormat(args[2], /[0-9.,]+/g)) return usage(`setstats <@user> <wallchecks/bufferchecks/value> <number>`, "Setstats", message)

                userdata[statuser][type] = parseInt(args[2])
                success(`Set <@${statuser}>'s ${args[1]} to \`${userdata[statuser][type]}\``, message);
                break;

            case 'addstats':
                if (!hasPerms(message.member, "setstats")) return warning(`<@${message.author.id}> You do not have permissions to use **${hardconfig.prefix}addstats**`, message)
                statuser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0])) || args[0]
                if ((!statuser) || !args[1] || !args[2]) return usage(`addstats <@user> <wallchecks/bufferchecks/value> <number>`, "Addstats", message)
                if (statuser.id) statuser = statuser.id
                else statuser = args[0]
                if (!userdata[statuser]) return warning("This user does not have any data", message)

                if (args[1] == "walls" || args[1] == "wallchecks" || args[1] == 'wallscore') type = 'wallchecks'
                else if (args[1] == 'buffers' || args[1] == "bufferchecks" || args[1] == "bufferscore") type = "bufferchecks"
                else if (args[1] == 'value' || args[1] == 'totalvalue' || args[1] == 'valueadded' || args[1] == 'added') type = 'value'
                else if (args[1] == 'cactus' || args[1] == "cactuschecks" || args[1] == "cactusscore") type = "cactuschecks"
                else return usage(`addstats <@user> <wallchecks/cactuschecks/bufferchecks/value> <number>`, "addstats", message)

                if (!isRegExpFormat(args[2], /[0-9.,]+/g)) return usage(`setstats <@user> <wallchecks/bufferchecks/value> <number>`, "Addstats", message)

                userdata[statuser][type] += parseInt(args[2])
                success(`Set <@${statuser}>'s ${args[1]} to \`${userdata[statuser][type]}\``, message);
                break;

            case 'wrongtopchannel':
                warning(`<@${message.author.id}> Please use this command in an appropriate channel.`, message)
                return message.delete()

            case 'buffertop':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)

                let bufferraw = []
                let bufferfinal = [];
                let buffertoparray = [];
                let bufferposition;
                for (let id in userdata) {
                    bufferraw.push({
                        checks: userdata[id].bufferchecks,
                        id: id
                    });
                }
                bufferraw = bufferraw.sort((a, b) => parseInt(b.checks) - parseInt(a.checks))

                for (let i in bufferraw) {
                    if ((parseInt(i) + 1) > 3) buffertoparray.push(`**#${parseInt(i) + 1}** <@${bufferraw[i].id}> - ${bufferraw[i].checks} checks`)
                    else if ((parseInt(i) + 1) == 1) buffertoparray.push(`**:first_place: -** <@${bufferraw[i].id}> - ${bufferraw[i].checks} checks\n`)
                    else if ((parseInt(i) + 1) == 2) buffertoparray.push(`**:second_place: -** <@${bufferraw[i].id}> - ${bufferraw[i].checks} checks\n`)
                    else if ((parseInt(i) + 1) == 3) buffertoparray.push(`**:third_place: -** <@${bufferraw[i].id}> - ${bufferraw[i].checks} checks\n`)
                    if (bufferraw[i].id == message.author.id) bufferposition = buffertoparray.length;
                }

                let bufferpageamount = Math.ceil(buffertoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let bufferpage = parseInt(((args[0]) ? args[0] : "1"));
                if (bufferpage > bufferpageamount) return warning("This page does not exist.", message);
                buffertoparray.forEach(e => {
                    if (((buffertoparray.indexOf(e) + 1) <= ((bufferpage * 15))) && ((buffertoparray.indexOf(e)) >= ((bufferpage - 1) * 15))) bufferfinal.push(e)

                })

                const buffertopembed = new Discord.MessageEmbed()
                    .setTitle(`:star:${message.guild.name}'s Top Buffer Checkers:star:`)
                    .setDescription(bufferfinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${bufferpage} of ${bufferpageamount} | You, ${message.author.username} are at position #${bufferposition}`)

                message.channel.send(buffertopembed).then(msg => {
                    if (bufferpageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const buffertopcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            buffertopcollector.on('collect', (reaction, user) => {
                                bufferfinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (bufferpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    bufferpage = 1
                                    buffertoparray.forEach(e => {
                                        if (((buffertoparray.indexOf(e) + 1) <= ((bufferpage * 15))) && ((buffertoparray.indexOf(e)) >= ((bufferpage - 1) * 15))) bufferfinal.push(e)
                                    })

                                    buffertopembed.setDescription(bufferfinal.join("\n"))
                                    buffertopembed.setFooter(`Page ${bufferpage} of ${bufferpageamount} | You, ${message.author.username} are at position #${bufferposition}`)
                                    msg.edit(buffertopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (bufferpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    bufferpage--
                                    buffertoparray.forEach(e => {
                                        if (((buffertoparray.indexOf(e) + 1) <= ((bufferpage * 15))) && ((buffertoparray.indexOf(e)) >= ((bufferpage - 1) * 15))) bufferfinal.push(e)
                                    })
                                    buffertopembed.setDescription(bufferfinal.join("\n"))
                                    buffertopembed.setFooter(`Page ${bufferpage} of ${bufferpageamount} | You, ${message.author.username} are at position #${bufferposition}`)
                                    msg.edit(buffertopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (bufferpage == bufferpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    bufferpage++
                                    buffertoparray.forEach(e => {
                                        if (((buffertoparray.indexOf(e) + 1) <= ((bufferpage * 15))) && ((buffertoparray.indexOf(e)) >= ((bufferpage - 1) * 15))) bufferfinal.push(e)
                                    })
                                    buffertopembed.setDescription(bufferfinal.join("\n"))
                                    buffertopembed.setFooter(`Page ${bufferpage} of ${bufferpageamount} | You, ${message.author.username} are at position #${bufferposition}`)
                                    msg.edit(buffertopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (bufferpage == bufferpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    bufferpage = bufferpageamount
                                    buffertoparray.forEach(e => {
                                        if (((buffertoparray.indexOf(e) + 1) <= ((bufferpage * 15))) && ((buffertoparray.indexOf(e)) >= ((bufferpage - 1) * 15))) bufferfinal.push(e)
                                    })
                                    buffertopembed.setDescription(bufferfinal.join("\n"))
                                    buffertopembed.setFooter(`Page ${bufferpage} of ${bufferpageamount} | You, ${message.author.username} are at position #${bufferposition}`)
                                    msg.edit(buffertopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            buffertopcollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'walltop':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)
                let wallraw = []
                let wallfinal = [];
                let walltoparray = [];
                let wallposition;
                for (let id in userdata) {
                    wallraw.push({
                        checks: userdata[id].wallchecks,
                        id: id
                    });
                }
                wallraw = wallraw.sort((a, b) => parseInt(b.checks) - parseInt(a.checks))

                for (let i in wallraw) {
                    if ((parseInt(i) + 1) > 3) walltoparray.push(`**#${parseInt(i) + 1}** <@${wallraw[i].id}> - ${wallraw[i].checks} checks`)
                    else if ((parseInt(i) + 1) == 1) walltoparray.push(`**:first_place: -** <@${wallraw[i].id}> - ${wallraw[i].checks} checks\n`)
                    else if ((parseInt(i) + 1) == 2) walltoparray.push(`**:second_place: -** <@${wallraw[i].id}> - ${wallraw[i].checks} checks\n`)
                    else if ((parseInt(i) + 1) == 3) walltoparray.push(`**:third_place: -** <@${wallraw[i].id}> - ${wallraw[i].checks} checks\n`)
                    if (wallraw[i].id == message.author.id) wallposition = walltoparray.length;
                }

                let wallpageamount = Math.ceil(walltoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let wallpage = parseInt(((args[0]) ? args[0] : "1"));
                if (wallpage > wallpageamount) return warning("This page does not exist.", message);
                walltoparray.forEach(e => {
                    if (((walltoparray.indexOf(e) + 1) <= ((wallpage * 15))) && ((walltoparray.indexOf(e)) >= ((wallpage - 1) * 15))) wallfinal.push(e)

                })

                const walltopembed = new Discord.MessageEmbed()
                    .setTitle(`:star:${message.guild.name}'s Top Wall Checkers:star:`)
                    .setDescription(wallfinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${wallpage} of ${wallpageamount} | You, ${message.author.username} are at position #${wallposition}`)

                message.channel.send(walltopembed).then(msg => {
                    if (wallpageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const walltopcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            walltopcollector.on('collect', (reaction, user) => {
                                wallfinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (wallpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    wallpage = 1
                                    walltoparray.forEach(e => {
                                        if (((walltoparray.indexOf(e) + 1) <= ((wallpage * 15))) && ((walltoparray.indexOf(e)) >= ((wallpage - 1) * 15))) wallfinal.push(e)
                                    })

                                    walltopembed.setDescription(wallfinal.join("\n"))
                                    walltopembed.setFooter(`Page ${wallpage} of ${wallpageamount} | You, ${message.author.username} are at position #${wallposition}`)
                                    msg.edit(walltopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (wallpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    wallpage--
                                    walltoparray.forEach(e => {
                                        if (((walltoparray.indexOf(e) + 1) <= ((wallpage * 15))) && ((walltoparray.indexOf(e)) >= ((wallpage - 1) * 15))) wallfinal.push(e)
                                    })
                                    walltopembed.setDescription(wallfinal.join("\n"))
                                    walltopembed.setFooter(`Page ${wallpage} of ${wallpageamount} | You, ${message.author.username} are at position #${wallposition}`)
                                    msg.edit(walltopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (wallpage == wallpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    wallpage++
                                    walltoparray.forEach(e => {
                                        if (((walltoparray.indexOf(e) + 1) <= ((wallpage * 15))) && ((walltoparray.indexOf(e)) >= ((wallpage - 1) * 15))) wallfinal.push(e)
                                    })
                                    walltopembed.setDescription(wallfinal.join("\n"))
                                    walltopembed.setFooter(`Page ${wallpage} of ${wallpageamount} | You, ${message.author.username} are at position #${wallposition}`)
                                    msg.edit(walltopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (wallpage == wallpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    wallpage = wallpageamount
                                    walltoparray.forEach(e => {
                                        if (((walltoparray.indexOf(e) + 1) <= ((wallpage * 15))) && ((walltoparray.indexOf(e)) >= ((wallpage - 1) * 15))) wallfinal.push(e)
                                    })
                                    walltopembed.setDescription(wallfinal.join("\n"))
                                    walltopembed.setFooter(`Page ${wallpage} of ${wallpageamount} | You, ${message.author.username} are at position #${wallposition}`)
                                    msg.edit(walltopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            walltopcollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'cactustop':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)
                let cactusraw = []
                let cactusfinal = [];
                let cactustoparray = [];
                let cactusposition;
                for (let id in userdata) {
                    cactusraw.push({
                        checks: userdata[id].cactuschecks,
                        id: id
                    });
                }
                cactusraw = cactusraw.sort((a, b) => parseInt(b.checks) - parseInt(a.checks))

                for (let i in cactusraw) {
                    if ((parseInt(i) + 1) > 3) cactustoparray.push(`**#${parseInt(i) + 1}** <@${cactusraw[i].id}> - ${cactusraw[i].checks} checks`)
                    else if ((parseInt(i) + 1) == 1) cactustoparray.push(`**:first_place: -** <@${cactusraw[i].id}> - ${cactusraw[i].checks} checks\n`)
                    else if ((parseInt(i) + 1) == 2) cactustoparray.push(`**:second_place: -** <@${cactusraw[i].id}> - ${cactusraw[i].checks} checks\n`)
                    else if ((parseInt(i) + 1) == 3) cactustoparray.push(`**:third_place: -** <@${cactusraw[i].id}> - ${cactusraw[i].checks} checks\n`)
                    if (cactusraw[i].id == message.author.id) cactusposition = cactustoparray.length;
                }

                let cactuspageamount = Math.ceil(cactustoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let cactuspage = parseInt(((args[0]) ? args[0] : "1"));
                if (cactuspage > cactuspageamount) return warning("This page does not exist.", message);
                cactustoparray.forEach(e => {
                    if (((cactustoparray.indexOf(e) + 1) <= ((cactuspage * 15))) && ((cactustoparray.indexOf(e)) >= ((cactuspage - 1) * 15))) cactusfinal.push(e)

                })

                const cactustopembed = new Discord.MessageEmbed()
                    .setTitle(`:star: ${message.guild.name}'s Top Cactus Checkers :star:`)
                    .setDescription(cactusfinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${cactuspage} of ${cactuspageamount} | You, ${message.author.username} are at position #${cactusposition}`)

                message.channel.send(cactustopembed).then(msg => {
                    if (cactuspageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const cactustopcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            cactustopcollector.on('collect', (reaction, user) => {
                                cactusfinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (cactuspage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    cactuspage = 1
                                    cactustoparray.forEach(e => {
                                        if (((cactustoparray.indexOf(e) + 1) <= ((cactuspage * 15))) && ((cactustoparray.indexOf(e)) >= ((cactuspage - 1) * 15))) cactusfinal.push(e)
                                    })

                                    cactustopembed.setDescription(cactusfinal.join("\n"))
                                    cactustopembed.setFooter(`Page ${cactuspage} of ${cactuspageamount} | You, ${message.author.username} are at position #${cactusposition}`)
                                    msg.edit(cactustopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (cactuspage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    cactuspage--
                                    cactustoparray.forEach(e => {
                                        if (((cactustoparray.indexOf(e) + 1) <= ((cactuspage * 15))) && ((cactustoparray.indexOf(e)) >= ((cactuspage - 1) * 15))) cactusfinal.push(e)
                                    })
                                    cactustopembed.setDescription(cactusfinal.join("\n"))
                                    cactustopembed.setFooter(`Page ${cactuspage} of ${cactuspageamount} | You, ${message.author.username} are at position #${cactusposition}`)
                                    msg.edit(cactustopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (cactuspage == cactuspageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    cactuspage++
                                    cactustoparray.forEach(e => {
                                        if (((cactustoparray.indexOf(e) + 1) <= ((cactuspage * 15))) && ((cactustoparray.indexOf(e)) >= ((cactuspage - 1) * 15))) cactusfinal.push(e)
                                    })
                                    cactustopembed.setDescription(cactusfinal.join("\n"))
                                    cactustopembed.setFooter(`Page ${cactuspage} of ${cactuspageamount} | You, ${message.author.username} are at position #${cactusposition}`)
                                    msg.edit(cactustopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (cactuspage == cactuspageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    cactuspage = cactuspageamount
                                    cactustoparray.forEach(e => {
                                        if (((cactustoparray.indexOf(e) + 1) <= ((cactuspage * 15))) && ((cactustoparray.indexOf(e)) >= ((cactuspage - 1) * 15))) cactusfinal.push(e)
                                    })
                                    cactustopembed.setDescription(cactusfinal.join("\n"))
                                    cactustopembed.setFooter(`Page ${cactuspage} of ${cactuspageamount} | You, ${message.author.username} are at position #${cactusposition}`)
                                    msg.edit(cactustopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            cactustopcollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'valuetop':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)

                let valueraw = []
                let valuefinal = [];
                let valuetoparray = [];
                let totalvalue = 0;
                let valueposition;
                for (let id in userdata) {
                    totalvalue += userdata[id].value
                    valueraw.push({
                        value: userdata[id].value,
                        id: id
                    });
                }
                valueraw = valueraw.sort((a, b) => parseInt(b.value) - parseInt(a.value))

                for (let i in valueraw) {
                    if ((parseInt(i) + 1) > 3) valuetoparray.push(`**#${parseInt(i) + 1}** <@${valueraw[i].id}> - ${formatter.format(valueraw[i].value)}`)
                    else if ((parseInt(i) + 1) == 1) valuetoparray.push(`**:first_place: -** <@${valueraw[i].id}> - ${formatter.format(valueraw[i].value)}\n`)
                    else if ((parseInt(i) + 1) == 2) valuetoparray.push(`**:second_place: -** <@${valueraw[i].id}> - ${formatter.format(valueraw[i].value)}\n`)
                    else if ((parseInt(i) + 1) == 3) valuetoparray.push(`**:third_place: -** <@${valueraw[i].id}> - ${formatter.format(valueraw[i].value)}\n`)
                    if (valueraw[i].id == message.author.id) valueposition = valuetoparray.length;
                }

                let valuepageamount = Math.ceil(valuetoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let valuepage = parseInt(((args[0]) ? args[0] : "1"));
                if (valuepage > valuepageamount) return warning("This page does not exist.", message);
                valuetoparray.forEach(e => {
                    if (((valuetoparray.indexOf(e) + 1) <= ((valuepage * 15))) && ((valuetoparray.indexOf(e)) >= ((valuepage - 1) * 15))) valuefinal.push(e)

                })

                const valuetopembed = new Discord.MessageEmbed()
                    .setTitle(`${message.guild.name}'s Top Value Added | Total: ${formatter.format(totalvalue)}`)
                    .setDescription(valuefinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${valuepage} of ${valuepageamount} | You, ${message.author.username} are at position #${valueposition}`)

                message.channel.send(valuetopembed).then(msg => {
                    if (valuepageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const valuetopcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            valuetopcollector.on('collect', (reaction, user) => {
                                valuefinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (valuepage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    valuepage = 1
                                    valuetoparray.forEach(e => {
                                        if (((valuetoparray.indexOf(e) + 1) <= ((valuepage * 15))) && ((valuetoparray.indexOf(e)) >= ((valuepage - 1) * 15))) valuefinal.push(e)
                                    })

                                    valuetopembed.setDescription(valuefinal.join("\n"))
                                    valuetopembed.setFooter(`Page ${valuepage} of ${valuepageamount} | You, ${message.author.username} are at position #${valueposition}`)
                                    msg.edit(valuetopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (valuepage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    valuepage--
                                    valuetoparray.forEach(e => {
                                        if (((valuetoparray.indexOf(e) + 1) <= ((valuepage * 15))) && ((valuetoparray.indexOf(e)) >= ((valuepage - 1) * 15))) valuefinal.push(e)
                                    })
                                    valuetopembed.setDescription(valuefinal.join("\n"))
                                    valuetopembed.setFooter(`Page ${valuepage} of ${valuepageamount} | You, ${message.author.username} are at position #${valueposition}`)
                                    msg.edit(valuetopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (valuepage == valuepageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    valuepage++
                                    valuetoparray.forEach(e => {
                                        if (((valuetoparray.indexOf(e) + 1) <= ((valuepage * 15))) && ((valuetoparray.indexOf(e)) >= ((valuepage - 1) * 15))) valuefinal.push(e)
                                    })
                                    valuetopembed.setDescription(valuefinal.join("\n"))
                                    valuetopembed.setFooter(`Page ${valuepage} of ${valuepageamount} | You, ${message.author.username} are at position #${valueposition}`)
                                    msg.edit(valuetopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (valuepage == valuepageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    valuepage = valuepageamount
                                    valuetoparray.forEach(e => {
                                        if (((valuetoparray.indexOf(e) + 1) <= ((valuepage * 15))) && ((valuetoparray.indexOf(e)) >= ((valuepage - 1) * 15))) valuefinal.push(e)
                                    })
                                    valuetopembed.setDescription(valuefinal.join("\n"))
                                    valuetopembed.setFooter(`Page ${valuepage} of ${valuepageamount} | You, ${message.author.username} are at position #${valueposition}`)
                                    msg.edit(valuetopembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            valuetopcollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'toggle':
                if (!hasPerms(message.member, "toggle")) {
                    return warning(`<@${message.author.id}> You are not allowed to use **${hardconfig.prefix}toggle**`, message)
                }
                if (args[0] == 'help') {
                    return usage(`toggle [<ingame/wallchecks/cactuschecks/bufferchecks/value/strikes/ftop/fchat> [on/off]] / show`, "toggle", message)
                }
                if (args[0] == 'wallchecks' || args[0] == 'walls' || args[0] == 'wallreminders' || (!args[0] && message.channel == wallschannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.wallsenabled = toBool(args[1]) : settings.wallsenabled = !settings.wallsenabled;
                    success(`Wallchecks set to \`${settings.wallsenabled}\``, message)
                    times.lastwallcheck = Date.now()
                    times.lastwallreminder = Date.now()
                } else if (args[0] == 'buffer' || args[0] == 'buffers' || args[0] == 'bufferchecks' || (!args[0] && message.channel == bufferchannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.bufferenabled = toBool(args[1]) : settings.bufferenabled = !settings.bufferenabled;
                    success(`Bufferchecks set to \`${settings.bufferenabled}\``, message)
                    times.lastbuffercheck = Date.now()
                    times.lastbufferreminder = Date.now()
                } else if (args[0] == 'cactuschecks' || args[0] == 'cactus' || args[0] == 'cac' || args[0] == 'cactusreminders' || (!args[0] && message.channel == cactuschannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.cactusenabled = toBool(args[1]) : settings.cactusenabled = !settings.cactusenabled;
                    success(`Cactus checks set to \`${settings.cactusenabled}\``, message)
                    times.lastcactuscheck = Date.now()
                    times.lastcactusreminder = Date.now()
                } else if (args[0] == 'value' || args[0] == 'addvalue' || (!args[0] && message.channel == valuechannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.valueenabled = toBool(args[1]) : settings.valueenabled = !settings.valueenabled;
                    success(`Value set to \`${settings.valueenabled}\``, message)
                } else if (args[0] == 'strikes' || args[0] == 'strike' || (!args[0] && message.channel == strikeschannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.strikesenabled = toBool(args[1]) : settings.strikesenabled = !settings.strikesenabled
                    success(`Strikes set to \`${settings.strikesenabled}\``, message)
                } else if (args[0] == 'ftop' || (!args[0] && message.channel == ftopchannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.ftopenabled = toBool(args[1]) : settings.ftopenabled = !settings.ftopenabled
                    times.lastftopcheck = Date.now()
                    success(`Ftop reminders set to \`${settings.ftopenabled}\``, message)
                } else if (args[0] == 'fchat' || args[0] == 'ingamechat' || (!args[0] && message.channel == fchatchannel)) {
                    (typeof toBool(args[1]) !== 'undefined') ? settings.fchatenabled = toBool(args[1]) : settings.fchatenabled = !settings.fchatenabled
                    success(`Ingame f chat set to \`${settings.fchatenabled}\``, message)
                } else if (args[0] == 'ingame' || args[0] == 'ingamebot') {
                    (typeof toBool(args[1]) !== 'undefined') ? hardconfig.ingame = toBool(args[1]) : hardconfig.ingame = !hardconfig.ingame
                    success(`Ingame Bot set to \`${hardconfig.ingame}\` \nRun **${hardconfig.prefix}restart** to restart the bot and allow the bot to log in/out`, message)
                    writeJSON(hardconfig, 'hardconfig');

                } else if (args[0] == 'view' || args[0] == 'show') {
                    const toggleinfo = new Discord.MessageEmbed()
                        .setColor(`LUMINOUS_VIVID_PINK`)
                        .setTitle("Current Settings")
                        .setDescription(`**Wall checks:** ${settings.wallsenabled}
                        **Buffer checks:** ${settings.bufferenabled}
                        **Cactus checks: ** ${settings.cactusenabled}
                        **Add value:** ${settings.valueenabled}
                        **Strikes:** ${settings.strikesenabled}
                        **F-top Updates:** ${settings.ftopenabled}
                        **Log Ingame F-Chat:** ${settings.fchatenabled}
                        **Ingame Bot:** ${hardconfig.ingame}`)
                    return message.channel.send(toggleinfo).catch(console.error)
                } else return usage(`toggle <ingame/wallchecks/cactus/bufferchecks/value/strikes/ftop/fchat> [on/off]`, "toggle", message)
                writeJSON(settings, 'settings')
                break;

            case 'mute':
                if (!hasPerms(message.member, 'mute')) return warning(`${message.author} You are not allowed to use **${hardconfig.prefix}mute**`, message)
                if (!user) return usage("mute <@user> [time]", "mute", message);
                if (preargs.length > 2) preargs.splice(0, 2)
                if (((settings.muted.includes(user.id)) || message.guild.member(user).roles.cache.find(roles => roles.name === 'Muted'))) return warning("This user is already muted", message)
                time = ((!args[1]) ? "" : args[1])
                if (time) {
                    milliseconds = ms(time)
                    if (!milliseconds) return usage("mute <@user> [time]", "mute", message);
                    setTimeout(() => {
                        if (muted) message.guild.member(user).roles.remove(muted.id);
                        settings.muted.splice(settings.muted.indexOf(`${user.id}`), 1);
                        if (user.voice.channel) user.voice.setMute(false).catch(error => warning(`I was not able to voice unmute the user right now`, message))
                        return success(` ${user} has been unmuted`, message)
                    }, milliseconds)
                }
                muted = message.guild.roles.cache.find(role => role.name === "Muted")
                if (muted) message.guild.member(user).roles.add(muted.id).catch(console.error);
                reason = preargs.join(" ")
                settings.muted.push(user.id);
                if (user.voice.channel) user.voice.setMute(false).catch(error => warning(`I was not able to voice unmute the user right now`, message))
                writeJSON(settings, 'settings')
                fs.appendFile(`./logs/punishments.txt`, `**[${new Date().toUTCString()}]** <@${message.author.id}> muted <@${user.id}> for  ${(time) ? time : 'indefinite'}\r\n`, err => {
                    if (err) console.log(err)
                })
                return success(`Muted ${user} ${(time) ? `for ${(time) ? time : 'indefinite'}` : ''}`, message)

            case 'unmute':
                if (!hasPerms(message.member, 'mute')) return warning(`${message.author} You are not allowed to use **${hardconfig.prefix}unmute**`, message)
                if (!user) return usage("unmute <@user>", "unmute", message);
                if (!((settings.muted.includes(user.id)) || message.guild.member(user).roles.cache.find(roles => roles.name === 'Muted'))) return warning("This user is not muted", message)
                if (preargs.length > 1) preargs.splice(0, 2)
                muted = message.guild.roles.cache.find(role => role.name === "Muted")
                if (muted) message.guild.member(user).roles.remove(muted.id).catch(console.error);
                settings.muted.splice(settings.muted.indexOf(`${user.id}`), 1);
                if (user.voice.channel) user.voice.setMute(false).catch(error => warning(`I was not able to voice unmute the user right now`, message))
                writeJSON(settings, 'settings')
                fs.appendFile(`./logs/punishments.txt`, `**[${new Date().toUTCString()}]** <@${message.author.id}> unmuted <@${user.id}>\r\n`, err => {
                    if (err) console.log(err)
                })
                return success(`Unmuted ${user}`, message)

            case 'resetallscores':
                if (!hasPerms(message.member, "resetallscores")) return warning(`${message.author} You do not have permissions to use **${hardconfig.prefix}resetallscores**`, message)
                let code = `${hardconfig.prefix}${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                const resetconfirmembed = new Discord.MessageEmbed()
                    .setTitle("CONFIRM THAT YOU WANT TO RESET ALL SCORES")
                    .setColor("DARK_RED")
                    .setDescription(`You have 30 seconds to send the following code in this channel to confirm that you want to reset all scores currently stored. It is recommended that you only use this command when a new map is beginning. Reply with \`cancel\` to end the timer.\n\`${code}\``)
                    .setFooter(`${message.author.tag}`)

                message.channel.send(resetconfirmembed)
                    .then(m => {
                        message.delete().catch(console.error)
                        m.delete({
                            timeout: 30000
                        }).catch(console.error)
                        const resetcollector = m.channel.createMessageCollector((msg) => msg.author == message.author, {
                            time: 30000
                        });

                        resetcollector.on('collect', msg => {
                            if (msg.content == 'cancel') {
                                success("Timer stopped", msg)
                                return resetcollector.stop("Requested")
                            } else if (msg.content == code) {
                                for (let id in userdata) {
                                    userdata[id].wallchecks = 0;
                                    userdata[id].bufferchecks = 0;
                                    userdata[id].value = 0;
                                    userdata[id].strikes = 0;
                                    userdata[id].code = "";
                                    userdata[id].cactuschecks = 0;
                                }
                                msg.delete()
                                success("Reset all player scores", msg)
                                return resetcollector.stop("Complete")
                            }
                        })
                    }).catch(console.error)
                break;

            case 'wipeuserdata':
                if (!hasPerms(message.member, "resetstats")) return warning(`${message.author} You do not have permissions to use **${hardconfig.prefix}wipeuserdata**`, message)
                resetstatuser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0])) || args[0]
                if ((!resetstatuser) || !args[0]) return usage(`wipeuserdata <@user>`, "wipeuserdata", message)
                if (resetstatuser.id) resetstatuser = resetstatuser.id
                else resetstatuser = args[0]
                if (!userdata[resetstatuser]) return warning("This user does not have any data", message)

                statscode = `${hardconfig.prefix}${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                const wipedataembed = new Discord.MessageEmbed()
                    .setTitle(`Confirm that you want to reset stats`)
                    .setColor("DARK_RED")
                    .setDescription(`You have 30 seconds to send the following code in this channel to confirm that you want to wipe all data currently stored for <@${resetstatuser}>. Reply with \`cancel\` to end the timer.\n\`${statscode}\``)
                    .setFooter(`${message.author.tag}`)

                message.channel.send(wipedataembed)
                    .then(m => {
                        message.delete().catch(console.error)
                        m.delete({
                            timeout: 30000
                        }).catch(console.error)
                        const wipedatacollector = m.channel.createMessageCollector((msg) => msg.author == message.author, {
                            time: 30000
                        });

                        wipedatacollector.on('collect', msg => {
                            if (msg.content == 'cancel') {
                                success("Timer stopped", msg)
                                return wipedatacollector.stop("Requested")
                            } else if (msg.content == statscode) {
                                delete userdata[resetstatuser];
                                msg.delete()
                                success(`Reset stats for <@${resetstatuser}>`, msg)
                                return wipedatacollector.stop("Complete")
                            }
                        })
                    }).catch(console.error)
                break;


            case 'resetstats':
                if (!hasPerms(message.member, "resetstats")) return warning(`${message.author} You do not have permissions to use **${hardconfig.prefix}resetstats**`, message)
                resetstatuser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0])) || args[0]
                if ((!resetstatuser) || !args[0]) return usage(`resetstats <@user>`, "Setstats", message)
                if (resetstatuser.id) resetstatuser = resetstatuser.id
                else resetstatuser = args[0]
                if (!userdata[resetstatuser]) return warning("This user does not have any data", message)

                statscode = `${hardconfig.prefix}${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                const resetstatsembed = new Discord.MessageEmbed()
                    .setTitle(`Confirm that you want to reset stats`)
                    .setColor("DARK_RED")
                    .setDescription(`You have 30 seconds to send the following code in this channel to confirm that you want to reset all scores currently stored for <@${resetstatuser}>. Reply with \`cancel\` to end the timer.\n\`${statscode}\``)
                    .setFooter(`${message.author.tag}`)

                message.channel.send(resetstatsembed)
                    .then(m => {
                        message.delete().catch(console.error)
                        m.delete({
                            timeout: 30000
                        }).catch(console.error)
                        const resetstatscollector = m.channel.createMessageCollector((msg) => msg.author == message.author, {
                            time: 30000
                        });

                        resetstatscollector.on('collect', msg => {
                            if (msg.content == 'cancel') {
                                success("Timer stopped", msg)
                                return resetstatscollector.stop("Requested")
                            } else if (msg.content == statscode) {
                                userdata[resetstatuser].wallchecks = 0;
                                userdata[resetstatuser].bufferchecks = 0;
                                userdata[resetstatuser].value = 0;
                                userdata[resetstatuser].strikes = 0;
                                userdata[resetstatuser].code = "";
                                userdata[resetstatuser].cactuschecks = 0
                                msg.delete()
                                success(`Reset stats for <@${resetstatuser}>`, msg)
                                return resetstatscollector.stop("Complete")
                            }
                        })
                    }).catch(console.error)
                break;

            case 'transferstats':
                if (!hasPerms(message.member, "setstats")) return warning(`${message.author} You do not have permissions to use **${hardconfig.prefix}transferstats**`, message)
                if (!args[0] || !args[1]) return usage(`transferstats <@userto> <@userfrom>`, "Transferstats", message)
                args[1] = args[1].replace(/\D/g, '')
                args[0] = args[0].replace(/\D/g, '')
                transferstatuser = client.users.cache.get(args[1])
                transferstatreceiver = client.users.cache.get(args[0])

                if ((!transferstatuser) || (!transferstatreceiver)) return usage(`transferstats <@userto> <@userfrom>`, "Transferstats", message)
                transferstatreceiver = transferstatreceiver.id
                transferstatuser = transferstatuser.id
                if (!userdata[transferstatuser] || !userdata[transferstatreceiver]) return warning("One of these users has never used the bot.", message)

                transferstatscode = `${hardconfig.prefix}${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                const transferstatsembed = new Discord.MessageEmbed()
                    .setTitle(`Confirm that you want to transfer stats`)
                    .setColor("DARK_RED")
                    .setDescription(`You have 30 seconds to send the following code in this channel to confirm that you want to transfer all stats from <@${transferstatuser}> to <@${transferstatreceiver}>. The stats of <@${transferstatuser}> will be reset. Reply with \`cancel\` to end the timer.\n\`${transferstatscode}\``)
                    .setFooter(`${message.author.tag}`)

                message.channel.send(transferstatsembed)
                    .then(m => {
                        message.delete().catch(console.error)
                        m.delete({
                            timeout: 30000
                        }).catch(console.error)
                        const transferstatscollector = m.channel.createMessageCollector((msg) => msg.author == message.author, {
                            time: 30000
                        });

                        transferstatscollector.on('collect', msg => {
                            if (msg.content == 'cancel') {
                                success("Timer stopped", msg)
                                return transferstatscollector.stop("Requested")
                            } else if (msg.content == transferstatscode) {
                                userdata[transferstatreceiver].wallchecks = userdata[transferstatuser].wallchecks
                                userdata[transferstatreceiver].bufferchecks = userdata[transferstatuser].bufferchecks
                                userdata[transferstatreceiver].value = userdata[transferstatuser].value
                                userdata[transferstatreceiver].strikes = userdata[transferstatuser].strikes
                                userdata[transferstatreceiver].cactuschecks = userdata[transferstatuser].cactuschecks

                                userdata[transferstatuser].wallchecks = 0;
                                userdata[transferstatuser].bufferchecks = 0;
                                userdata[transferstatuser].value = 0;
                                userdata[transferstatuser].strikes = 0;
                                userdata[transferstatuser].cactuschecks = 0;
                                userdata[transferstatuser].code = '';
                                msg.delete()
                                success(`Moved stats from <@${transferstatuser}> to <@${transferstatreceiver}>. <@${transferstatuser}> stats have been reset (Not the linked accounts, that needs to be one manually using ${hardconfig.prefix}unlink).`, msg)
                                return transferstatscollector.stop("Complete")
                            }
                        })
                    }).catch(console.error)
                break;

            case 'adduserstats':
                if (!hasPerms(message.member, "setstats")) return warning(`${message.author} You do not have permissions to use **${hardconfig.prefix}addstats**`, message)
                if (!args[0] || !args[1]) return usage(`adduserstats <@userto> <@userfrom>`, "adduserstats", message)
                args[1] = args[1].replace(/\D/g, '')
                args[0] = args[0].replace(/\D/g, '')
                addstatuser = client.users.cache.get(args[1])
                addstatreceiver = client.users.cache.get(args[0])

                if ((!addstatuser) || (!addstatreceiver)) return usage(`adduserstats <@userto> <@userfrom>`, "adduserstats", message)
                addstatreceiver = addstatreceiver.id
                addstatuser = addstatuser.id
                if (!userdata[addstatuser] || !userdata[addstatreceiver]) return warning("One of these users has never used the bot.", message)

                addstatscode = `${hardconfig.prefix}${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                const addstatsembed = new Discord.MessageEmbed()
                    .setTitle(`Confirm that you want to add stats`)
                    .setColor("DARK_RED")
                    .setDescription(`You have 30 seconds to send the following code in this channel to confirm that you want to add all stats from <@${addstatuser}> to <@${addstatreceiver}>. The stats of <@${addstatuser}> will be reset. Reply with \`cancel\` to end the timer.\n\`${addstatscode}\``)
                    .setFooter(`${message.author.tag}`)

                message.channel.send(addstatsembed)
                    .then(m => {
                        message.delete().catch(console.error)
                        m.delete({
                            timeout: 30000
                        }).catch(console.error)
                        const addstatscollector = m.channel.createMessageCollector((msg) => msg.author == message.author, {
                            time: 30000
                        });

                        addstatscollector.on('collect', msg => {
                            if (msg.content == 'cancel') {
                                success("Timer stopped", msg)
                                return addstatscollector.stop("Requested")
                            } else if (msg.content == addstatscode) {
                                userdata[addstatreceiver].wallchecks += userdata[addstatuser].wallchecks
                                userdata[addstatreceiver].bufferchecks += userdata[addstatuser].bufferchecks
                                userdata[addstatreceiver].value += userdata[addstatuser].value
                                userdata[addstatreceiver].strikes += userdata[addstatuser].strikes
                                userdata[addstatreceiver].cactuschecks += userdata[addstatuser].cactuschecks

                                userdata[addstatuser].wallchecks = 0;
                                userdata[addstatuser].bufferchecks = 0;
                                userdata[addstatuser].value = 0;
                                userdata[addstatuser].strikes = 0;
                                userdata[addstatuser].cactuschecks = 0;
                                userdata[addstatuser].code = '';
                                msg.delete()
                                success(`Moved stats from <@${addstatuser}> to <@${addstatreceiver}>. <@${addstatuser}> stats have been reset..`, msg)
                                return addstatscollector.stop("Complete")
                            }
                        })
                    }).catch(console.error)
                break;

            case 'kick':
                if (!hasPerms(message.member, "kick")) return warning(`You don't have permissions to use **${hardconfig.prefix}kick**`, message)
                if (!user) return usage("kick <user> [reason] ", "Kick", message);
                if (user.roles.highest.position >= message.member.roles.highest.position) return warning("You cannot kick this user", message)
                reason = ((!args.join(" ").slice(22)) ? "none" : args.join(" ").slice(22));
                message.guild.member(user).kick(reason).then(() => {
                    success(`${user} has been kicked.`, message)
                }).catch((error) => {
                    console.log(error);
                    return warning("I do not have proper permissions to kick this user.", message);
                })
                return fs.appendFile(`./logs/punishments.txt`, `**[${new Date().toUTCString()}]** <@${message.author.id}> kicked <@${user.id}> for ${reason}\r\n`, err => {
                    if (err) console.log(err)
                })

            case 'ban':
                if (!hasPerms(message.member, "ban")) return warning(`You don't have permissions to use **${hardconfig.prefix}ban**`, message)
                if (!user) return usage("ban <user> [reason] ", "Ban", message);
                if (user == message.author) return warning("You can't ban yourself", message)
                if (user.roles.highest.position >= message.member.roles.highest.position) return warning("You cannot ban this user", message)
                reason = ((!args.join(" ").slice(22)) ? "none" : args.join(" ").slice(22));
                message.guild.member(user).ban({
                    reason: reason
                }).then(() => {
                    success(`${user} has been banned.`, message)
                }).catch((error) => {
                    console.log(error)
                    return warning("I do not have proper permissions to ban this user.", message);
                })
                message.delete().catch(console.error)
                return fs.appendFile(`./logs/punishments.txt`, `**[${new Date().toUTCString()}]** <@${message.author.id}> banned <@${user.id}> for ${reason}\r\n`, err => {
                    if (err) console.log(err)
                })

            case 'strike':
                if (!hasPerms(message.member, "strike")) return warning(`You are not allowed to strike people`, message)
                if (!settings.strikesenabled) return warning("Strikes are not enabled", message)
                if (!args[1]) return usage(`strike <add/remove> <user> [reason]`, 'strike', message)
                if (!(args[0] == 'add' || args[0] == 'remove')) return usage(`strike <add/remove> <user> [reason]`, 'strike', message)
                striked = message.mentions.users.first() || client.users.cache.get(args[1]);
                if (!striked) return usage(`strike <add/remove> <user> [reason]`, 'strike', message)
                if (!userdata[striked.id]) initID(striked.id)
                if (args[2]) {
                    preargs.splice(0, 2)
                    reason = preargs.join(" ")
                } else reason = "None given"

                strike(striked.id, message.author.id, (args[0] == 'add') ? true : false, reason, userdata[striked.id].names[0], userdata[message.author.id].names[0])
                fs.appendFile(`./logs/punishments.txt`, `**[${new Date().toUTCString()}]** <@${message.author.id}> ${(args[0] == 'add') ? 'added' : 'removed'} a strike for <@${user.id}> for ${reason}\r\n`, err => {
                    if (err) console.log(err)
                })
                return message.delete()

            case 'online':
                if (!hasPerms(message.member, "online")) return warning(`You are not allowed to view online members`, message)
                if (!hardconfig.ingame) return warning("The ingame bot is not enabled", message)
                online = true;
                bot.write('chat', {
                    message: `/f who`
                });
                setTimeout(() => {
                    online = false
                    const onlineEmbed = new Discord.MessageEmbed()
                        .setColor('DARK_PURPLE')
                        .setTimestamp()
                        .setTitle('Online Members')
                        .addField(`Current Online Members: ${number}`, "**```\n" + players + "```**")
                    message.channel.send(onlineEmbed)
                }, 800)
                break;

            case 'settings':
                if (!hasPerms(message.member, 'settings')) return warning("You are not allowed to manage settings", message)
                if (args[0] == 'view' || args[0] == 'show' || args[0] == 'help' || !args[0]) {
                    const settingsembed = new Discord.MessageEmbed() // Define a new embed
                        .setColor('PURPLE') // Set the color
                        .setTitle(`Bot Settings Info`)
                        .addField(`How to change Settings:`, `To change settings, run \n**${hardconfig.prefix}settings** *<settingname> <new value>*`)
                        .addField(`How the settings are displayed:`, '**Readable Name:** value `settingname`\nWhen changing settings, use the `settingname`')
                        .addField('__Channels:__', `
                        **Wallchecks:** ${wallschannel}  \`wallchannel\`
                        **Bufferchecks:** ${bufferchannel} \`bufferchannel\`
                        **Cactuschecks:**  ${cactuschannel} \`cactuschannel\`
                        **Value Added:** ${valuechannel} \`valuechannel\`
                        **F-Top Updates:** ${ftopchannel} \`ftopchannel\` 
                        **Ingame F-Chat:** ${fchatchannel} \`fchatchannel\`
                        **Strikes** ${strikeschannel} \`strikeschannel\``)
                        .addField('__Roles:__', `
                        **Walls:** ${message.guild.roles.cache.find(role => role.name == hardconfig.wallsrole)} \`wallsrole\`
                        **Mods:** ${message.guild.roles.cache.find(role => role.name == hardconfig.modrole)} \`modrole\`
                        **Admins:** ${message.guild.roles.cache.find(role => role.name == hardconfig.adminrole)} \`adminrole\``)
                        .addField('__Times__ (All are in Minutes)', `
                        **First wall reminder after:** ${settings.wallremindertime} \`wallremindertime\`
                        **Subsequent reminders after:** ${settings.wallreminderinterval} \`wallreminderinterval\`
                        **First Cactus Reminder after:** ${settings.cactusremindertime} \`cactusremindertime\`
                        **Subsequent reminders after:** ${settings.cactusreminderinterval} \`cactusreminderinterval\`
                        **First Buffer Reminder after:** ${settings.bufferremindertime} \`bufferremindertime\`
                        **Subsequent reminders after:** ${settings.bufferreminderinterval} \`bufferreminderinterval\`
                        **F-Top Updates after:** ${settings.ftopinterval} \`ftopinterval\`
                        **Time since last check to add score for Wallchecks:** ${settings.minwalltime} \`minwalltime\`
                        **Time since last check to add score for Cactuschecks:** ${settings.mincactustime} \`mincactustime\`
                        **Time since last check to add score for Bufferchecks:** ${settings.minbuffertime} \`minbuffertime\``)
                        .addField(`__Ingame Commands__ /msg ${(bot) ? `${bot.username}` : `BOT`} command`, `
                            \`NOTE: All ingame commands are case in-sensitive. This cannot be changed.\`
                        **Clear walls:** ${hardconfig.clearwallcommand} \`clearwallcommand\`
                        **Weewoo walls:** ${hardconfig.weewoowallcommand} \`weewoowallcommand\`
                        **Clear cactus walls:** ${hardconfig.clearcactuscommand} \`clearcactuscommand\`
                        **Weewoo cactus walls:** ${hardconfig.weewoocactuscommand} \`weewoocactuscommand\`
                        **Clear buffers:** ${hardconfig.clearbuffercommand} \`clearbuffercommand\`
                        **Alert buffers (Note new claims):** ${hardconfig.alertbuffercommand} *<information>* \`alertbuffercommand\`
                        **Weewoo buffers:** ${hardconfig.weewoobuffercommand} \`weewoobuffercommand\`
                        **Add Value:** ${hardconfig.addvaluecommand} *<amount>* \`addvaluecommand\`
                        **Strike a player:** ${hardconfig.strikecommand} *<IGN>* \`strikecommand\``)
                        .addField('__**Miscellaneous**__', `
                        **Verify registering account Ingame:** ${settings.verifyregister} \`verifyregister\`
                        **Prefix:** ${hardconfig.prefix} \`prefix\`
                        **Realm:** ${noun(hardconfig.realm)} \`realm\`
                        **Commands in F Chat:** ${settings.fchatcommands} \`fchatcommands\`
                        **Weewoo in voice channel (very buggy, might break bot, idk):** ${settings.weewooinvoice} \`weewooinvoice\`
                        `)
                        .setFooter(`Current Settings`)

                    message.channel.send(settingsembed).catch(console.error)
                    return message.delete()
                }
                let channels = ['wallchannel', 'bufferchannel', 'cactuschannel', 'valuechannel', 'ftopchannel', 'fchatchannel', 'strikeschannel']
                let roles = ['wallsrole', 'modrole', 'adminrole']
                let timevalues = ['wallremindertime', 'wallreminderinterval', 'cactusremindertime', 'cactusreminderinterval', 'bufferremindertime', 'bufferreminderinterval', 'ftopinterval', 'minwalltime', 'mincactustime', 'minbuffertime']
                let ingamecmds = ['clearwallcommand', 'weewoowallcommand', 'clearcactuscommand', 'weewoocactuscommand', 'clearbuffercommand', 'alertbuffercommand', 'weewoobuffercommand', 'addvaluecommand', 'strikecommand']

                if (!args[1]) return usage(`settings <settingname> <new value>\n**${hardconfig.prefix}settings view** to show all settings`, 'Settings', message)
                if (channels.includes(args[0])) {
                    mentionedchannel = message.mentions.channels.first() || message.guild.channels.cache.find(channel => channel.name == preargs[1])
                    if (!mentionedchannel) return warning("Please tag a valid channel or enter the name of the channel", message);
                    hardconfig[args[0]] = mentionedchannel.name
                    channelcache = client.guilds.cache.get(hardconfig.guild).channels.cache;
                    wallschannel = channelcache.find(channel => channel.name == hardconfig.wallchannel);
                    bufferchannel = channelcache.find(channel => channel.name == hardconfig.bufferchannel);
                    valuechannel = channelcache.find(channel => channel.name == hardconfig.valuechannel);
                    ftopchannel = channelcache.find(channel => channel.name == hardconfig.ftopchannel);
                    fchatchannel = channelcache.find(channel => channel.name == hardconfig.fchatchannel);
                    strikeschannel = channelcache.find(channel => channel.name == hardconfig.strikeschannel);
                    cactuschannel = channelcache.find(channel => channel.name == hardconfig.cactuschannel);
                    writeJSON(hardconfig, 'hardconfig')
                    return success(`${args[0]} set to ${mentionedchannel}`, message)
                } else if (roles.includes(args[0])) {
                    mentionedrole = message.guild.roles.cache.find(r => r.name == preargs[1]) || message.mentions.roles.first()
                    if (!mentionedrole) return warning(`Please tag a valid role or enter the name of one`, message)
                    hardconfig[args[0]] = mentionedrole.name;
                    writeJSON(hardconfig, 'hardconfig')
                    wallsrole = client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.wallsrole)
                    modrole = client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.modrole)
                    adminrole = client.guilds.cache.get(hardconfig.guild).roles.cache.find(role => role.name == hardconfig.adminrole)
                    permissions[wallsrole.id] = wallperms
                    permissions[modrole.id] = advancedperms
                    permissions[adminrole.id] = adminperms
                    return success(`${args[0]} set to ${mentionedrole}`, message)
                } else if (timevalues.includes(args[0])) {
                    if (!isRegExpFormat(args[1], /\d+(.,\d+)?/)) return warning("Please enter a valid number", message)
                    if (parseFloat(args[1]) < 0.5) return warning("Please enter a valid number (more than 0.5)", message)
                    settings[args[0]] = parseFloat(args[1])
                    writeJSON(settings, 'settings')
                    return success(`${args[0]} set to ${args[1]}`, message)
                } else if (ingamecmds.includes(args[0])) {
                    preargs.shift()
                    ingamecmd = preargs.join(" ")
                    hardconfig[args[0]] = ingamecmd.toLowerCase()
                    writeJSON(hardconfig, 'hardconfig')
                    return success(`${args[0]} set to **${ingamecmd}**`, message)
                } else if (args[0] == 'verifyregister') {
                    if (typeof toBool(args[1]) == 'undefined') return warning('Please set it to either true or false', message)
                    settings.verifyregister = toBool(args[1].toLowerCase())
                    writeJSON(settings, 'settings')
                    return success(`Verify registering set to **${settings.verifyregister}**`, message)
                } else if (args[0] == 'fchatcommands') {
                    if (typeof toBool(args[1]) == 'undefined') return warning('Please set it to either true or false', message)
                    settings.fchatcommands = toBool(args[1].toLowerCase())
                    writeJSON(settings, 'settings')
                    return success(`Commands In Faction Chat set to **${settings.fchatcommands}**`, message)
                } else if (args[0] == 'weewooinvoice') {
                    if (typeof toBool(args[1]) == 'undefined') return warning('Please set it to either true or false', message)
                    settings.weewooinvoice = toBool(args[1].toLowerCase())
                    writeJSON(settings, 'settings')
                    return success(`Weewoo In Voice set to **${settings.weewooinvoice}**`, message)
                } else if (args[0] == 'prefix') {
                    hardconfig.prefix = args[1]
                    writeJSON(hardconfig, 'hardconfig')
                    return success(`Prefix changed to **\`hardconfig.prefix\`**`, message)
                } else if (args[0] == 'realm') {
                    newrealm = args[1].toLowerCase()
                    if (realms[newrealm]) {
                        hardconfig.realm = newrealm;
                        writeJSON(hardconfig, 'hardconfig');
                        if (bot) bot.write(`chat`, {
                            message: `${realms[newrealm].joincmd}`
                        })
                        return success(`Realm set to ${noun(newrealm)}.`, message)
                    } else return warning("Please enter a valid Realm: `Creeper, Overlord, Warlock`", message);
                } else return usage(`settings <settingname> <new value>\n**${hardconfig.prefix}settings view** to show all settings`, 'Settings', message)

            case 'unban':
                if (!hasPerms(message.member, "ban")) return warning(`You don't have permissions to use **${hardconfig.prefix}unban**`, message)
                if (!args[0]) return usage("unban <userid> ", "Unban", message);
                if (!isRegExpFormat(args[0], /[0-9]{18}/)) return warning("that is not a valid user id", message)
                message.guild.members.unban(args[0]).catch(() => {
                    return warning("I can't unban this user.", message);
                })

                success(`<@${args[0]}> has been unbanned.`, message)
                message.delete().catch(console.error)
                return fs.appendFile(`./logs/punishments.txt`, `**[${new Date().toUTCString()}]** <@${message.author.id}> unbanned <@${args[0]}>\r\n`, err => {
                    if (err) console.log(err)
                })

            case 'botinfo':
                const botinfoembed = new Discord.MessageEmbed()
                    .setTitle("SaicoPvP Discord Bot")
                    .setThumbnail(`${client.user.displayAvatarURL()}`)
                    .setDescription(`**Developer:** <@319512181597274115>
                    **Support Server:** https://discord.gg/9QH8aUU
                    **Current Version:** \`1.3.2\`
                    **Current User:** ${client.user}`)
                    .setColor("PINK")
                    .setFooter(`${message.author.tag} | Bot Info`, `${message.author.displayAvatarURL()}`)
                message.channel.send(botinfoembed).catch(console.error)
                message.delete().catch(console.error)
                break;

            case 'bancmd':
                if (!hasPerms(message.member, "bancmd")) return warning(`You do not have permissions to use **${hardconfig.prefix}bancmd**`, message)
                if (!args[0]) return usage(`bancmd <command>`, 'bancmd', message)
                if (args[0] == 'bancmd') return warning("You cannot ban this command", message)
                if (settings.bannedcommands.includes(args[0])) {
                    settings.bannedcommands.splice(settings.bannedcommands.indexOf(args[0]), 1);
                    return success(`Removed ${args[0]} from the banned commands list`, message)
                } else if (!settings.bannedcommands.includes(args[0])) {
                    settings.bannedcommands.push(args[0]);
                    return success(`Added ${args[0]} to the banned commands list`, message)
                }
                break;

            case 'lastwall':
                if (!hasPerms(message.member, 'check')) return warning("You are not allowed to view this.", message)
                if (!settings.wallsenabled) return warning("Wall checks are not enabled", message)
                const lastwallembed = new Discord.MessageEmbed()
                    .setColor('DARK_AQUA')
                    .setTitle('Last Wall Check')
                    .addFields({
                        name: `Last Check was`,
                        value: `${sinceCheck(times.lastwallcheck)} ago`,
                        inline: true
                    }, {
                        name: `Checked by:`,
                        value: `${lastwallchecker}`,
                        inline: true
                    }, {
                        name: 'Marked as:',
                        value: `${wallmark}`,
                        inline: true
                    }, {
                        name: "Marked through",
                        value: `${wallmethod}`
                    })

                message.channel.send(lastwallembed).catch(console.error)
                return message.delete().catch(console.error)

            case 'lastbuffer':
                if (!hasPerms(message.member, 'check')) return warning("You are not allowed to view this.", message)
                if (!settings.bufferenabled) return warning(`Buffer checks are not enabled`, message)
                const lastbufferembed = new Discord.MessageEmbed()
                    .setColor('DARK_AQUA')
                    .setTitle('Last Buffer Check')
                    .addFields({
                        name: `Last Check was`,
                        value: `${sinceCheck(times.lastbuffercheck)} ago`,
                        inline: true
                    }, {
                        name: `Checked by:`,
                        value: `${lastbufferchecker}`,
                        inline: true
                    }, {
                        name: 'Marked as:',
                        value: `${buffermark}`,
                        inline: true
                    }, {
                        name: "Checked through",
                        value: `${buffermethod}`
                    })

                message.channel.send(lastbufferembed).catch(console.error)
                return message.delete().catch(console.error)

            case 'lastcactus':
                if (!hasPerms(message.member, 'check')) return warning("You are not allowed to view this.", message)
                if (!settings.cactusenabled) return warning("Cactus checks are not enabled", message)
                const lastcacembed = new Discord.MessageEmbed()
                    .setColor('DARK_AQUA')
                    .setTitle('Last Cactus Wall Check')
                    .addFields({
                        name: `Last Check was`,
                        value: `${sinceCheck(times.lastcactuscheck)} ago`,
                        inline: true
                    }, {
                        name: `Checked by:`,
                        value: `${lastcactuschecker}`,
                        inline: true
                    }, {
                        name: 'Marked as:',
                        value: `${cactusmark}`,
                        inline: true
                    }, {
                        name: "Marked through",
                        value: `${cactusmethod}`
                    })

                message.channel.send(lastcacembed).catch(console.error)
                return message.delete().catch(console.error)

            case 'wronglastchannel':
                return warning("Please enter this command in a valid channel", message)

            case 'viewcactuslogs':
                if (!hasPerms(message.member, "viewlogs")) return warning("You are not allowed to view logs", message)
                fs.readFile("./logs/cactuschecks.txt", "utf8", (err, data) => {
                    if (err) return warning("there was an unexpected error when reading the logs file", message)
                    let cactuslogarray = data.split('\r\n')
                    cactuslogarray.reverse()
                    cactuslogarray.shift()



                    if (cactuslogarray.length == 0) return warning("There are no cactus logs", message)
                    let cactuslogfinal = [];
                    let cactuslogpageamount = Math.ceil(cactuslogarray.length / 15);
                    if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                    let cactuslogpage = parseInt(((args[0]) ? args[0] : "1"));
                    if (cactuslogpage > cactuslogpageamount) return warning("This page does not exist.", message);
                    cactuslogarray.forEach(e => {
                        if (((cactuslogarray.indexOf(e) + 1) <= ((cactuslogpage * 15))) && ((cactuslogarray.indexOf(e)) >= ((cactuslogpage - 1) * 15))) {
                            cactuslogfinal.push(e)
                        }

                    })

                    const cactuslogembed = new Discord.MessageEmbed()
                        .setTitle("Cactus Logs")
                        .setDescription(cactuslogfinal.join("\n"))
                        .setColor('GREY')
                        .setFooter(`Page ${cactuslogpage} of ${cactuslogpageamount}`)

                    message.channel.send(cactuslogembed).then(msg => {
                        if (cactuslogpageamount > 1) {
                            msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                                msg.react('⏩')


                                const cactuslogcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                    time: 120000
                                })

                                cactuslogcollector.on('collect', (reaction, user) => {
                                    cactuslogfinal = []
                                    if (reaction.emoji.name == '⏪') {
                                        if (cactuslogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        cactuslogpage = 1
                                        cactuslogarray.forEach(e => {
                                            if (((cactuslogarray.indexOf(e) + 1) <= ((cactuslogpage * 15))) && ((cactuslogarray.indexOf(e)) >= ((cactuslogpage - 1) * 15))) cactuslogfinal.push(e)
                                        })

                                        cactuslogembed.setDescription(cactuslogfinal.join("\n"))
                                        cactuslogembed.setFooter(`Page ${cactuslogpage} of ${cactuslogpageamount}`)
                                        msg.edit(cactuslogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⬅️') {
                                        if (cactuslogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        cactuslogpage--
                                        cactuslogarray.forEach(e => {
                                            if (((cactuslogarray.indexOf(e) + 1) <= ((cactuslogpage * 15))) && ((cactuslogarray.indexOf(e)) >= ((cactuslogpage - 1) * 15))) cactuslogfinal.push(e)
                                        })
                                        cactuslogembed.setDescription(cactuslogfinal.join("\n"))
                                        cactuslogembed.setFooter(`Page ${cactuslogpage} of ${cactuslogpageamount}`)
                                        msg.edit(cactuslogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⏹️') {
                                        return msg.delete().catch(console.error)
                                    } else if (reaction.emoji.name == '➡️') {
                                        if (cactuslogpage == cactuslogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        cactuslogpage++
                                        cactuslogarray.forEach(e => {
                                            if (((cactuslogarray.indexOf(e) + 1) <= ((cactuslogpage * 15))) && ((cactuslogarray.indexOf(e)) >= ((cactuslogpage - 1) * 15))) cactuslogfinal.push(e)
                                        })
                                        cactuslogembed.setDescription(cactuslogfinal.join("\n"))
                                        cactuslogembed.setFooter(`Page ${cactuslogpage} of ${cactuslogpageamount}`)
                                        msg.edit(cactuslogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                    } else if (reaction.emoji.name == '⏩') {
                                        if (cactuslogpage == cactuslogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        cactuslogpage = cactuslogpageamount
                                        cactuslogarray.forEach(e => {
                                            if (((cactuslogarray.indexOf(e) + 1) <= ((cactuslogpage * 15))) && ((cactuslogarray.indexOf(e)) >= ((cactuslogpage - 1) * 15))) cactuslogfinal.push(e)
                                        })
                                        cactuslogembed.setDescription(cactuslogfinal.join("\n"))
                                        cactuslogembed.setFooter(`Page ${cactuslogpage} of ${cactuslogpageamount}`)
                                        msg.edit(cactuslogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    }
                                })
                                cactuslogcollector.on('end', () => {
                                    setTimeout(() => {
                                        if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                        if (!message.deleted) message.delete().catch(console.error)
                                    }, 1500)
                                })
                            })
                        } else return;
                    })
                })
                break;

            case 'viewwalllogs':
                if (!hasPerms(message.member, "viewlogs")) return warning("You are not allowed to view logs", message)
                fs.readFile("./logs/wallchecks.txt", "utf8", (err, data) => {
                    if (err) return warning("there was an unexpected error when reading the logs file", message)


                    let walllogarray = data.split('\r\n')
                    walllogarray.reverse()
                    walllogarray.shift()



                    if (walllogarray.length == 0) return warning("There are no wall logs", message)
                    let walllogfinal = [];
                    let walllogpageamount = Math.ceil(walllogarray.length / 15);
                    if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                    let walllogpage = parseInt(((args[0]) ? args[0] : "1"));
                    if (walllogpage > walllogpageamount) return warning("This page does not exist.", message);
                    walllogarray.forEach(e => {
                        if (((walllogarray.indexOf(e) + 1) <= ((walllogpage * 15))) && ((walllogarray.indexOf(e)) >= ((walllogpage - 1) * 15))) {
                            walllogfinal.push(e)
                        }

                    })

                    const walllogembed = new Discord.MessageEmbed()
                        .setTitle("Wall Logs")
                        .setDescription(walllogfinal.join("\n"))
                        .setColor('GREY')
                        .setFooter(`Page ${walllogpage} of ${walllogpageamount}`)

                    message.channel.send(walllogembed).then(msg => {
                        if (walllogpageamount > 1) {
                            msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                                msg.react('⏩')


                                const walllogcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                    time: 120000
                                })

                                walllogcollector.on('collect', (reaction, user) => {
                                    walllogfinal = []
                                    if (reaction.emoji.name == '⏪') {
                                        if (walllogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        walllogpage = 1
                                        walllogarray.forEach(e => {
                                            if (((walllogarray.indexOf(e) + 1) <= ((walllogpage * 15))) && ((walllogarray.indexOf(e)) >= ((walllogpage - 1) * 15))) walllogfinal.push(e)
                                        })

                                        walllogembed.setDescription(walllogfinal.join("\n"))
                                        walllogembed.setFooter(`Page ${walllogpage} of ${walllogpageamount}`)
                                        msg.edit(walllogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⬅️') {
                                        if (walllogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        walllogpage--
                                        walllogarray.forEach(e => {
                                            if (((walllogarray.indexOf(e) + 1) <= ((walllogpage * 15))) && ((walllogarray.indexOf(e)) >= ((walllogpage - 1) * 15))) walllogfinal.push(e)
                                        })
                                        walllogembed.setDescription(walllogfinal.join("\n"))
                                        walllogembed.setFooter(`Page ${walllogpage} of ${walllogpageamount}`)
                                        msg.edit(walllogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⏹️') {
                                        return msg.delete().catch(console.error)
                                    } else if (reaction.emoji.name == '➡️') {
                                        if (walllogpage == walllogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        walllogpage++
                                        walllogarray.forEach(e => {
                                            if (((walllogarray.indexOf(e) + 1) <= ((walllogpage * 15))) && ((walllogarray.indexOf(e)) >= ((walllogpage - 1) * 15))) walllogfinal.push(e)
                                        })
                                        walllogembed.setDescription(walllogfinal.join("\n"))
                                        walllogembed.setFooter(`Page ${walllogpage} of ${walllogpageamount}`)
                                        msg.edit(walllogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                    } else if (reaction.emoji.name == '⏩') {
                                        if (walllogpage == walllogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        walllogpage = walllogpageamount
                                        walllogarray.forEach(e => {
                                            if (((walllogarray.indexOf(e) + 1) <= ((walllogpage * 15))) && ((walllogarray.indexOf(e)) >= ((walllogpage - 1) * 15))) walllogfinal.push(e)
                                        })
                                        walllogembed.setDescription(walllogfinal.join("\n"))
                                        walllogembed.setFooter(`Page ${walllogpage} of ${walllogpageamount}`)
                                        msg.edit(walllogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    }
                                })
                                walllogcollector.on('end', () => {
                                    setTimeout(() => {
                                        if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                        if (!message.deleted) message.delete().catch(console.error)
                                    }, 1500)
                                })
                            })
                        } else return;
                    })
                })
                break;

            case 'viewbufferlogs':
                if (!hasPerms(message.member, "viewlogs")) return warning("You are not allowed to view logs", message)
                fs.readFile("./logs/bufferchecks.txt", "utf8", (err, data) => {
                    if (err) return warning("there was an unexpected error when reading the logs file", message)
                    let bufferlogarray = data.split('\r\n')
                    bufferlogarray.reverse()
                    bufferlogarray.shift()



                    if (bufferlogarray.length == 0) return warning("There are no buffer logs", message)
                    let bufferlogfinal = [];
                    let bufferlogpageamount = Math.ceil(bufferlogarray.length / 15);
                    if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                    let bufferlogpage = parseInt(((args[0]) ? args[0] : "1"));
                    if (bufferlogpage > bufferlogpageamount) return warning("This page does not exist.", message);
                    bufferlogarray.forEach(e => {
                        if (((bufferlogarray.indexOf(e) + 1) <= ((bufferlogpage * 15))) && ((bufferlogarray.indexOf(e)) >= ((bufferlogpage - 1) * 15))) {
                            bufferlogfinal.push(e)
                        }

                    })

                    const bufferlogembed = new Discord.MessageEmbed()
                        .setTitle("Buffer Logs")
                        .setDescription(bufferlogfinal.join("\n"))
                        .setColor('GREY')
                        .setFooter(`Page ${bufferlogpage} of ${bufferlogpageamount}`)

                    message.channel.send(bufferlogembed).then(msg => {
                        if (bufferlogpageamount > 1) {
                            msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                                msg.react('⏩')


                                const bufferlogcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                    time: 120000
                                })

                                bufferlogcollector.on('collect', (reaction, user) => {
                                    bufferlogfinal = []
                                    if (reaction.emoji.name == '⏪') {
                                        if (bufferlogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        bufferlogpage = 1
                                        bufferlogarray.forEach(e => {
                                            if (((bufferlogarray.indexOf(e) + 1) <= ((bufferlogpage * 15))) && ((bufferlogarray.indexOf(e)) >= ((bufferlogpage - 1) * 15))) bufferlogfinal.push(e)
                                        })

                                        bufferlogembed.setDescription(bufferlogfinal.join("\n"))
                                        bufferlogembed.setFooter(`Page ${bufferlogpage} of ${bufferlogpageamount}`)
                                        msg.edit(bufferlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⬅️') {
                                        if (bufferlogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        bufferlogpage--
                                        bufferlogarray.forEach(e => {
                                            if (((bufferlogarray.indexOf(e) + 1) <= ((bufferlogpage * 15))) && ((bufferlogarray.indexOf(e)) >= ((bufferlogpage - 1) * 15))) bufferlogfinal.push(e)
                                        })
                                        bufferlogembed.setDescription(bufferlogfinal.join("\n"))
                                        bufferlogembed.setFooter(`Page ${bufferlogpage} of ${bufferlogpageamount}`)
                                        msg.edit(bufferlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⏹️') {
                                        return msg.delete().catch(console.error)
                                    } else if (reaction.emoji.name == '➡️') {
                                        if (bufferlogpage == bufferlogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        bufferlogpage++
                                        bufferlogarray.forEach(e => {
                                            if (((bufferlogarray.indexOf(e) + 1) <= ((bufferlogpage * 15))) && ((bufferlogarray.indexOf(e)) >= ((bufferlogpage - 1) * 15))) bufferlogfinal.push(e)
                                        })
                                        bufferlogembed.setDescription(bufferlogfinal.join("\n"))
                                        bufferlogembed.setFooter(`Page ${bufferlogpage} of ${bufferlogpageamount}`)
                                        msg.edit(bufferlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                    } else if (reaction.emoji.name == '⏩') {
                                        if (bufferlogpage == bufferlogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        bufferlogpage = bufferlogpageamount
                                        bufferlogarray.forEach(e => {
                                            if (((bufferlogarray.indexOf(e) + 1) <= ((bufferlogpage * 15))) && ((bufferlogarray.indexOf(e)) >= ((bufferlogpage - 1) * 15))) bufferlogfinal.push(e)
                                        })
                                        bufferlogembed.setDescription(bufferlogfinal.join("\n"))
                                        bufferlogembed.setFooter(`Page ${bufferlogpage} of ${bufferlogpageamount}`)
                                        msg.edit(bufferlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    }
                                })
                                bufferlogcollector.on('end', () => {
                                    setTimeout(() => {
                                        if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                        if (!message.deleted) message.delete().catch(console.error)
                                    }, 1500)
                                })
                            })
                        } else return;
                    })
                })
                break;

            case 'viewvaluelogs':
                if (!hasPerms(message.member, "viewlogs")) return warning("You are not allowed to view logs", message)
                fs.readFile("./logs/valuelogs.txt", "utf8", (err, data) => {
                    if (err) return warning("there was an unexpected error when reading the logs file", message)
                    let valuelogarray = data.split('\r\n')
                    valuelogarray.reverse()
                    valuelogarray.shift()



                    if (valuelogarray.length == 0) return warning("There are no value logs", message)
                    let valuelogfinal = [];
                    let valuelogpageamount = Math.ceil(valuelogarray.length / 15);
                    if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                    let valuelogpage = parseInt(((args[0]) ? args[0] : "1"));
                    if (valuelogpage > valuelogpageamount) return warning("This page does not exist.", message);
                    valuelogarray.forEach(e => {
                        if (((valuelogarray.indexOf(e) + 1) <= ((valuelogpage * 15))) && ((valuelogarray.indexOf(e)) >= ((valuelogpage - 1) * 15))) {
                            valuelogfinal.push(e)
                        }

                    })

                    const valuelogembed = new Discord.MessageEmbed()
                        .setTitle("Value Logs")
                        .setDescription(valuelogfinal.join("\n"))
                        .setColor('GREY')
                        .setFooter(`Page ${valuelogpage} of ${valuelogpageamount}`)

                    message.channel.send(valuelogembed).then(msg => {
                        if (valuelogpageamount > 1) {
                            msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                                msg.react('⏩')


                                const valuelogcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                    time: 120000
                                })

                                valuelogcollector.on('collect', (reaction, user) => {
                                    valuelogfinal = []
                                    if (reaction.emoji.name == '⏪') {
                                        if (valuelogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        valuelogpage = 1
                                        valuelogarray.forEach(e => {
                                            if (((valuelogarray.indexOf(e) + 1) <= ((valuelogpage * 15))) && ((valuelogarray.indexOf(e)) >= ((valuelogpage - 1) * 15))) valuelogfinal.push(e)
                                        })

                                        valuelogembed.setDescription(valuelogfinal.join("\n"))
                                        valuelogembed.setFooter(`Page ${valuelogpage} of ${valuelogpageamount}`)
                                        msg.edit(valuelogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⬅️') {
                                        if (valuelogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        valuelogpage--
                                        valuelogarray.forEach(e => {
                                            if (((valuelogarray.indexOf(e) + 1) <= ((valuelogpage * 15))) && ((valuelogarray.indexOf(e)) >= ((valuelogpage - 1) * 15))) valuelogfinal.push(e)
                                        })
                                        valuelogembed.setDescription(valuelogfinal.join("\n"))
                                        valuelogembed.setFooter(`Page ${valuelogpage} of ${valuelogpageamount}`)
                                        msg.edit(valuelogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⏹️') {
                                        return msg.delete().catch(console.error)
                                    } else if (reaction.emoji.name == '➡️') {
                                        if (valuelogpage == valuelogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        valuelogpage++
                                        valuelogarray.forEach(e => {
                                            if (((valuelogarray.indexOf(e) + 1) <= ((valuelogpage * 15))) && ((valuelogarray.indexOf(e)) >= ((valuelogpage - 1) * 15))) valuelogfinal.push(e)
                                        })
                                        valuelogembed.setDescription(valuelogfinal.join("\n"))
                                        valuelogembed.setFooter(`Page ${valuelogpage} of ${valuelogpageamount}`)
                                        msg.edit(valuelogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                    } else if (reaction.emoji.name == '⏩') {
                                        if (valuelogpage == valuelogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        valuelogpage = valuelogpageamount
                                        valuelogarray.forEach(e => {
                                            if (((valuelogarray.indexOf(e) + 1) <= ((valuelogpage * 15))) && ((valuelogarray.indexOf(e)) >= ((valuelogpage - 1) * 15))) valuelogfinal.push(e)
                                        })
                                        valuelogembed.setDescription(valuelogfinal.join("\n"))
                                        valuelogembed.setFooter(`Page ${valuelogpage} of ${valuelogpageamount}`)
                                        msg.edit(valuelogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    }
                                })
                                valuelogcollector.on('end', () => {
                                    setTimeout(() => {
                                        if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                        if (!message.deleted) message.delete().catch(console.error)
                                    }, 1500)
                                })
                            })
                        } else return;
                    })
                })
                break;

            case 'viewpunishmentlogs':
                if (!hasPerms(message.member, "viewlogs")) return warning("You are not allowed to view logs", message)
                fs.readFile("./logs/punishments.txt", "utf8", (err, data) => {
                    if (err) return warning("there was an unexpected error when reading the logs file", message)
                    let punishmentlogarray = data.split('\r\n')
                    punishmentlogarray.reverse()
                    punishmentlogarray.shift()



                    if (punishmentlogarray.length == 0) return warning("There are no punishment logs", message)
                    let punishmentlogfinal = [];
                    let punishmentlogpageamount = Math.ceil(punishmentlogarray.length / 10);
                    if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                    let punishmentlogpage = parseInt(((args[0]) ? args[0] : "1"));
                    if (punishmentlogpage > punishmentlogpageamount) return warning("This page does not exist.", message);
                    punishmentlogarray.forEach(e => {
                        if (((punishmentlogarray.indexOf(e) + 1) <= ((punishmentlogpage * 10))) && ((punishmentlogarray.indexOf(e)) >= ((punishmentlogpage - 1) * 10))) {
                            punishmentlogfinal.push(e)
                        }

                    })

                    const punishmentlogembed = new Discord.MessageEmbed()
                        .setTitle("Punishment Logs")
                        .setDescription(punishmentlogfinal.join("\n"))
                        .setColor('GREY')
                        .setFooter(`Page ${punishmentlogpage} of ${punishmentlogpageamount}`)

                    message.channel.send(punishmentlogembed).then(msg => {
                        if (punishmentlogpageamount > 1) {
                            msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                                msg.react('⏩')


                                const punishmentlogcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                    time: 120000
                                })

                                punishmentlogcollector.on('collect', (reaction, user) => {
                                    punishmentlogfinal = []
                                    if (reaction.emoji.name == '⏪') {
                                        if (punishmentlogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        punishmentlogpage = 1
                                        punishmentlogarray.forEach(e => {
                                            if (((punishmentlogarray.indexOf(e) + 1) <= ((punishmentlogpage * 10))) && ((punishmentlogarray.indexOf(e)) >= ((punishmentlogpage - 1) * 10))) punishmentlogfinal.push(e)
                                        })

                                        punishmentlogembed.setDescription(punishmentlogfinal.join("\n"))
                                        punishmentlogembed.setFooter(`Page ${punishmentlogpage} of ${punishmentlogpageamount}`)
                                        msg.edit(punishmentlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⬅️') {
                                        if (punishmentlogpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                        punishmentlogpage--
                                        punishmentlogarray.forEach(e => {
                                            if (((punishmentlogarray.indexOf(e) + 1) <= ((punishmentlogpage * 10))) && ((punishmentlogarray.indexOf(e)) >= ((punishmentlogpage - 1) * 10))) punishmentlogfinal.push(e)
                                        })
                                        punishmentlogembed.setDescription(punishmentlogfinal.join("\n"))
                                        punishmentlogembed.setFooter(`Page ${punishmentlogpage} of ${punishmentlogpageamount}`)
                                        msg.edit(punishmentlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    } else if (reaction.emoji.name == '⏹️') {
                                        return msg.delete().catch(console.error)
                                    } else if (reaction.emoji.name == '➡️') {
                                        if (punishmentlogpage == punishmentlogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        punishmentlogpage++
                                        punishmentlogarray.forEach(e => {
                                            if (((punishmentlogarray.indexOf(e) + 1) <= ((punishmentlogpage * 10))) && ((punishmentlogarray.indexOf(e)) >= ((punishmentlogpage - 1) * 10))) punishmentlogfinal.push(e)
                                        })
                                        punishmentlogembed.setDescription(punishmentlogfinal.join("\n"))
                                        punishmentlogembed.setFooter(`Page ${punishmentlogpage} of ${punishmentlogpageamount}`)
                                        msg.edit(punishmentlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                    } else if (reaction.emoji.name == '⏩') {
                                        if (punishmentlogpage == punishmentlogpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                        punishmentlogpage = punishmentlogpageamount
                                        punishmentlogarray.forEach(e => {
                                            if (((punishmentlogarray.indexOf(e) + 1) <= ((punishmentlogpage * 10))) && ((punishmentlogarray.indexOf(e)) >= ((punishmentlogpage - 1) * 10))) punishmentlogfinal.push(e)
                                        })
                                        punishmentlogembed.setDescription(punishmentlogfinal.join("\n"))
                                        punishmentlogembed.setFooter(`Page ${punishmentlogpage} of ${punishmentlogpageamount}`)
                                        msg.edit(punishmentlogembed)
                                        return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    }
                                })
                                punishmentlogcollector.on('end', () => {
                                    setTimeout(() => {
                                        if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                        if (!message.deleted) message.delete().catch(console.error)
                                    }, 1500)
                                })
                            })
                        } else return;
                    })
                })
                break;

            case 'wronglogchannel':
                return warning("Please use this command in an appropriate channel", message);

            case 'permissions':
                if (!hasSpecialPerms(message.member, "managepermissions")) return warning(`${message.member} You are not allowed to manage permissions.`, message)
                mentioned = message.mentions.roles.first() || message.mentions.users.first()
                if (!mentioned) return usage("permissions <@user / @role> <show/initialise>/[<permname> <new value>]/delete", "Permissions", message)
                permissionsid = mentioned.id
                let listofperms = ["ftop", "addvalue", "announce", "sudo", "runcmd", "ban", "kick", "strike", "restart", "viewlogs", "settings", "online", "mute", "linkaccount", "force_unlink_account", "check", "grace", "purgemessages", "dmrole", "lock", "blacklist", "setstats", "toggle", "resetallscores", "resetstats", "bancmd", "managepermissions"]
                if (!args[1]) return usage("permissions <@user / @role> <show/initialise>/[<permname> <new value>]/delete", "Permissions", message)
                if (!permissions[permissionsid] && !(args[1] == 'initialise' || args[1] == 'init')) return warning(`This role/user does not have any permissions. Initialise it with **${hardconfig.prefix}permissions** *<@role/@user> initialise <walls/mod/admin>*`, message)
                else if ((!permissions[permissionsid]) && (args[1] == 'init' || args[1] == 'initialise')) {
                    if (permissions[permissionsid]) return warning("This role/user has already been initialised. View its permissions using *show* instead of *initialise*", message)
                    if (message.guild.members.cache.has(permissionsid)) {
                        permissions[permissionsid] = {}
                        writeJSON(permissions, 'permissions');
                        return success(`Permissions for ${mentioned} have been successfully initialised. You can now view and edit them with **${hardconfig.prefix}permissions ${mentioned} show**`, message)
                    }
                    if (!args[2]) return usage("permissions <@user / @role> initialise [basic/mod/admin (only for role)]", "Permissions", message)
                    else if (args[2] == 'basic') permissions[permissionsid] = wallperms;
                    else if (args[2].startsWith('mod')) permissions[permissionsid] = advancedperms;
                    else if (args[2] == 'admin') permissions[permissionsid] = adminperms;
                    else return usage("permissions <@user / @role> initialise <basic/mod/admin>", "Permissions", message)
                    writeJSON(permissions, 'permissions');
                    return success(`Permissions for ${mentioned} have been successfully initialised. View them with **${hardconfig.prefix}permissions ${mentioned} show**`, message)
                } else if (args[1] == 'show' || args[1] == 'view') {
                    const viewperms = new Discord.MessageEmbed()
                        .setTitle("Permissions")
                        .setColor('BLACK')
                        .setDescription(`Current permissions for ${mentioned}`)
                        .addField(`How to change Permissions:`, `To change a permission, run \n**${hardconfig.prefix}permissions** *<@role / @user> <permname> <true/false>*`)
                        .addField(`How the permissions are displayed:`, '**Command:** value `permname`\nWhen changing permissions, use the `permname`')
                        .addField(`\u200b`, `
                            **Mark checks:** ${('check' in permissions[permissionsid]) ? `${permissions[permissionsid].check}` : `*Highest role applies*`} \`check\`
                            **Add value:** ${('addvalue' in permissions[permissionsid]) ? `${permissions[permissionsid].addvalue}` : `*Highest role applies*`} \`addvalue\`
                            **Announce:** ${('announce' in permissions[permissionsid]) ? `${permissions[permissionsid].announce}` : `*Highest role applies*`} \`announce\`
                            **Sudo:** ${('sudo' in permissions[permissionsid]) ? `${permissions[permissionsid].sudo}` : `*Highest role applies*`} \`sudo\`
                            **Run Command:** ${('runcmd' in permissions[permissionsid]) ? `${permissions[permissionsid].runcmd}` : `*Highest role applies*`} \`runcmd\`
                            **Force FTop Update:** ${('ftop' in permissions[permissionsid]) ? `${permissions[permissionsid].ftop}` : `*Highest role applies*`} \`ftop\`
                            **View online players:** ${('online' in permissions[permissionsid]) ? `${permissions[permissionsid].online}` : `*Highest role applies*`} \`online\`
                            **View logs:** ${('viewlogs' in permissions[permissionsid]) ? `${permissions[permissionsid].viewlogs}` : `*Highest role applies*`} \`viewlogs\`
                            **Set grace:** ${('grace' in permissions[permissionsid]) ? `${permissions[permissionsid].grace}` : `*Highest role applies*`} \`grace\`
                            **Unlink other's linked accounts:** ${('force_unlink_account' in permissions[permissionsid]) ? `${permissions[permissionsid].force_unlink_account}` : `*Highest role applies*`} \`force_unlink_account\``)
                        .addField('\u200b', `
                            **Set others stats:** ${('setstats' in permissions[permissionsid]) ? `${permissions[permissionsid].setstats}` : `*Highest role applies*`} \`setstats\`
                            **Toggle features:** ${('toggle' in permissions[permissionsid]) ? `${permissions[permissionsid].toggle}` : `*Highest role applies*`} \`toggle\`
                            **Reset a users stats:** ${('resetstats' in permissions[permissionsid]) ? `${permissions[permissionsid].resetstats}` : `*Highest role applies*`} \`resetstats\`
                            **Reset All Scores:** ${('resetallscores' in permissions[permissionsid]) ? `${permissions[permissionsid].resetallscores}` : `*Highest role applies*`} \`resetallscores\`
                            **Change settings:** ${('settings' in permissions[permissionsid]) ? `${permissions[permissionsid].settings}` : `*Highest role applies*`} \`settings\`
                            **Manage permissions:** ${('managepermissions' in permissions[permissionsid]) ? `${permissions[permissionsid].managepermissions}` : `*Highest role applies*`} \`managepermissions\`
                            **Restart bot:** ${('restart' in permissions[permissionsid]) ? `${permissions[permissionsid].restart}` : `*Highest role applies*`} \`restart\``)
                        .addField(`\u200b`, `
                            **Ban users:** ${('ban' in permissions[permissionsid]) ? `${permissions[permissionsid].ban}` : `*Highest role applies*`} \`ban\`
                            **Kick users:** ${('kick' in permissions[permissionsid]) ? `${permissions[permissionsid].kick}` : `*Highest role applies*`} \`kick\`
                            **Mute users:** ${('mute' in permissions[permissionsid]) ? `${permissions[permissionsid].mute}` : `*Highest role applies*`} \`mute\`
                            **Strike players:** ${('strike' in permissions[permissionsid]) ? `${permissions[permissionsid].strike}` : `*Highest role applies*`} \`strike\`
                            **Purge messages:** ${('purgemessages' in permissions[permissionsid]) ? `${permissions[permissionsid].purgemessages}` : `*Highest role applies*`} \`purgemessages\`
                            **Dm Role:** ${('dmrole' in permissions[permissionsid]) ? `${permissions[permissionsid].dmrole}` : `*Highest role applies*`} \`dmrole\`
                            **Lock Channel:** ${('lock' in permissions[permissionsid]) ? `${permissions[permissionsid].lock}` : `*Highest role applies*`} \`lock\`
                            **Blacklist user/channel from commands:** ${('blacklist' in permissions[permissionsid]) ? `${permissions[permissionsid].blacklist}` : `*Highest role applies*`} \`blacklist\`
                            **Ban a command:** ${('bancmd' in permissions[permissionsid]) ? `${permissions[permissionsid].bancmd}` : `*Highest role applies*`} \`bancmd\``)
                        .setFooter(`Requested by ${message.author.tag}`, `${message.author.displayAvatarURL()}`)

                    return message.channel.send(viewperms).catch(console.error)



                } else if (args[1] == 'delete' || args[1] == 'del') {
                    statscode = `${hardconfig.prefix}${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
                    const deletepermsembed = new Discord.MessageEmbed()
                        .setTitle(`Confirm that you want to delete permissions`)
                        .setColor("DARK_RED")
                        .setDescription(`You have 30 seconds to send the following code in this channel to confirm that you want to delete all permissions currently stored for ${mentioned}. This is irreversible. Reply with \`cancel\` to end the timer.\n\`${statscode}\``)
                        .setFooter(`${message.author.tag}`)

                    message.channel.send(deletepermsembed)
                        .then(m => {
                            message.delete().catch(console.error)
                            m.delete({
                                timeout: 30000
                            }).catch(console.error)
                            const delpermcollector = m.channel.createMessageCollector((msg) => msg.author == message.author, {
                                time: 30000
                            });

                            delpermcollector.on('collect', msg => {
                                if (msg.content == 'cancel') {
                                    success("Timer stopped", msg)
                                    return delpermcollector.stop("Requested")
                                } else if (msg.content == statscode) {
                                    delete permissions[permissionsid]
                                    msg.delete()
                                    writeJSON(permissions, 'permissions')
                                    success(`Deleted permissions for ${mentioned}`, msg)
                                    return delpermcollector.stop("Complete")
                                }
                            })
                        }).catch(console.error)
                    break;
                } else if (listofperms.includes(args[1])) {
                    (typeof toBool(args[2]) !== 'undefined') ? permissions[permissionsid][args[1]] = toBool(args[2]) : permissions[permissionsid][args[1]] = !permissions[permissionsid][args[1]]
                    writeJSON(permissions, 'permissions');
                    return success(`${args[1]} changed to ${permissions[permissionsid][args[1]]} for ${mentioned}`, message)

                } else return usage("permissions <@user / @role> <show/initialise>/[<permname> <new value>]/delete", "Permissions", message)

            case 'viewallaccounts':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)

                let accountraw = []
                let accountfinal = [];
                let accounttoparray = [];
                for (let id in userdata) {
                    if (userdata[id].names !== []) {
                        for (e in userdata[id].names) {
                            accountraw.push({
                                accounts: userdata[id].names[e],
                                id: id
                            });
                        }
                    }
                }
                if (accountraw == []) {
                    return warning("No users have any linked accounts", message)
                }
                for (let i in accountraw) {
                    accounttoparray.push(`<@${accountraw[i].id}> - **${accountraw[i].accounts}**`)
                }

                let accountpageamount = Math.ceil(accounttoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let accountpage = parseInt(((args[0]) ? args[0] : "1"));
                if (accountpage > accountpageamount) return warning("This page does not exist.", message);
                accounttoparray.forEach(e => {
                    if (((accounttoparray.indexOf(e) + 1) <= ((accountpage * 15))) && ((accounttoparray.indexOf(e)) >= ((accountpage - 1) * 15))) accountfinal.push(e)

                })

                const accountlinkembed = new Discord.MessageEmbed()
                    .setTitle("Linked Accounts")
                    .setDescription(accountfinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${accountpage} of ${accountpageamount}`)

                message.channel.send(accountlinkembed).then(msg => {
                    if (accountpageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const accountcollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            accountcollector.on('collect', (reaction, user) => {
                                accountfinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (accountpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    accountpage = 1
                                    accounttoparray.forEach(e => {
                                        if (((accounttoparray.indexOf(e) + 1) <= ((accountpage * 15))) && ((accounttoparray.indexOf(e)) >= ((accountpage - 1) * 15))) accountfinal.push(e)
                                    })

                                    accountlinkembed.setDescription(accountfinal.join("\n"))
                                    accountlinkembed.setFooter(`Page ${accountpage} of ${accountpageamount}`)
                                    msg.edit(accountlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (accountpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    accountpage--
                                    accounttoparray.forEach(e => {
                                        if (((accounttoparray.indexOf(e) + 1) <= ((accountpage * 15))) && ((accounttoparray.indexOf(e)) >= ((accountpage - 1) * 15))) accountfinal.push(e)
                                    })
                                    accountlinkembed.setDescription(accountfinal.join("\n"))
                                    accountlinkembed.setFooter(`Page ${accountpage} of ${accountpageamount}`)
                                    msg.edit(accountlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (accountpage == accountpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    accountpage++
                                    accounttoparray.forEach(e => {
                                        if (((accounttoparray.indexOf(e) + 1) <= ((accountpage * 15))) && ((accounttoparray.indexOf(e)) >= ((accountpage - 1) * 15))) accountfinal.push(e)
                                    })
                                    accountlinkembed.setDescription(accountfinal.join("\n"))
                                    accountlinkembed.setFooter(`Page ${accountpage} of ${accountpageamount}`)
                                    msg.edit(accountlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (accountpage == accountpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    accountpage = accountpageamount
                                    accounttoparray.forEach(e => {
                                        if (((accounttoparray.indexOf(e) + 1) <= ((accountpage * 15))) && ((accounttoparray.indexOf(e)) >= ((accountpage - 1) * 15))) accountfinal.push(e)
                                    })
                                    accountlinkembed.setDescription(accountfinal.join("\n"))
                                    accountlinkembed.setFooter(`Page ${accountpage} of ${accountpageamount}`)
                                    msg.edit(accountlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            accountcollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'pmremind':
                if (!hasPerms(message.member, "check")) return warning("You aren't allowed to use this feature", message);
                mentioned = message.mentions.members.first()
                if (mentioned && (typeof toBool(args[1]) !== 'undefined')) {
                    if (!hasPerms(message.member, "setstats")) return warning("You don't have the `setstats` permission required for this.", message)
                    userdata[mentioned.id].pmremind = toBool(args[1])
                    return success(`DM reminders for ${mentioned} set to ${userdata[mentioned.id].pmremind}`, message)
                } else if (typeof toBool(args[0]) !== 'undefined') userdata[message.author.id].pmremind = toBool(args[0])
                else if ("pmremind" in userdata[message.author.id]) userdata[message.author.id].pmremind = !userdata[message.author.id].pmremind
                else return usage("pmremind <on/off> / [<@user> <on/off>]", `pmremind`, message)
                return success(`Dm Reminders set to ${userdata[message.author.id].pmremind}`, message)

            case 'viewdmreminds':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)

                let dmreminderraw = [];
                let dmreminderfinal = [];
                let dmremindertoparray = [];
                for (let id in userdata) {
                    if (userdata[id].pmremind) {
                        dmreminderraw.push(id);
                    }
                }
                if (dmreminderraw.length == 0) return warning("No users have any DM reminders", message)
                for (let i in dmreminderraw) {
                    dmremindertoparray.push(`<@${dmreminderraw[i]}>`)
                }

                let dmreminderpageamount = Math.ceil(dmremindertoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let dmreminderpage = parseInt(((args[0]) ? args[0] : "1"));
                if (dmreminderpage > dmreminderpageamount) return warning("This page does not exist.", message);
                dmremindertoparray.forEach(e => {
                    if (((dmremindertoparray.indexOf(e) + 1) <= ((dmreminderpage * 15))) && ((dmremindertoparray.indexOf(e)) >= ((dmreminderpage - 1) * 15))) dmreminderfinal.push(e)

                })

                const dmreminderlinkembed = new Discord.MessageEmbed()
                    .setTitle("DM Reminders are on for:")
                    .setDescription(dmreminderfinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${dmreminderpage} of ${dmreminderpageamount}`)

                message.channel.send(dmreminderlinkembed).then(msg => {
                    if (dmreminderpageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const dmremindercollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            dmremindercollector.on('collect', (reaction, user) => {
                                dmreminderfinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (dmreminderpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    dmreminderpage = 1
                                    dmremindertoparray.forEach(e => {
                                        if (((dmremindertoparray.indexOf(e) + 1) <= ((dmreminderpage * 15))) && ((dmremindertoparray.indexOf(e)) >= ((dmreminderpage - 1) * 15))) dmreminderfinal.push(e)
                                    })

                                    dmreminderlinkembed.setDescription(dmreminderfinal.join("\n"))
                                    dmreminderlinkembed.setFooter(`Page ${dmreminderpage} of ${dmreminderpageamount}`)
                                    msg.edit(dmreminderlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (dmreminderpage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    dmreminderpage--
                                    dmremindertoparray.forEach(e => {
                                        if (((dmremindertoparray.indexOf(e) + 1) <= ((dmreminderpage * 15))) && ((dmremindertoparray.indexOf(e)) >= ((dmreminderpage - 1) * 15))) dmreminderfinal.push(e)
                                    })
                                    dmreminderlinkembed.setDescription(dmreminderfinal.join("\n"))
                                    dmreminderlinkembed.setFooter(`Page ${dmreminderpage} of ${dmreminderpageamount}`)
                                    msg.edit(dmreminderlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (dmreminderpage == dmreminderpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    dmreminderpage++
                                    dmremindertoparray.forEach(e => {
                                        if (((dmremindertoparray.indexOf(e) + 1) <= ((dmreminderpage * 15))) && ((dmremindertoparray.indexOf(e)) >= ((dmreminderpage - 1) * 15))) dmreminderfinal.push(e)
                                    })
                                    dmreminderlinkembed.setDescription(dmreminderfinal.join("\n"))
                                    dmreminderlinkembed.setFooter(`Page ${dmreminderpage} of ${dmreminderpageamount}`)
                                    msg.edit(dmreminderlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (dmreminderpage == dmreminderpageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    dmreminderpage = dmreminderpageamount
                                    dmremindertoparray.forEach(e => {
                                        if (((dmremindertoparray.indexOf(e) + 1) <= ((dmreminderpage * 15))) && ((dmremindertoparray.indexOf(e)) >= ((dmreminderpage - 1) * 15))) dmreminderfinal.push(e)
                                    })
                                    dmreminderlinkembed.setDescription(dmreminderfinal.join("\n"))
                                    dmreminderlinkembed.setFooter(`Page ${dmreminderpage} of ${dmreminderpageamount}`)
                                    msg.edit(dmreminderlinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            dmremindercollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'pmweewoo':
                if (!hasPerms(message.member, "check")) return warning("You aren't allowed to use this feature", message);
                mentioned = message.mentions.members.first()
                if (mentioned && (typeof toBool(args[1]) !== 'undefined')) {
                    if (!hasPerms(message.member, "setstats")) return warning("You don't have the `setstats` permission required for this.", message)
                    userdata[mentioned.id].pmweewoo = toBool(args[1])
                    return success(`DM Weewoo Alerts for ${mentioned} set to ${userdata[mentioned.id].pmweewoo}`, message)
                } else if (typeof toBool(args[0]) !== 'undefined') userdata[message.author.id].pmweewoo = toBool(args[0])
                else if ("pmweewoo" in userdata[message.author.id]) userdata[message.author.id].pmweewoo = !userdata[message.author.id].pmweewoo
                else return usage("pmweewoo <on/off> / [<@user> <on/off>]", `pmweewoo`, message)
                return success(`Dm Weewoo Alerts set to ${userdata[message.author.id].pmweewoo}`, message)

            case 'viewdmweewoos':
                if (Object.entries(userdata).length === 0) return warning("No users have any data yet", message)

                let dmweewooraw = [];
                let dmweewoofinal = [];
                let dmweewootoparray = [];
                for (let id in userdata) {
                    if (userdata[id].pmweewoo) {
                        dmweewooraw.push(id);
                    }
                }
                if (dmweewooraw.length == 0) return warning("No users have any DM weewoos set", message)
                for (let i in dmweewooraw) {
                    dmweewootoparray.push(`<@${dmweewooraw[i]}>`)
                }

                let dmweewoopageamount = Math.ceil(dmweewootoparray.length / 15);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let dmweewoopage = parseInt(((args[0]) ? args[0] : "1"));
                if (dmweewoopage > dmweewoopageamount) return warning("This page does not exist.", message);
                dmweewootoparray.forEach(e => {
                    if (((dmweewootoparray.indexOf(e) + 1) <= ((dmweewoopage * 15))) && ((dmweewootoparray.indexOf(e)) >= ((dmweewoopage - 1) * 15))) dmweewoofinal.push(e)

                })

                const dmweewoolinkembed = new Discord.MessageEmbed()
                    .setTitle("DM Reminders are on for:")
                    .setDescription(dmweewoofinal.join("\n"))
                    .setColor('YELLOW')
                    .setFooter(`Page ${dmweewoopage} of ${dmweewoopageamount}`)

                message.channel.send(dmweewoolinkembed).then(msg => {
                    if (dmweewoopageamount > 1) {
                        msg.react('⏪').then(() => msg.react('⬅️')).then(() => msg.react('⏹️')).then(() => msg.react('➡️')).then(r => {
                            msg.react('⏩')


                            const dmweewoocollector = msg.createReactionCollector((reaction, user) => (((reaction.emoji.name == '➡️') || (reaction.emoji.name == '⏩') || (reaction.emoji.name == '⏹️') || (reaction.emoji.name == '⬅️') || (reaction.emoji.name == '⏪')) && (user == message.author)), {
                                time: 90000
                            })

                            dmweewoocollector.on('collect', (reaction, user) => {
                                dmweewoofinal = []
                                if (reaction.emoji.name == '⏪') {
                                    if (dmweewoopage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    dmweewoopage = 1
                                    dmweewootoparray.forEach(e => {
                                        if (((dmweewootoparray.indexOf(e) + 1) <= ((dmweewoopage * 15))) && ((dmweewootoparray.indexOf(e)) >= ((dmweewoopage - 1) * 15))) dmweewoofinal.push(e)
                                    })

                                    dmweewoolinkembed.setDescription(dmweewoofinal.join("\n"))
                                    dmweewoolinkembed.setFooter(`Page ${dmweewoopage} of ${dmweewoopageamount}`)
                                    msg.edit(dmweewoolinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⬅️') {
                                    if (dmweewoopage == 1) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                    dmweewoopage--
                                    dmweewootoparray.forEach(e => {
                                        if (((dmweewootoparray.indexOf(e) + 1) <= ((dmweewoopage * 15))) && ((dmweewootoparray.indexOf(e)) >= ((dmweewoopage - 1) * 15))) dmweewoofinal.push(e)
                                    })
                                    dmweewoolinkembed.setDescription(dmweewoofinal.join("\n"))
                                    dmweewoolinkembed.setFooter(`Page ${dmweewoopage} of ${dmweewoopageamount}`)
                                    msg.edit(dmweewoolinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                } else if (reaction.emoji.name == '⏹️') {
                                    return msg.delete().catch(console.error)
                                } else if (reaction.emoji.name == '➡️') {
                                    if (dmweewoopage == dmweewoopageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    dmweewoopage++
                                    dmweewootoparray.forEach(e => {
                                        if (((dmweewootoparray.indexOf(e) + 1) <= ((dmweewoopage * 15))) && ((dmweewootoparray.indexOf(e)) >= ((dmweewoopage - 1) * 15))) dmweewoofinal.push(e)
                                    })
                                    dmweewoolinkembed.setDescription(dmweewoofinal.join("\n"))
                                    dmweewoolinkembed.setFooter(`Page ${dmweewoopage} of ${dmweewoopageamount}`)
                                    msg.edit(dmweewoolinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())

                                } else if (reaction.emoji.name == '⏩') {
                                    if (dmweewoopage == dmweewoopageamount) return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first());
                                    dmweewoopage = dmweewoopageamount
                                    dmweewootoparray.forEach(e => {
                                        if (((dmweewootoparray.indexOf(e) + 1) <= ((dmweewoopage * 15))) && ((dmweewootoparray.indexOf(e)) >= ((dmweewoopage - 1) * 15))) dmweewoofinal.push(e)
                                    })
                                    dmweewoolinkembed.setDescription(dmweewoofinal.join("\n"))
                                    dmweewoolinkembed.setFooter(`Page ${dmweewoopage} of ${dmweewoopageamount}`)
                                    msg.edit(dmweewoolinkembed)
                                    return reaction.users.remove(reaction.users.cache.filter(u => u === message.author).first())
                                }
                            })
                            dmweewoocollector.on('end', () => {
                                setTimeout(() => {
                                    if (!msg.deleted) msg.reactions.removeAll().catch(console.error)
                                    if (!message.deleted) message.delete().catch(console.error)
                                }, 1000)
                            })
                        })
                    } else return;
                })
                break;

            case 'messages':
                if (!hasPerms(message.member, 'settings')) return warning("You are not allowed to manage settings", message)
                if (args[0] == 'view' || args[0] == 'show' || args[0] == 'help' || !args[0]) {
                    const messagesembed = new Discord.MessageEmbed() // Define a new embed
                        .setColor('PURPLE') // Set the color
                        .setTitle(`Bot Messages Info`)
                        .addField(`How to change Messages:`, `To change messages, run \n**${hardconfig.prefix}messages** *<messagename> <new value>*\n Don't make the ingame messages too long, or the bot might crash.`)
                        .addField(`How the messages are displayed:`, '**Readable Name:** \`\`\`current message\`\`\` `messagename`\nWhen changing settings, use the `messagename`')
                        .addField(`Codes:`, `
                        **[since]** - Time since the last check (in format: 4 hours 2 minutes)
                        **[lastchecker]** - Last wall/cactus/buffer checker 
                        **[platform]** - Through which method the check was performed (Discord or Minecraft)
                        **[score]** - The wall/cactus/buffer score of the checker
                        **[info]** *Only for buffer alert* - Displays the info given about the buffer alert
                        **[wallsrole]** - The wallsrole is tagged (Only in discord messages)`)
                        .addField(`More codes`, `
                        **[user]** *Only for value added* - The user that added value 
                        **[value]** *Only for value added* - The value that was added
                        **[totalvalue]** *Only for value added* - The total value of the user
                        **[striked]** *Only for strikes* - The striked player
                        **[mod]** *Only for strikes* - The mod that gave the strike
                        **[reason]** *Only for strikes* - The reason for the strike 
                        **[strikes]** *Only for strikes* - The total amount of strikes for the striked player`)
                        .addField('__Reminders:__', `
                        **Wall reminder:** \`\`\`${settings.wallremindermessage}\`\`\`  \`wallremindermessage\`
                        **Cactus reminder:**  \`\`\`${settings.cactusremindermessage}\`\`\` \`cactusremindermessage\`
                        **Buffer reminder:** \`\`\`${settings.bufferremindermessage}\`\`\` \`bufferremindermessage\`\n\n\n`)
                        .addField(`Discord Reminders:`, `
                        **Wall Reminder:** \`\`\`${settings.discordwallreminder}\`\`\` \`discordwallreminder\`
                        **Cactus Reminder:** \`\`\`${settings.discordcactusreminder}\`\`\` \`discordcactusreminder\`
                        **Buffer Reminder:** \`\`\`${settings.discordbufferreminder}\`\`\` \`discordbufferreminder\`\n\n\n`)
                        .addField('__Clear Messages (Ingame):__', `
                        **Walls:** \`\`\`${settings.wallclearmessage}\`\`\` \`wallclearmessage\`
                        **Buffer:** \`\`\`${settings.bufferclearmessage}\`\`\` \`bufferclearmessage\`
                        **Cactus:** \`\`\`${settings.cactusclearmessage}\`\`\` \`cactusclearmessage\`\n\n\n`)
                        .addField('__Weewoo Messages (Ingame):__', `
                        **Walls:** \`\`\`${settings.wallweewoomessage}\`\`\` \`wallweewoomessage\`
                        **Buffer:** \`\`\`${settings.bufferweewoomessage}\`\`\` \`bufferweewoomessage\`
                        **Cactus:** \`\`\`${settings.cactusweewoomessage}\`\`\` \`cactusweewoomessage\`\n\n\n`)
                        .addField('__Other Messages (Ingame):__', `
                        **Buffer Alert:** \`\`\`${settings.bufferalertmessage}\`\`\` \`bufferalertmessage\`
                        **Value added:** \`\`\`${settings.addvaluemessage}\`\`\` \`addvaluemessage\`
                        **Player Striked:** \`\`\`${settings.strikemessage}\`\`\` \`strikemessage\`\n\n\n`)

                        .setFooter(`Current Messages`)

                    message.channel.send(messagesembed).catch(console.error)
                    return message.delete()
                }
                let ingmessages = ['wallremindermessage', 'bufferremindermessage', 'cactusremindermessage', 'addvaluemessage', 'strikemessage', 'wallclearmessage', 'wallweewoomessage', 'cactusclearmessage',
                    'cactusweewoomessage', 'bufferclearmessage', 'bufferalertmessage', 'bufferweewoomessage'
                ]
                let discmessages = ['discordwallreminder', 'discordbufferreminder', 'discordcactusreminder']
                if (ingmessages.includes(args[0])) {
                    preargs.shift()
                    ingamemessage = preargs.join(" ")
                    if (ingamemessage.length > 88) return warning("That message is too long and would probably get the bot kicked when used.", message)
                    settings[args[0]] = ingamemessage
                    writeJSON(settings, 'settings')
                    return success(`${args[0]} set to **\`\`\`${ingamemessage}\`\`\`**`, message)
                } else if (discmessages.includes(args[0])) {
                    preargs.shift()
                    discmessage = preargs.join(" ")
                    settings[args[0]] = discmessage
                    writeJSON(settings, 'settings')
                    return success(`${args[0]} set to **\`\`\`${discmessage}\`\`\`**`, message)
                } else return usage(`Messages <show>/[<messagename> <newmessage>]`, 'Messages', message)

            case 'stopweewoo':
                if (!wallweewoo && !cactusweewoo) return warning("There is currently no active weewoo", message)
                if (!hasPerms(message.member, "check")) return warning("You are not allowed to stop weewoos", message)
                wallweewoo = false;
                cactusweewoo = false;
                return success("The weewoo alert has been successfully stopped", message)


            case 'newupdate':
                if (!message.member.hasPermission("ADMINISTRATOR") && (!message.member.roles.cache.some(role => role.name == hardconfig.adminrole))) return warning('You are not allowed to update the bot')
                hardconfig.update = true;
                writeJSON(hardconfig, 'hardconfig');
                return success(`The bot is now ready to be updated. Simply close the bot manually and follow the instructions provided with the new bot file in the discord.`, message)
            case 'shield':
            case 'setshield':
                if (args[0] == 'show' || args[0] == 'view' || args[0] == 'info' || !args[0]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle(`Current Shield`)
                        .setDescription((!isRegExpFormat(settings.shieldstart, /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/) ? `The shield times are not yet set. Set them using \n\`${hardconfig.prefix}shield <starttime> <endtime>\`\n All times are in UTC (current time is **\`${new Date().toUTCString().split(' ')[4].substr(0, 5)}\`**) and in format \`hh:mm\`` : `Shield start time is \`${settings.shieldstart}\`\nShield end time is \`${settings.shieldend}\`\nCurrent time is **\`${new Date().toUTCString().split(' ')[4].substr(0, 5)}\`**\n The shield is currently ${(shieldIsOff()) ? `:x: **OFF**` : `:white_check_mark: **ON**`}`))
                        .setTimestamp();
                    return message.channel.send(embed).catch(console.error);
                }
                if (!hasPerms(message.member, 'settings'))
                    return warning(`You do not have permission to do this.`, message);
                if (args[0] == 'off' || args[0] == 'disable') {
                    settings.shieldstart = '';
                    settings.shieldend = '';
                    writeJSON(settings, 'settings');
                    return success(`Disabled the shield times.`, message);
                }
                else if (isRegExpFormat(args[0], /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/) && isRegExpFormat(args[1], /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/)) {
                    settings.shieldstart = args[0];
                    settings.shieldend = args[1];
                    writeJSON(settings, 'settings');
                    return success(`Shield start time set to \`${settings.shieldstart}\`\nShield end time set to \`${settings.shieldend}\``, message);
                }
                else
                    return usage(`shield info|<starttime> <endtime>|off\n Times need to be in format \`hh:mm\` and are in UTC (current time is **\`${new Date().toUTCString().split(' ')[4].substr(0, 5)}\`**)`, `Shield`, message);
                
                
            case 'canetop':
                if (!bot) return warning(`Bot isn't active`, message);
                if ((args[0]) && (!isRegExpFormat(args[0], /[0-9.,]+/g))) args[0] = "1"
                let page = parseInt(args[0] ? args[0] : '1');
                bot.write('chat', {
                    message: `/canetop ${page}`
                })
                canetop = true;
                setTimeout(() => {
                    if (!canedataone || !canedatatwo) return warning("there was an error", message);
                    const canetopembed = new Discord.MessageEmbed()
                        .setTitle(`Cane Top - ${noun(hardconfig.realm)} Realm`)
                        .setTimestamp()
                        .addField("Player", canedataone.join("\n"), true)
                        .addField("Amount", canedatatwo.join("\n"), true)
                        .setColor('NAVY');
                    message.channel.send(canetopembed).catch(console.error);
        
                    canetop = false;
                    canedataone = [];
                    canedatatwo = [];
                }, 1000);
        
        
                }



    })

    client.on('voiceStateUpdate', async (oldState, newState) => {
        if (settings.muted.includes(newState.member.id)) {
            return newState.setMute(true, "Muted").catch(console.error);
        }
        return;
    })


    client.on('guildMemberRemove', async member => {
        if (!userdata[member.id]) return;
        if (member.id in permissions) delete permissions[member.id];
        userdata[member.id].pmremind = false
        userdata[member.id].pmweewoo = false
        userdata[member.id].uuids = [];
        return userdata[member.id].names = [];

    })

    client.on('messageReactionAdd', async (reaction, user) => {
        if (user == client.user) return;
        guildmember = client.guilds.cache.get(hardconfig.guild).member(user);
        if (!userdata[user.id]) initID(user.id);
        if (!(reaction.emoji.name == '✅' || reaction.emoji.name == '💣' && (reaction.message == wallsmessage || reaction.message == wallsreminder || reaction.message == buffermessage || reaction.message == bufferreminder || reaction.message == cactusmessage || reaction.message == cactusreminder || reaction.message == weewooconfirm || reaction.message == bufferconfirm || reaction.message == cactusconfirm))) return;
        let permcheck = client.guilds.cache.get(hardconfig.guild).members.cache.get(user.id)
        if (!permcheck) {
            permcheck = await client.guilds.cache.get(hardconfig.guild).members.fetch(user.id)
            if (!permcheck) return;
        }
        if (!hasPerms(permcheck, "check")) return reaction.users.remove(reaction.users.cache.filter(u => u === user).first());
        if ((reaction.message == wallsmessage) || (reaction.message == wallsreminder)) {
            if (reaction.emoji.name == '✅') {
                clearWalls(userdata[user.id].names[0], user.id, "Discord")
                if (reaction.message !== wallsreminder) reaction.message.reactions.removeAll().catch(console.error)
            } else if (reaction.emoji.name == '💣') {
                wallschannel.send(`<@${user.id}>, you triggered the 💣\`${hardconfig.prefix}weewoo\` command.\n**React again to confirm!**`)
                    .then(message => {
                        message.react('💣');
                        weewooconfirm = message;
                    })
                    .catch(console.error)
                wallweewooer = user
                setTimeout(() => {
                    if ((weewooconfirm) && (!weewooconfirm.deleted)) weewooconfirm.delete().catch(console.error)
                }, 30000)
            }
        } else if ((reaction.message == buffermessage) || (reaction.message == bufferreminder)) {

            if (reaction.emoji.name == '✅') {
                clearBuffer(userdata[user.id].names[0], user.id, "Discord")
                if (reaction.message !== bufferreminder) reaction.message.reactions.removeAll().catch(console.error)
            } else if (reaction.emoji.name == '💣') {
                bufferchannel.send(`<@${user.id}>, you triggered the 💣\`${hardconfig.prefix}weewoo\` command.\n**React again to confirm that someone is setting up on us!**`)
                    .then(message => {
                        message.react('💣');
                        bufferconfirm = message;
                    })
                    .catch(console.error)
                bufferweewooer = user
                setTimeout(() => {
                    if ((bufferconfirm) && (!bufferconfirm.deleted)) bufferconfirm.delete().catch(console.error)
                }, 30000)

            }
        } else if ((reaction.message == cactusmessage) || (reaction.message == cactusreminder)) {
            if (reaction.emoji.name == '✅') {
                clearCactus(userdata[user.id].names[0], user.id, "Discord")
                if (reaction.message !== bufferreminder) reaction.message.reactions.removeAll().catch(console.error)
            } else if (reaction.emoji.name == '💣') {
                cactuschannel.send(`<@${user.id}>, you triggered the 💣\`${hardconfig.prefix}weewoo\` command.\n**React again to confirm that someone is setting up on us!**`)
                    .then(message => {
                        message.react('💣');
                        cactusconfirm = message;
                    })
                    .catch(console.error)
                cactusweewooer = user
                setTimeout(() => {
                    if ((cactusconfirm) && (!cactusconfirm.deleted)) cactusconfirm.delete().catch(console.error)
                }, 30000)

            }
        } else if (reaction.message == weewooconfirm) {
            if ((reaction.emoji.name == '💣') && (user == wallweewooer)) {
                wallweewooer = ''
                if (wallsmessage) wallsmessage.reactions.removeAll().catch(console.error)
                weewooWalls(userdata[user.id].names[0], user.id, "Discord")
                if (!reaction.message.deleted) reaction.message.delete().catch(console.error)
            }

        } else if (reaction.message == bufferconfirm) {
            if ((reaction.emoji.name == '💣') && (user == bufferweewooer)) {
                bufferweewooer = ''
                if (buffermessage) buffermessage.reactions.removeAll().catch(console.error)
                weewooBuffer(userdata[user.id].names[0], user.id, "Discord")
                if (!reaction.message.deleted) reaction.message.delete().catch(console.error)
            }

        } else if (reaction.message == cactusconfirm) {
            if ((reaction.emoji.name == '💣') && (user == cactusweewooer)) {
                bufferweewooer = ''
                if (buffermessage) buffermessage.reactions.removeAll().catch(console.error)
                weewooCactus(userdata[user.id].names[0], user.id, "Discord")
                if (!reaction.message.deleted) reaction.message.delete().catch(console.error)
            }

        } else return;
    })

}

process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err)
    process.exit(1) //mandatory (as per the Node.js docs)
})

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection: ', error));






client.login(config.token)
    .catch(() => console.error("Invalid discord token provided in the Config.json file"))