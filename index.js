const discord = require("discord.js");
const fs = require('fs');
const client = new discord.Client();

//TODO: True RNG
const prefix = '.'

const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'))
login();

client.on("ready", () => {
    console.log("Ready.");
});

client.on("message", (msg) => {
    args = msg.content.split(' ');
    const chan = msg.channel;
    if (!args[0].startsWith(prefix))
        return;
    var cmd = args[0].substring(1).toLowerCase();
    args = args.slice(1);
    switch (cmd) {
        case 'act':
        case 'a':
        case 'roll':
        case 'r':
            actionRoll(msg, args);
            break;
        case 'shutdown':
            shutdown(msg);
            break;
        case 'reset':
            reset(chan);
            break;
    }
});

function d(sides, count = 1) {
    return rInt(1, sides, count);
}

function rInt(min, max, count = 1) {
    if (count == 1) return Math.floor(Math.random() * (max - min + 1)) + min;
    return Array.apply(null, Array(count)).map(n => rInt(min, max))
}

function actionRoll(msg, args) {
    var chan = msg.channel;
    var mods = args.reduce(function (m, s) {
        const i = parseInt(s);
        return m + (i ? i : 0);
    }, 0);
    var action = d(6, 2);
    const total = action[0] + action[1] + mods;
    var modStr = args.reduce((s, n) => {
        const i = parseInt(n);
        if (!i && i !== 0) return s;
        return s + ' ' + (i < 0 ? '-' : '+') + ' ' + Math.abs(i)
    }, '');
    var result = '' +
        `**${total}** (**${action[0]}** & **${action[1]}**${modStr})`

    var success;
    if (total <= 6) success = 0;
    else if (total <= 9) success = 1;
    else success = 2;
    var successStr = ["Miss...", "Mixed success!", "_Success!_"][success];
    result += `\n${msg.author} ${successStr}`

    chan.send(result)
}

function login() {
    client.login(tokens.discord.botAccount);
}

function reset(channel) {
    channel.send('Resetting...')
        .then(msg => client.destroy())
        .then(() => login());
}

function shutdown(msg) {
    const a = msg.author;
    console.info(`Shutdown request received from ${a.id} (${a.username}#${a.discriminator}.)`);
    if (a.id != tokens.discord.ownerId)
        return;

    console.log("Shutting down.");
    msg.channel.send(`Shutting down at the request of ${msg.author}.`)
        .then(() => client.destroy())
        .then(() => process.exit(0));
}