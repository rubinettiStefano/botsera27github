const {Client, GatewayIntentBits, SlashCommandBuilder, Routes} = require('discord.js');
const {REST} = require('@discordjs/rest');
require('dotenv').config();


const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const token = process.env.TOKEN;
const clientId = process.env.CLIENT;

const rest = new REST({version: '10'}).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName('crea')
        .setDescription('crea una nuova asta')
        .addStringOption(
            option =>
                option
                    .setName('oggetto')
                    .setDescription('Nome oggetto in vendita')
                    .setRequired(true)
        )
        .addStringOption(
            option =>
                option
                    .setName('descrizione')
                    .setDescription('descrizione oggetto in vendita')
                    .setRequired(true)
        )
        .addIntegerOption(
            option =>
                option
                    .setName('base')
                    .setDescription("base d'asta")
                    .setRequired(true)
        )
        .addIntegerOption(
            option =>
                option
                    .setName('durata')
                    .setDescription('in secondi')
                    .setRequired(true)
        )
    ,
    new SlashCommandBuilder()
        .setName('punta')
        .setDescription('Fai una puntata')
        .addIntegerOption(
            option =>
                option
                    .setName('valore')
                    .setDescription('dammi soldini')
                    .setRequired(true)
        )

].map(command => command.toJSON());

(async () => {
    try {
        console.log('Inizio registrazione dei comandi slash globali.');
        await rest.put(
            Routes.applicationCommands(clientId),
            {body: commands}
        );
        console.log('Comandi slash globali registrati con successo.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;

    switch (commandName) {
        case 'crea':
            gestisciCreazioneAsta(interaction);
            break;
        case 'punta':
            gestisciPuntata(interaction);

            break;
        default:
            interaction.reply("HEI,NON ESISTO");
    }
});

let oia = {nome:"",descrizione:"",valore:0,inCorso:false,venditore:null,acquirente:null};
let durataAsta = 0;
function gestisciCreazioneAsta(interaction)
{
    if(oia.inCorso)
    {
        interaction.reply("Asta già in corso");
        return;
    }

    oia.nome = interaction.options.getString('oggetto');
    oia.descrizione = interaction.options.getString('descrizione');
    oia.valore = interaction.options.getInteger('base');
    oia.inCorso = true;
    oia.venditore = interaction.user;
    oia.acquirente = interaction.user;
    durataAsta = interaction.options.getInteger('durata');



    interaction.reply(`Asta per ${oia.nome} creata, base: ${oia.valore}, avete ${durataAsta} secondi`);

    setTimeout(() => {

        for(let i = 10; i >0; i--) {
            setTimeout(
                ()=> { interaction.followUp(`${i==10 ? "Ultimi 10 secondi" :i}`)},
                (10-i)*1000


            )
            ;
        }


    }, (durataAsta-10) * 1000);


    setTimeout(() => {
        oia.inCorso = false;
        if(oia.acquirente==oia.venditore)
            interaction.followUp(`Che tristezza, no acquirenti`);
        else
            interaction.followUp(`Asta finita, se la aggiudica ${oia.acquirente.displayName}  per ${oia.valore} soldi in valuta ignota`);


    }, durataAsta * 1000);

}

function gestisciPuntata(interaction)
{
   if(!oia.inCorso) {
       interaction.reply("Nessun asta in corso")
       return;
   }

   let valore = interaction.options.getInteger('valore');

   if(valore<=oia.valore)
       interaction.reply(`Cosa punti a fare, maledetto, punta di più`);
   else if(valore>=oia.valore*2.5)
   {
       interaction.reply('Non puoi aumentare di così tanto')
   }
   else
   {
       oia.acquirente = interaction.user;
       oia.valore = valore;
       interaction.reply(`Nuova puntata di ${oia.acquirente.displayName}  di ${oia.valore} soldi `);
   }
}

client.login(token);