
const Discord = require("discord.js");
const Enmap = require("enmap");
//DISCORD.JS 12

const client = new Discord.Client();
client.lootban = new Enmap({name: "lootban"});

//Date.prototype.toUnixTime = function() { return this.getTime()/1000|0 };
//Date.time = function() { return new Date().toUnixTime(); }

const config = require("./config.json");

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
  //playing:
  client.user.setActivity(`Lootban Simulator`);
});

client.on("message", async message => {
  //ignore other bots
  if(message.author.bot) return;
  //ignore any message that does not start with our prefix
  if(!message.content.startsWith(config.prefix)) return;
  //separate our "command" name, and our "arguments" for the command. 
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
  }
  
  if(command === "lootban") {
 
    if(!message.member.roles.cache.some(r=>["Officers"].includes(r.name)))
      return message.reply("¿A quién vas a lootbanear tu, joputa?");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord. Menciona bien.`);

    let reason = args.slice(1).join(' ');
    if(!reason) return message.reply(`¿Y por qué razón debería yo lootbanear a ${member}?`);

    message.delete().catch(O_o=>{});

    const key = `${message.guild.id}-${member.id}`;
    client.lootban.ensure(key,{
      user: member,
      lootbans: 0,
      timestamp: Date.now(),
      why: reason
    });
    client.lootban.inc(key, "lootbans");
    client.lootban.set(key, Date.now(), "timestamp");
    client.lootban.set(key, reason, "why");
    const embed = new Discord.MessageEmbed()
    .setTitle("PUM! LOOTBANEAO!")
    .setColor(0xF58A42)
    .addFields(
        {name:`Infractor: `, value: `${member.displayName}`},
        {name:`Razón: `, value: `${reason}`},
    )
    return message.channel.send({embed});
  }

  // if(command === "test1"){
  //   message.channel.send(`${message.mentions.members.first()}`);
  // }

  // if(command === "test2"){
  //   message.channel.send(`${message.author}`);
  // }
  
  if(command === "standing") {

    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord. Menciona bien.`);
    
    const key = `${message.guild.id}-${member.id}`;
    // if(client.lootban.get(key, "timestamp") != 0 && (Date.now() - client.lootban.get(key, "timestamp")) >  864000000){
    //   client.lootban.set(key, "timestamp", 0);
    // }
    client.lootban.ensure(key,{
      user: member,
      lootbans: 0,
      timestamp: 0,
      why: "-"
    });
    message.channel.send(`${member} ha sido lootbaneado **${client.lootban.get(key, "lootbans")}** veces.`);
  }

  if(command === "estabanned") {

    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord. Menciona bien.`);

    const key = `${message.guild.id}-${member.id}`;
    client.lootban.ensure(key,{
      user: member,
      lootbans: 0,
      timestamp: 0,
      why: "-"
    });

    if((Date.now() - client.lootban.get(key, "timestamp")) > 864000000){
      message.channel.send(` tranquilo acho, que ${member} **no** está lootbanned.`);
    }else{
      var f = new Date(client.lootban.get(key, "timestamp"));
      var fs = new Date(client.lootban.get(key, "timestamp")+864000000);
    
      message.reply('hmm...');
      const embed = new Discord.MessageEmbed()
      .setTitle("Lootbanned")
      .setColor(0xCA0000)
      .addFields(
        {name:`Infractor: `, value: `${member.displayName}`},
        {name:`Desde: `, value: `${f.toLocaleString()}`},
        {name:`Por: `, value: `${client.lootban.get(key, "why")}`},
        {name:`Hasta: `, value: `${fs.toLocaleString()}`},
      )
      return message.channel.send({embed});
    } 
  }

  if(command === "indulto") {
    if(!message.author.id === message.guild.owner) return message.reply("¿Eres Kairoz? No me lo parece.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord.`);

    const key = `${message.guild.id}-${member.id}`;
    client.lootban.ensure(key,{
      user: member,
      lootbans: 0,
      timestamp: 0,
      why: "-"
    });
    if(!client.lootban.get(key, "lootbans") == 0){
      client.lootban.dec(key, "lootbans");
    }
    client.lootban.set(key, 0, "timestamp");
    client.lootban.set(key, "-", "why");
    message.channel.send(`${member} indultao... pussies.`);
  }

  if(command === "unlootban") {
    if(!message.member.roles.cache.some(r=>["Admins"].includes(r.name)))
      return message.reply("No can do.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord.`);

    const key = `${message.guild.id}-${member.id}`;
    client.lootban.ensure(key,{
      user: member,
      lootbans: 0,
      timestamp: 0,
      why: "-"
    });
    client.lootban.set(key, 0, "timestamp");
    client.lootban.set(key, "-", "why");
    message.channel.send(`${member} indultao... pussies.`);
  }

  if(command === "modts"){
    if(!message.author.id === message.guild.owner) return message.reply("¿Eres Kairoz? No me lo parece.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord. Menciona bien.`);

    let delta = args.slice(1).join(' ');
    if(!delta) return message.reply(`Missing delta t`);

    const key = `${message.guild.id}-${member.id}`;
    client.lootban.ensure(key,{
      user: member,
      lootbans: 0,
      timestamp: 0,
      why: "-"
    });
    var x = client.lootban.get(key, "timestamp") - Number(delta);
    client.lootban.set(key, x, "timestamp");
    return message.channel.send(`Edited TS`);
  }

  if(command === "hard.reset") {

    if(!message.author.id === message.guild.owner) return message.reply("¿Eres Kairoz? No me lo parece.");
 
    // if(!message.member.roles.cache.some(r=>["Admins"].includes(r.name)))
    //   return message.reply("No can do.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply(`Acho, ${member} no está en este Discord.`);

    const key = `${message.guild.id}-${member.id}`;
    client.lootban.set(key, 0, "timestamp");
    client.lootban.set(key, "-", "why");
    client.lootban.set(key, 0, "lootbans");
    message.channel.send(`${member} full reset.`);
  }

  if(command === "lootprio"){
    message.channel.send("Toma loot prio:", {files: ["https://i.imgur.com/PZTSJOP.png"]});
  }

  if(command === "help"){
    //message.delete().catch(O_o=>{});
    const embed = new Discord.MessageEmbed()
    .setTitle("Comandos disponibles")
    .setColor(0x00AE86)
    .addFields(
        {name:`+standing @alguien`, value: `Consulta la posicion en el ranking.`},
        {name:`+estabanned @alguien`, value: `Consulta el estado del ban, fechas y motivo.`},
        {name:`+lootbanned`, value: `Muestra los lootbans actuales.`},
        {name:`+ranking`, value: `Muestra el top 5 más baneado (histórico).`},
        {name:`+lootprio`, value: `¿Cuándo me toca lootear?`},
        {name:`+ping`, value: `Ping al server.`},
    )
    return message.channel.send({embed});
  }

  if(command === "ranking"){
    //message.delete().catch(O_o=>{});
    const arr = client.lootban.array();
    
    const sorted = arr.sort((a,b) => b.lootbans - a.lootbans);

    const top10 = sorted.splice(0,5);

    const embed = new Discord.MessageEmbed()
    .setTitle("Lootban Ranking")
    .setDescription("Top 5 más baneados")
    .setColor(0x00AE86);
    for(const data of top10) {
      if(!data.lootbans==0){
        embed.addField(`${data.user.displayName}`, `${data.lootbans} veces.`);
      }
    }
    return message.channel.send({embed});
  }

  if(command === "lootbanned"){
    const arr = client.lootban.array();
    var lb = new Array();

    for(const data of arr) {
      if(!((Date.now() - data.timestamp) > 864000000)){
        lb.push(data);
      }
    }

    const sorted = lb.sort((a,b) => a.timestamp - b.timestamp);
    // arr.array.forEach(element => {
    //   if(!((Date.now() - arr.timestamp) > 864000000)){
    //     lb.push(element);
    //   }   
    // });

    const embed = new Discord.MessageEmbed()
    .setTitle("Lootbans actuales")
    .setColor(0xF5E342);
    for(const data of sorted) {
      var fs = new Date(data.timestamp+864000000);
      embed.addField(`${data.user.displayName}`, `Hasta: ${fs.toDateString()}`, true);
    }
    return message.channel.send({embed});
  }
});

client.login(config.token);