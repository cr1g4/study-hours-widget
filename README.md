# Ore di studio

Un widget per [Übersicht](https://tracesof.net/uebersicht/) che tiene il conto delle ore di studio per materia, direttamente sul desktop del Mac.

- **tre temi**, si cambiano con un clic sulla pillola in alto. In tutti la scena è **un giorno**, e con le frecce ‹ › lo sfogli: vedi il tuo studio crescere (o fermarsi) nel tempo.
  - **Solare**: il sole sono le ore del giorno; ogni materia è un pianeta grande quanto le ore accumulate, e più è lontano dal sole più giorni sono passati dall'ultima volta che l'hai studiata
  - **Città**: un palazzo per materia; ogni finestra accesa è un'ora accumulata e il palazzo sale di un piano alla volta; le finestre gialle sono le ore del giorno, i palazzi bui le materie trascurate
  - **Vinile**: il disco si incide man mano, un solco per settimana dall'esterno verso il centro, un arco colorato per materia; la puntina sta sul solco del giorno che guardi
- **▶ / ■** per far partire e fermare il timer; mentre studi la scena diventa un cronometro flip
- **obiettivo giornaliero** facoltativo, come anello intorno al sole, alla luna o all'etichetta del disco
- le materie del semestre in primo piano, quelle vecchie nell'**archivio**
- si sposta trascinando la testata e si ridimensiona dall'angolo in basso a destra, larghezza e altezza libere: se lo fai più largo che alto si dispone in orizzontale (scena a sinistra, materie a destra); posizione, misura e tema restano anche dopo un riavvio
- tutto in un file JSON leggibile, gestibile anche da terminale

## Installazione

1. Installa [Übersicht](https://tracesof.net/uebersicht/).
2. Copia questa cartella dentro la cartella dei widget, tenendo il nome `study-hours.widget`:
   ```bash
   cd ~/Library/Application\ Support/Übersicht/widgets
   git clone https://github.com/cr1g4/study-hours-widget.git study-hours.widget
   ```
3. Fatto: il widget compare sul desktop. I dati finiscono in `~/.study-hours.json`.

Serve solo il Python che c'è già su macOS (`/usr/bin/python3`), senza pacchetti da installare.

## Configurazione

Copia `config.example.json` in `config.json` e cambia quello che ti serve:

```json
{
  "file": "~/.study-hours.json",
  "obiettivo": "3h",
  "inizio": "2026-09-28",
  "nomi": {"Analisi 1": "Analisi Matematica 1"}
}
```

- `file`: dove stanno i dati
- `obiettivo`: le ore da fare ogni giorno; se manca, l'anello non compare
- `inizio`: da che giorno contare (per esempio l'inizio del semestre, `"2026-09-28"`); le scene partono da lì
- `nomi`: il nome completo da mostrare sotto la sigla di ogni materia

## Da terminale

```bash
cd ~/Library/Application\ Support/Übersicht/widgets/study-hours.widget
./studio.py start "Analisi 1"   # parte il timer (una materia nuova si aggiunge da sola)
./studio.py stop                # ferma il timer
./studio.py stop -15m           # ferma e toglie 15 minuti di pausa
./studio.py add Fisica 1h30m    # aggiunge tempo a mano (con -30m lo toglie)
./studio.py archivia Fisica     # la sposta nell'archivio
./studio.py attiva Fisica       # la riporta in primo piano
./studio.py status              # riassunto
```

## Il file dei dati

```json
{
  "totali":   {"Analisi 1": 12600},
  "sessione": {"materia": "Analisi 1", "start": 1793441451},
  "giorni":   {"2026-10-31": {"Analisi 1": 5400}},
  "attive":   ["Analisi 1"]
}
```

I tempi sono in secondi. `sessione` è `null` quando il timer è fermo. Una sessione a cavallo della mezzanotte viene divisa tra i due giorni.
