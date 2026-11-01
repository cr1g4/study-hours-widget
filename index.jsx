// Widget Übersicht — Ore di studio
// Legge i dati con studio.py, conta live la sessione aperta,
// fa partire e fermare il timer coi bottoni e si sposta trascinando la testata.
// La parte alta è una "scena" a tema; quando si studia diventa un cronometro flip.

import { run } from "uebersicht";

const CARTELLA = "study-hours.widget"; // nome della cartella del widget
const STUDIO = `/usr/bin/python3 ${CARTELLA}/studio.py`;
const CHIAVE_POSIZIONE = "study-hours.posizione";

// un colore per materia attiva, nell'ordine in cui sono elencate
const COLORI = ["#2dd4bf", "#a78bfa", "#fb7185", "#fbbf24", "#60a5fa", "#f472b6"];

const VISTE = [
  { id: "solare", nome: "Solare", icona: "☀" },
  { id: "citta", nome: "Città", icona: "☾" },
  { id: "vinile", nome: "Vinile", icona: "◉" },
];

export const refreshFrequency = 1000; // 1s -> il timer scorre live
export const command = `${STUDIO} json`;

// indietro = quanti giorni prima di oggi si sta guardando (0 = oggi)
export const initialState = { output: "", archivio: false, indietro: 0, vista: null };

export const updateState = (event, prev) => {
  switch (event.type) {
    case "UB/COMMAND_RAN":
      return { ...prev, output: event.output, error: event.error };
    case "ARCHIVIO":
      return { ...prev, archivio: !prev.archivio };
    case "GIORNO_PRIMA":
      return { ...prev, indietro: prev.indietro + 1 };
    case "GIORNO_DOPO":
      return { ...prev, indietro: Math.max(0, prev.indietro - 1) };
    case "VISTA":
      return { ...prev, vista: event.vista };
    default:
      return prev;
  }
};

// la card si posiziona da sola: la radice resta in alto a sinistra
export const className = `
  top: 0;
  left: 0;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: #e6e8ee;

  .card {
    position: absolute;
    width: 280px;
    box-sizing: border-box;
    padding: 12px;
    border-radius: 24px;
    background: linear-gradient(180deg, #161a22 0%, #0e1117 100%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 18px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
    user-select: none;
  }
  .mono { font-family: "SF Mono", ui-monospace, Menlo, monospace; font-variant-numeric: tabular-nums; }

  .testa { display: flex; align-items: center; gap: 10px; padding: 2px 4px 10px; cursor: grab; }
  .testa:active { cursor: grabbing; }
  .maniglia { display: flex; gap: 3px; }
  .maniglia i { width: 3px; height: 14px; border-radius: 2px; background: rgba(255,255,255,0.18); }
  .title { flex: 1; font-size: 14px; font-weight: 600; letter-spacing: 0.2px; white-space: nowrap; }
  .pillola {
    max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    padding: 5px 10px; border-radius: 999px; cursor: pointer;
    color: #fbbf24; background: rgba(251,191,36,0.10); border: 1px solid rgba(251,191,36,0.30);
  }
  .pillola.live { color: #2dd4bf; background: rgba(45,212,191,0.10); border-color: rgba(45,212,191,0.35); }

  .scena {
    position: relative; height: 220px; overflow: hidden;
    border-radius: 16px; margin-bottom: 10px;
    border: 1px solid rgba(255,255,255,0.05);
  }

  /* sistema solare */
  .spazio { background: radial-gradient(circle at 50% 50%, #1c1608 0%, #0b0d12 55%, #07080b 100%); }
  .stellina { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #fff; opacity: 0.35; }
  .orbita { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.07); }
  .sole {
    position: absolute; width: 64px; height: 64px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: radial-gradient(circle at 38% 34%, #fff6d5 0%, #fcd34d 22%, #f59e0b 50%, #b45309 78%, #78350f 100%);
    box-shadow: 0 0 24px rgba(245,158,11,0.65), 0 0 60px rgba(245,158,11,0.25), inset -6px -8px 14px rgba(120,53,15,0.6);
    animation: respiro 5s ease-in-out infinite;
  }
  .sole small { font-size: 8px; font-weight: 800; letter-spacing: 1px; color: #5b2a07; text-transform: uppercase; }
  .sole b { font-size: 12px; font-weight: 800; color: #3b1a04; white-space: nowrap; }
  .sole.spento {
    background: radial-gradient(circle at 38% 34%, #6b6253 0%, #4a4136 50%, #2b251d 100%);
    box-shadow: 0 0 10px rgba(120,100,70,0.25); animation: none;
  }
  .sole.spento b, .sole.spento small { color: #d6cbb8; }
  .anello-obiettivo { position: absolute; filter: drop-shadow(0 0 4px rgba(251,191,36,0.5)); }
  .cartiglio { position: absolute; left: 10px; top: 8px; display: flex; flex-direction: column; line-height: 1.1; }
  .cartiglio b { font-size: 17px; font-weight: 700; color: #fde68a; text-shadow: 0 0 10px rgba(251,191,36,0.35); }
  .cartiglio small { font-size: 9px; color: #9aa3b2; letter-spacing: 0.5px; }
  .freccia-scena { position: absolute; top: 95px; background: rgba(0,0,0,0.45); }
  .freccia-scena:disabled { background: transparent; }
  @keyframes respiro { 50% { box-shadow: 0 0 30px rgba(245,158,11,0.8), 0 0 80px rgba(245,158,11,0.3), inset -6px -8px 14px rgba(120,53,15,0.6); } }
  .giro { position: absolute; width: 0; height: 0; animation: gira linear infinite; }
  .contro { animation: gira linear infinite reverse; }
  @keyframes gira { to { transform: rotate(360deg); } }
  .pianeta {
    position: absolute; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 800; color: rgba(0,0,0,0.65);
  }
  .pianeta.alone { animation: alone 2.4s ease-in-out infinite; }
  @keyframes alone { 50% { filter: brightness(1.25); } }
  .asteroide { position: absolute; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #9ca3af, #4b5563); }
  .didascalia {
    position: absolute; right: 8px; bottom: 8px; font-size: 9px; color: #9aa3b2;
    padding: 3px 8px; border-radius: 999px; background: rgba(8,9,12,0.9); border: 1px solid rgba(255,255,255,0.06);
  }

  /* città di notte */
  .notte { background: linear-gradient(180deg, #0a1128 0%, #101a36 60%, #18213d 100%); }
  .luna {
    position: absolute; right: 12px; top: 10px; width: 46px; height: 46px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background:
      radial-gradient(circle at 30% 65%, rgba(120,113,90,0.35) 0 5px, transparent 6px),
      radial-gradient(circle at 70% 30%, rgba(120,113,90,0.30) 0 4px, transparent 5px),
      radial-gradient(circle at 38% 32%, #fffdf2 0%, #ece6cc 55%, #b9b293 100%);
    box-shadow: 0 0 14px rgba(245,240,220,0.45), 0 0 34px rgba(245,240,220,0.15);
  }
  .luna small { font-size: 7px; font-weight: 800; letter-spacing: 0.5px; color: #6b6450; text-transform: uppercase; white-space: nowrap; }
  .luna b { font-size: 10px; font-weight: 800; color: #3f3a2a; white-space: nowrap; }
  .luna.nuova { background: radial-gradient(circle at 38% 32%, #4b5068 0%, #2c3047 60%, #1d2033 100%); box-shadow: 0 0 8px rgba(160,170,210,0.2); }
  .luna.nuova b, .luna.nuova small { color: #b8bfd9; }
  .palazzo {
    position: absolute; bottom: 20px;
    background: linear-gradient(90deg, #1b2747 0%, #23325a 50%, #1a2544 100%);
    border-top-left-radius: 2px; border-top-right-radius: 2px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 -2px 10px rgba(0,0,0,0.3);
  }
  .palazzo.arch { background: linear-gradient(90deg, #161d33 0%, #1c2440 50%, #151c31 100%); }
  .palazzo.attuale { box-shadow: 0 0 0 1.5px #fbbf24, 0 0 18px rgba(251,191,36,0.35); }
  .palazzo.spento { opacity: 0.45; }
  .finestre { position: absolute; left: 5px; right: 5px; bottom: 5px; top: 8px; display: flex; flex-wrap: wrap-reverse; align-content: flex-start; gap: 3px; }
  .finestra { width: calc(50% - 1.5px); height: 5px; border-radius: 1px; background: #121a31; }
  .finestra.accesa {
    background: linear-gradient(180deg, #fde68a, #f59e0b);
    box-shadow: 0 0 6px rgba(251,191,36,0.7);
  }
  .finestra.alta { height: 7px; }
  .finestra.calda { background: linear-gradient(180deg, #b7894a, #7c5a2c); box-shadow: 0 0 3px rgba(251,191,36,0.25); }
  .finestra.lampeggia { animation: lampeggia 1.2s steps(1) infinite; }
  .antenna { position: absolute; left: 80%; bottom: 100%; width: 1.5px; height: 14px; background: #64748b; }
  .antenna::after {
    content: ""; position: absolute; left: -2px; top: -4px; width: 5px; height: 5px; border-radius: 50%;
    background: #ef4444; box-shadow: 0 0 6px #ef4444; animation: lampeggia 1.6s steps(1) infinite;
  }
  .strada { position: absolute; left: 0; right: 0; bottom: 0; height: 20px; background: #0b1020; border-top: 1px solid rgba(255,255,255,0.05); }
  .ore-tetto { position: absolute; left: 0; right: 0; bottom: 100%; margin-bottom: 2px; text-align: center; font-size: 10px; font-weight: 800; text-shadow: 0 0 6px rgba(0,0,0,0.9); }
  .insegna { position: absolute; bottom: 4px; font-size: 9px; font-weight: 700; text-align: center; color: #64748b; }
  .insegna.oggi { color: #fbbf24; }
  .cartellone {
    position: absolute; left: 50%; top: 12px; transform: translateX(-50%);
    padding: 8px 10px 10px; border-radius: 10px; white-space: nowrap;
    background: rgba(10,12,20,0.92); border: 1.5px solid #fbbf24;
    box-shadow: 0 0 16px rgba(251,191,36,0.35), inset 0 0 10px rgba(251,191,36,0.10);
    display: flex; flex-direction: column; align-items: center; gap: 6px;
  }
  .cartellone .targa {
    position: absolute; left: 10px; top: -9px; font-size: 9px; font-weight: 800; letter-spacing: 1px;
    padding: 2px 6px; border-radius: 4px; color: #1c1405; background: #fbbf24;
  }
  .cartellone .oggi-sess { font-size: 10px; color: #9aa3b2; }
  .cartellone .oggi-sess b { color: #fbbf24; }
  .gambe { position: absolute; left: 50%; top: 110px; width: 110px; height: 22px; transform: translateX(-50%); border-left: 2px solid #475569; border-right: 2px solid #475569; }

  /* vinile */
  .giradischi { background: linear-gradient(160deg, #24242a 0%, #17171b 55%, #101013 100%); }
  .piatto {
    position: absolute; left: 12px; top: 44px; width: 170px; height: 170px; border-radius: 50%;
    background: radial-gradient(circle, #2b2b30 0%, #1d1d21 70%, #121214 100%);
    box-shadow: 0 6px 18px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.04);
  }
  .disco {
    position: absolute; left: 4px; top: 4px; width: 162px; height: 162px; border-radius: 50%;
    background:
      conic-gradient(from 30deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.10) 40deg, rgba(255,255,255,0) 80deg,
        rgba(255,255,255,0) 180deg, rgba(255,255,255,0.08) 220deg, rgba(255,255,255,0) 260deg),
      repeating-radial-gradient(circle, #0c0c0d 0px, #0c0c0d 1.5px, #121214 2px, #0c0c0d 2.5px),
      #0b0b0c;
  }
  .disco.gira { animation: gira 6s linear infinite; }
  .disco svg { position: absolute; left: 0; top: 0; }
  .etichetta-disco {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: 66px; height: 66px; border-radius: 50%;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    background: radial-gradient(circle at 40% 35%, #2b2b31, #151519);
    box-shadow: 0 0 0 2px #0b0b0c, 0 0 0 3px rgba(255,255,255,0.06);
    white-space: nowrap;
  }
  .etichetta-disco.grande { width: 100px; height: 100px; }
  .etichetta-disco small { font-size: 7px; font-weight: 700; letter-spacing: 1px; color: #9aa3b2; text-transform: uppercase; }
  .etichetta-disco b { font-size: 12px; font-weight: 700; white-space: nowrap; }
  .etichetta-disco .perno { width: 6px; height: 6px; border-radius: 50%; background: #d4d4d8; box-shadow: inset 0 -1px 1px rgba(0,0,0,0.5); margin-top: 2px; }
  .cifre.piccole { padding: 3px; gap: 2px; border-radius: 8px; }
  .cifre.piccole .cifra { width: 15px; height: 22px; font-size: 15px; border-radius: 4px; }
  .cifre.piccole .due-punti { font-size: 14px; padding: 0 1px; }
  .braccio { position: absolute; left: 222px; top: 40px; width: 0; height: 0; transition: transform 1.2s ease; opacity: 0.85; }
  .braccio.giu { opacity: 1; }
  .braccio .asta { position: absolute; left: -2px; top: 0; width: 4px; height: 112px; border-radius: 2px; background: linear-gradient(90deg, #9ca3af, #e5e7eb, #9ca3af); }
  .braccio .testina { position: absolute; left: -6px; top: 106px; width: 12px; height: 18px; border-radius: 3px; background: linear-gradient(180deg, #3f3f46, #18181b); border: 1px solid #52525b; }
  .braccio .fulcro {
    position: absolute; left: -11px; top: -11px; width: 22px; height: 22px; border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, #e5e7eb, #6b7280 60%, #374151);
    box-shadow: 0 2px 6px rgba(0,0,0,0.6);
  }
  .termina {
    position: absolute; right: 8px; bottom: 8px; border: none; cursor: pointer;
    padding: 6px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; letter-spacing: 1px;
    color: #fecaca; background: linear-gradient(180deg, #7f1d1d, #5b1414);
  }
  .cartiglio.riga b { display: inline; }
  .cartiglio.riga .testa-cartiglio { display: flex; align-items: baseline; gap: 6px; }
  .tracce { display: flex; gap: 6px; margin-top: 3px; font-size: 9px; color: #9aa3b2; }
  .tracce span { display: flex; align-items: center; gap: 3px; white-space: nowrap; }
  .cartiglio .tracce b { font-size: 9px; color: #e6e8ee; text-shadow: none; }
  .tracce i { width: 6px; height: 6px; border-radius: 50%; }
  .tracce b { color: #e6e8ee; }
  .tracce .in-corso { color: #e6e8ee; }

  /* cronometro flip */
  .crono {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    white-space: nowrap;
  }
  .crono .etichetta { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #fbbf24; text-transform: uppercase; }
  .cifre { display: flex; align-items: center; gap: 3px; padding: 6px; border-radius: 12px; background: rgba(0,0,0,0.55); }
  .cifra {
    position: relative; width: 24px; height: 36px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 700; color: #f5f5f4;
    background: linear-gradient(180deg, #2a2f3a 0%, #222631 50%, #1a1d26 50%, #14171e 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.5);
  }
  .cifra::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(0,0,0,0.6); }
  .due-punti { font-size: 22px; font-weight: 800; color: #fbbf24; padding: 0 2px; animation: lampeggia 1s steps(1) infinite; }
  @keyframes lampeggia { 50% { opacity: 0.3; } }
  .crono .oggi-sess { font-size: 11px; color: #9aa3b2; }
  .crono .oggi-sess b { color: #2dd4bf; }
  .stop {
    border: none; cursor: pointer; padding: 7px 16px; border-radius: 999px;
    font-size: 11px; font-weight: 800; letter-spacing: 1px; color: #fecaca;
    background: linear-gradient(180deg, #7f1d1d, #5b1414);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 8px rgba(127,29,29,0.5);
  }
  .stop:hover { filter: brightness(1.2); }

  /* giorno e obiettivo */
  .barra {
    display: flex; align-items: center; gap: 8px; padding: 6px; margin-bottom: 8px;
    border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  }
  .freccia {
    width: 30px; height: 30px; border: none; border-radius: 10px; cursor: pointer; padding: 0;
    font-size: 16px; color: #cbd5e1; background: rgba(255,255,255,0.06);
  }
  .freccia:hover { background: rgba(255,255,255,0.12); }
  .freccia:disabled { color: #3a3f4a; background: transparent; cursor: default; }
  .giorno { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: #9aa3b2; }
  .giorno .ore {
    font-size: 14px; font-weight: 700; color: #2dd4bf; padding: 4px 10px; border-radius: 10px;
    background: rgba(45,212,191,0.08); border: 1px solid rgba(45,212,191,0.30);
  }
  .giorno .ore.vuoto { color: #4b5160; background: transparent; border-color: rgba(255,255,255,0.06); }
  .obiettivo { padding: 8px 10px; margin-bottom: 8px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); }
  .obiettivo .riga { display: flex; justify-content: space-between; font-size: 11px; color: #9aa3b2; margin-bottom: 6px; }
  .obiettivo .riga b { color: #e6e8ee; }
  .traccia { height: 5px; border-radius: 3px; background: rgba(255,255,255,0.06); overflow: hidden; }
  .riempi { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #2dd4bf, #fbbf24); }

  /* materie */
  .materia {
    display: flex; align-items: center; gap: 10px; padding: 8px 10px; margin-bottom: 6px;
    border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  }
  .materia.oggi { border-color: rgba(45,212,191,0.35); background: rgba(45,212,191,0.05); }
  .play {
    flex: none; width: 30px; height: 30px; border: none; border-radius: 10px; cursor: pointer; padding: 0 0 0 2px;
    font-size: 11px; color: #cbd5e1; background: linear-gradient(180deg, #2a2f3a, #1c2029);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.5);
  }
  .materia.oggi .play { color: #06231f; background: linear-gradient(180deg, #5eead4, #14b8a6); }
  .play:hover { filter: brightness(1.25); }
  .nome { flex: 1; min-width: 0; }
  .nome .sigla { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; }
  .nome .sigla i { width: 8px; height: 8px; border-radius: 50%; }
  .nome .esteso { font-size: 10px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .conti { text-align: right; }
  .conti .tot { font-size: 14px; font-weight: 700; }
  .conti .di-oggi { font-size: 10px; color: #2dd4bf; margin-top: 2px; }
  .conti .di-oggi.zero { color: #4b5160; }
  .materia.vecchia { opacity: 0.55; }

  .archivio { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #6b7280; padding: 4px 6px; cursor: pointer; }
  .archivio:hover { color: #9aa3b2; }
  .piede { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 6px 2px; font-size: 11px; color: #6b7280; }
  .piede b { font-size: 13px; color: #e6e8ee; }
  .idle { font-size: 11px; color: #6b7280; padding: 8px; }
`;

function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

// etichetta corta per pianeti e sole: 117h, 45m
function corto(sec) {
  return sec >= 3600 ? `${Math.floor(sec / 3600)}h` : `${Math.floor(sec / 60)}m`;
}

// data locale in formato AAAA-MM-GG, come le chiavi di "giorni"
function giorno(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// "oggi", "ieri", altrimenti "ven 30 ott"
function etichetta(d, indietro) {
  if (indietro === 0) return "oggi";
  if (indietro === 1) return "ieri";
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" });
}

// apice singolo per la shell: regge anche materie con spazi
const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

// prima la posizione del trascinamento in corso, poi quella salvata su file
// (sopravvive ai riavvii di Übersicht), poi un angolo di default
function posizione(salvata) {
  try {
    const live = JSON.parse(localStorage.getItem(CHIAVE_POSIZIONE));
    if (live) return live;
  } catch (e) {}
  return salvata && salvata.x !== undefined ? salvata : { x: 40, y: 40 };
}

// si trascina dalla testata; durante il movimento la posizione va in
// localStorage, così il refresh di ogni secondo non la riporta indietro,
// e al rilascio si salva su file
function trascina(e) {
  if (e.target.closest(".pillola")) return;
  const card = e.currentTarget.closest(".card");
  const dx = e.clientX - card.offsetLeft;
  const dy = e.clientY - card.offsetTop;
  const muovi = (ev) => {
    const pos = { x: ev.clientX - dx, y: ev.clientY - dy };
    card.style.left = `${pos.x}px`;
    card.style.top = `${pos.y}px`;
    try {
      localStorage.setItem(CHIAVE_POSIZIONE, JSON.stringify(pos));
    } catch (err) {}
  };
  const lascia = () => {
    window.removeEventListener("mousemove", muovi);
    window.removeEventListener("mouseup", lascia);
    run(`${STUDIO} ui x ${card.offsetLeft} y ${card.offsetTop}`);
  };
  window.addEventListener("mousemove", muovi);
  window.addEventListener("mouseup", lascia);
}

// stelline fisse dello sfondo: sempre nello stesso posto, niente Math.random
const STELLINE = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 73) % 252,
  y: (i * 41 + (i % 3) * 17) % 214,
}));

// ---------- scene del sistema solare ----------

const CX = 128; // centro della scena (larghezza utile ~256)
const CY = 110;
// giorni passati tra due date AAAA-MM-GG
function distanza(a, b) {
  const data = (k) => {
    const [y, m, g] = k.split("-").map(Number);
    return new Date(y, m - 1, g);
  };
  return Math.round((data(b) - data(a)) / 86400000);
}

// l'orbita dice da quanto non studi una materia: vicino al sole = studiata da poco
const orbita = (giorniFa) => (giorniFa === null ? 96 : 60 + Math.min(giorniFa, 8) * 4.5);

// in AAAA-MM-GG -> "28 set"
const breve = (k) => {
  const [y, m, g] = k.split("-").map(Number);
  return new Date(y, m - 1, g).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
};

const Stelline = () =>
  STELLINE.map((s, i) => <div key={i} className="stellina" style={{ left: s.x, top: s.y }} />);

// un pianeta che gira: il contenitore ruota, l'etichetta controruota per restare dritta
const Pianeta = ({ r, d, colore, angolo, durata, testo, alone, titolo }) => {
  const ritardo = `-${(angolo / 360) * durata}s`;
  const stile = { animationDuration: `${durata}s`, animationDelay: ritardo };
  return (
    <div className="giro" style={{ left: CX, top: CY, ...stile }}>
      <div className="contro" title={titolo} style={{ ...stile, position: "absolute", left: r - d / 2, top: -d / 2, width: d, height: d }}>
        <div
          className={"pianeta" + (alone ? " alone" : "")}
          style={{
            left: 0,
            top: 0,
            width: d,
            height: d,
            background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${colore} 35%, ${colore} 60%, rgba(0,0,0,0.55) 100%)`,
            boxShadow: alone ? `0 0 10px ${colore}, 0 0 22px ${colore}` : `0 0 6px rgba(0,0,0,0.6)`,
          }}
        >
          {d >= 22 ? testo : null}
        </div>
      </div>
    </div>
  );
};

// la scena è un giorno: il sole sono le ore di quel giorno (con l'anello dell'obiettivo),
// i pianeti sono grandi quanto le ore accumulate dall'inizio fino a quel giorno
const ScenaSolare = ({ attive, vecchie, totali, colore, giorni, chiave, quando, obiettivo, inizio, puoiPrima, puoiDopo, prima, dopo }) => {
  const date = Object.keys(giorni)
    .filter((k) => !inizio || k >= inizio)
    .sort();
  const cumulo = (m, fino) => date.filter((k) => k <= fino).reduce((a, k) => a + (giorni[k][m] || 0), 0);
  const ultima = (m) => {
    const fatte = date.filter((k) => k <= chiave && (giorni[k][m] || 0) > 0);
    return fatte.length ? fatte[fatte.length - 1] : null;
  };
  // la scala la dà oggi: tornando indietro il sistema si rimpicciolisce
  const oggiK = giorno(new Date());
  const massimo = Math.max(1, ...attive.map((m) => cumulo(m, oggiK)));
  const delGiorno = giorni[chiave] || {};
  const oreGiorno = Object.values(delGiorno).reduce((a, b) => a + b, 0);
  const anello = 2 * Math.PI * 40;
  const quota = obiettivo > 0 ? Math.min(1, oreGiorno / obiettivo) : 0;

  const pianeti = attive
    .map((m, i) => {
      const ore = cumulo(m, chiave);
      const u = ultima(m);
      const fa = u ? distanza(u, chiave) : null;
      return { m, i, ore, fa, r: orbita(fa) };
    })
    .filter((p) => p.ore > 0); // prima della prima ora la materia non è ancora nata

  return (
    <div className="scena spazio">
      <Stelline />
      {[...new Set(pianeti.map((p) => p.r))].map((r) => (
        <div key={r} className="orbita" style={{ left: CX - r, top: CY - r, width: 2 * r, height: 2 * r }} />
      ))}
      {vecchie.map((m, i) => {
        const a = ((i * 360) / vecchie.length + 20) * (Math.PI / 180);
        const d = 4 + 4 * Math.sqrt(totali[m] / Math.max(1, totali[vecchie[0]]));
        return (
          <div
            key={m}
            className="asteroide"
            title={`${m} · ${fmt(totali[m])}`}
            style={{ left: CX + 118 * Math.cos(a) - d / 2, top: CY + 98 * Math.sin(a) - d / 2, width: d, height: d }}
          />
        );
      })}
      {pianeti.map((p) => (
        <Pianeta
          key={p.m}
          r={p.r}
          d={12 + 18 * Math.sqrt(p.ore / massimo)}
          colore={colore(p.m)}
          angolo={(p.i * 137) % 360}
          durata={18 + p.r * 0.45}
          testo={corto(p.ore)}
          alone={(delGiorno[p.m] || 0) > 0}
          titolo={`${p.m} · ${fmt(p.ore)} · ${p.fa === 0 ? "studiata quel giorno" : `${p.fa} giorni dall'ultima volta`}`}
        />
      ))}
      {obiettivo > 0 ? (
        <svg className="anello-obiettivo" width="92" height="92" style={{ left: CX - 46, top: CY - 46 }}>
          <circle cx="46" cy="46" r="40" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="3" />
          <circle
            cx="46"
            cy="46"
            r="40"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${quota * anello} ${anello}`}
            transform="rotate(-90 46 46)"
          />
        </svg>
      ) : null}
      <div className={"sole" + (oreGiorno ? "" : " spento")} style={{ left: CX - 32, top: CY - 32 }}>
        <b className="mono">{oreGiorno ? fmt(oreGiorno) : "—"}</b>
        <small>{quando}</small>
      </div>
      <button className="freccia freccia-scena" style={{ left: 4 }} disabled={!puoiPrima} onClick={prima} title="Giorno prima">
        ‹
      </button>
      <button className="freccia freccia-scena" style={{ right: 4 }} disabled={!puoiDopo} onClick={dopo} title="Giorno dopo">
        ›
      </button>
      <div className="cartiglio">
        <b className="mono">{fmt(pianeti.reduce((a, q) => a + q.ore, 0))}</b>
        <small>{inizio ? `totale dal ${breve(inizio)}` : "totale"}</small>
      </div>
      <div className="didascalia" style={{ left: 8, right: "auto" }}>
        vicino = studiata da poco
      </div>
    </div>
  );
};

// cifre flip: 39:12 oppure 1:05:33
const Cifre = ({ sec, piccole }) => {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  const gruppi = h > 0 ? [String(h), mm, ss] : [mm, ss];
  const pezzi = [];
  gruppi.forEach((g, i) => {
    if (i > 0) pezzi.push(<span key={`p${i}`} className="due-punti">:</span>);
    g.split("").forEach((c, j) =>
      pezzi.push(
        <span key={`${i}-${j}`} className="cifra mono">
          {c}
        </span>
      )
    );
  });
  return <div className={"cifre" + (piccole ? " piccole" : "")}>{pezzi}</div>;
};

const CronoSolare = ({ sess, durataSess, oggiTot, colore }) => (
  <div className="scena spazio">
    <Stelline />
    <div className="orbita" style={{ left: CX - 100, top: CY - 100, width: 200, height: 200 }} />
    <Pianeta r={100} d={22} colore={colore(sess.materia)} angolo={0} durata={30} testo={sess.materia.slice(0, 3)} alone />
    <div className="crono">
      <span className="etichetta">● {sess.materia} · in corso</span>
      <Cifre sec={durataSess} />
      <span className="oggi-sess">
        oggi con questa sessione: <b className="mono">{fmt(oggiTot)}</b>
      </span>
      <button className="stop" onClick={() => run(`${STUDIO} stop`)}>
        ■ STOP E SALVA
      </button>
    </div>
  </div>
);

// ---------- scene della città di notte ----------

// durante una sessione: un palazzo per materia attiva più uno per tutto l'archivio,
// alti quanto le ore totali, con le finestre accese di oggi
function palazzi(attive, vecchie, totali, oggi) {
  const lista = attive.slice(0, 4).map((m) => ({ id: m, sigla: m, ore: totali[m], oggi: oggi[m] || 0, luce: 1 }));
  if (vecchie.length > 0) {
    const og = vecchie.reduce((a, m) => a + (oggi[m] || 0), 0);
    lista.push({ id: "__archivio", sigla: "Arch.", ore: 0, oggi: og, luce: 1, archivio: true });
  }
  return lista;
}

// p = { id, sigla, ore (altezza), oggi (finestre accese), luce (0..1), archivio }
// con p.luci il palazzo è fatto solo di luci: p.luci finestre accese, le ultime p.nuove gialle
const Citta = ({ lista, attuale, alti, colore, scala }) => {
  // la scala la fanno le materie attive: l'archivio somma anni di ore e le schiaccerebbe,
  // quindi il suo palazzo ha un'altezza fissa
  const attivi = lista.filter((p) => !p.archivio);
  const massimo = scala || Math.max(1, ...attivi.map((p) => p.ore));
  const passo = (256 - 68) / Math.max(1, lista.length);
  const largo = Math.min(40, passo - 8);
  const piuAlto = attivi.reduce((a, p) => (p.ore > a.ore ? p : a), attivi[0] || {});
  return (
    <div>
      <div className="strada" />
      {lista.map((p, i) => {
        const aPiani = p.luci !== undefined;
        // un piano = due finestre; il palazzo sale quando il piano sotto è pieno
        const h = p.archivio
          ? aPiani || lista.some((q) => q.luci !== undefined)
            ? 30
            : alti * 0.55
          : aPiani
          ? Math.max(26, 17 + Math.ceil(p.luci / 2) * 10)
          : 26 + (alti - 26) * Math.sqrt(Math.min(1, p.ore / massimo));
        const posti = aPiani ? Math.max(2, Math.ceil(p.luci / 2) * 2) : Math.max(2, Math.floor((h - 13) / 8) * 2);
        const accese = aPiani ? p.luci : Math.min(posti, Math.ceil(p.oggi / 3600)); // 1 finestra = 1 ora (o frazione)
        const calde = aPiani ? p.luci - p.nuove : 0; // accese prima del giorno guardato
        const left = 34 + i * passo + (passo - largo) / 2;
        const qui = p.id === attuale;
        return (
          <div key={p.id}>
            <div
              className={
                "palazzo" + (p.archivio ? " arch" : "") + (qui ? " attuale" : "") + (attuale && !qui ? " spento" : "")
              }
              style={{ left, width: largo, height: h, filter: `brightness(${0.45 + 0.55 * p.luce})` }}
              title={p.titolo || `${p.sigla} · ${fmt(p.ore)}`}
            >
              {p === piuAlto ? <div className="antenna" /> : null}
              {p.archivio ? null : (
                <div className="ore-tetto mono" style={{ color: colore(p.id) }}>
                  {corto(p.ore)}
                </div>
              )}
              <div className="finestre">
                {Array.from({ length: posti }, (_, k) => (
                  <i
                    key={k}
                    className={
                      "finestra" +
                      (aPiani ? " alta" : "") +
                      (k < calde ? " calda" : k < accese ? " accesa" : "") +
                      (qui && k === Math.max(0, accese - 1) ? " lampeggia" : "")
                    }
                  />
                ))}
              </div>
            </div>
            <div className={"insegna" + (p.oggi > 0 ? " oggi" : "")} style={{ left, width: largo }}>
              {p.sigla.slice(0, 5)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// la luna fa da sole della città: le ore del giorno guardato, con l'anello dell'obiettivo
const Luna = ({ ore, quando, obiettivo }) => {
  const giro = 2 * Math.PI * 29;
  const quota = obiettivo > 0 ? Math.min(1, ore / obiettivo) : 0;
  return (
    <div>
      {obiettivo > 0 ? (
        <svg className="anello-obiettivo" width="64" height="64" style={{ right: 3, top: 1 }}>
          <circle cx="32" cy="32" r="29" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="2.5" />
          <circle
            cx="32"
            cy="32"
            r="29"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${quota * giro} ${giro}`}
            transform="rotate(-90 32 32)"
          />
        </svg>
      ) : null}
      <div className={"luna" + (ore ? "" : " nuova")}>
        <b className="mono">{ore ? fmt(ore) : "—"}</b>
        <small>{quando}</small>
      </div>
    </div>
  );
};

// la scena è un giorno, come nel Solare: palazzi alti quanto le ore accumulate dall'inizio,
// finestre accese = ore di quel giorno, palazzo spento = materia trascurata da giorni
const ScenaCitta = ({ attive, vecchie, colore, giorni, chiave, quando, obiettivo, inizio, puoiPrima, puoiDopo, prima, dopo }) => {
  const date = Object.keys(giorni)
    .filter((k) => !inizio || k >= inizio)
    .sort();
  const cumulo = (m, fino) => date.filter((k) => k <= fino).reduce((a, k) => a + (giorni[k][m] || 0), 0);
  const ultima = (m) => {
    const fatte = date.filter((k) => k <= chiave && (giorni[k][m] || 0) > 0);
    return fatte.length ? fatte[fatte.length - 1] : null;
  };
  const delGiorno = giorni[chiave] || {};
  const oreGiorno = Object.values(delGiorno).reduce((a, b) => a + b, 0);
  // la scala la dà oggi: tornando indietro la città si abbassa
  const scala = Math.max(1, ...attive.map((m) => cumulo(m, giorno(new Date()))));

  // quante ore vale una finestra: 1h finché il palazzo più alto di oggi sta nella scena
  const POSTI = 22;
  const unita = Math.max(1, Math.ceil(scala / 3600 / POSTI)) * 3600;

  const lista = attive
    .slice(0, 4)
    .map((m) => {
      const u = ultima(m);
      const fa = u ? distanza(u, chiave) : null;
      const ore = cumulo(m, chiave);
      const luci = Math.ceil(ore / unita);
      return {
        id: m,
        sigla: m,
        ore,
        luci,
        nuove: Math.min(luci, Math.ceil((delGiorno[m] || 0) / unita)),
        oggi: delGiorno[m] || 0,
        luce: fa === null ? 0 : 1 - Math.min(fa, 8) / 8,
        titolo: `${m} · ${fmt(cumulo(m, chiave))} · ${fa === 0 ? "studiata quel giorno" : `${fa} giorni dall'ultima volta`}`,
      };
    })
    .filter((p) => p.ore > 0); // prima della prima ora il palazzo non è ancora costruito
  if (vecchie.length > 0) {
    lista.push({ id: "__archivio", sigla: "Arch.", ore: 0, oggi: 0, luce: 0.4, archivio: true });
  }
  const totale = lista.reduce((a, p) => a + p.ore, 0);

  return (
    <div className="scena notte">
      <Stelline />
      <Luna ore={oreGiorno} quando={quando} obiettivo={obiettivo} />
      <Citta lista={lista} alti={128} colore={colore} scala={scala} />
      <div className="cartiglio">
        <b className="mono">{fmt(totale)}</b>
        <small>{inizio ? `totale dal ${breve(inizio)}` : "totale"}</small>
        <small>▮ = {unita / 3600}h · giallo = quel giorno</small>
        <small>buio = trascurata</small>
      </div>
      <button className="freccia freccia-scena" style={{ left: 4 }} disabled={!puoiPrima} onClick={prima} title="Giorno prima">
        ‹
      </button>
      <button className="freccia freccia-scena" style={{ right: 4 }} disabled={!puoiDopo} onClick={dopo} title="Giorno dopo">
        ›
      </button>
    </div>
  );
};

const CronoCitta = ({ sess, durataSess, oggiTot, attive, vecchie, totali, oggi, colore, obiettivo }) => (
  <div className="scena notte">
    <Stelline />
    <Luna ore={oggiTot} quando="oggi" obiettivo={obiettivo} />
    <Citta lista={palazzi(attive, vecchie, totali, oggi)} attuale={sess.materia} alti={80} colore={colore} />
    <div className="gambe" />
    <div className="cartellone">
      <span className="targa">{sess.materia}</span>
      <Cifre sec={durataSess} />
      <span className="oggi-sess">
        oggi: <b className="mono">{fmt(oggiTot)}</b>
      </span>
      <button className="stop" onClick={() => run(`${STUDIO} stop`)}>
        ■ INTERROMPI
      </button>
    </div>
  </div>
);

// ---------- giradischi ----------

// il disco si incide man mano: un solco per settimana dall'inizio, dall'esterno verso il centro;
// su ogni solco un arco per materia, lungo quanto ci hai studiato quella settimana
const Solchi = ({ solchi, colore, pieno, spessore }) => {
  const c = 81; // centro dell'svg (disco da 162px)
  return (
    <svg width="162" height="162" viewBox="0 0 162 162">
      {solchi.map((g, i) => {
        const giro = 2 * Math.PI * g.r;
        let fatto = 0;
        return (
          <g key={i} transform={`rotate(-90 ${c} ${c})`}>
            <circle
              cx={c}
              cy={c}
              r={g.r}
              fill="none"
              stroke={g.vista ? "rgba(251,191,36,0.30)" : "rgba(255,255,255,0.09)"}
              strokeWidth={spessore + 1.5}
            />
            {Object.entries(g.ore).map(([m, sec]) => {
              const lungo = Math.min(giro - fatto, (sec / pieno) * giro);
              const arco = (
                <circle
                  key={m}
                  cx={c}
                  cy={c}
                  r={g.r}
                  fill="none"
                  stroke={colore(m)}
                  strokeWidth={spessore}
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0, lungo - 2)} ${giro}`}
                  strokeDashoffset={-fatto}
                  opacity={g.vista ? 1 : 0.8}
                />
              );
              fatto += lungo;
              return arco;
            })}
          </g>
        );
      })}
    </svg>
  );
};

// l'angolo del braccio che porta la puntina sul solco di raggio r
// (fulcro a 222,40 nella scena, puntina a 115px dal fulcro, centro del disco a 97,129)
function angoloBraccio(r) {
  let migliore = 0;
  let errore = Infinity;
  for (let a = 0; a <= 60; a += 0.25) {
    const t = (a * Math.PI) / 180;
    const x = 222 - 115 * Math.sin(t);
    const y = 40 + 115 * Math.cos(t);
    const e = Math.abs(Math.hypot(x - 97, y - 129) - r);
    if (e < errore) [migliore, errore] = [a, e];
  }
  return migliore;
}

const Giradischi = ({ attive, colore, giorni, chiave, quando, obiettivo, inizio, puoiPrima, puoiDopo, prima, dopo, sess, durataSess, oggiTot }) => {
  const oggiK = giorno(new Date());
  const date = Object.keys(giorni)
    .filter((k) => !inizio || k >= inizio)
    .sort();
  const base = inizio || date[0] || oggiK;
  const settimana = (k) => Math.floor(distanza(base, k) / 7);
  const solchiOggi = settimana(oggiK) + 1;
  const visti = chiave < base ? 0 : settimana(chiave) + 1;

  // ore per settimana e materia, fino al giorno guardato
  const ore = Array.from({ length: solchiOggi }, () => ({}));
  date.forEach((k) => {
    if (k > oggiK) return;
    Object.entries(giorni[k]).forEach(([m, sec]) => {
      if (!attive.includes(m)) return;
      const w = settimana(k);
      ore[w][m] = (ore[w][m] || 0) + (k <= chiave ? sec : 0);
    });
  });
  const passo = Math.min(8, 34 / Math.max(1, solchiOggi));
  const raggio = (w) => 74 - w * passo;
  const solchi = ore.slice(0, visti).map((o, w) => ({ r: raggio(w), ore: o, vista: w === visti - 1 }));

  // un giro intero = l'obiettivo di una settimana (o la settimana migliore, se è di più)
  const settimaneFinoAOggi = Array.from({ length: solchiOggi }, () => 0);
  date.forEach((k) => {
    if (k <= oggiK)
      settimaneFinoAOggi[settimana(k)] += Object.entries(giorni[k])
        .filter(([m]) => attive.includes(m))
        .reduce((a, [, v]) => a + v, 0);
  });
  const pieno = Math.max((obiettivo || 0) * 7, ...settimaneFinoAOggi, 1);

  const delGiorno = giorni[chiave] || {};
  const oreGiorno = Object.values(delGiorno).reduce((a, b) => a + b, 0);
  const cumulo = (m) => date.filter((k) => k <= chiave).reduce((a, k) => a + (giorni[k][m] || 0), 0);
  const totale = attive.reduce((a, m) => a + cumulo(m), 0);
  const anello = 2 * Math.PI * 36;
  const quota = obiettivo > 0 ? Math.min(1, (sess ? oggiTot : oreGiorno) / obiettivo) : 0;
  const braccio = visti > 0 ? angoloBraccio(raggio(visti - 1)) : 0;

  return (
    <div className="scena giradischi">
      <div className="piatto">
        <div className={"disco" + (sess ? " gira" : "")}>
          <Solchi solchi={solchi} colore={colore} pieno={pieno} spessore={Math.max(1.5, Math.min(4.5, passo - 3))} />
        </div>
        {obiettivo > 0 ? (
          <svg className="anello-obiettivo" width="80" height="80" style={{ left: 45, top: 45 }}>
            <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(251,191,36,0.15)" strokeWidth="2.5" />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${quota * anello} ${anello}`}
              transform="rotate(-90 40 40)"
            />
          </svg>
        ) : null}
        {sess ? (
          <div className="etichetta-disco grande">
            <small style={{ color: colore(sess.materia) }}>● {sess.materia}</small>
            <Cifre sec={durataSess} piccole />
            <small>oggi {fmt(oggiTot)}</small>
          </div>
        ) : (
          <div className="etichetta-disco">
            <b className="mono">{oreGiorno ? fmt(oreGiorno) : "—"}</b>
            <small>{quando}</small>
            <span className="perno" />
          </div>
        )}
      </div>
      <div className={"braccio" + (sess ? " giu" : "")} style={{ transform: `rotate(${braccio}deg)` }}>
        <div className="asta" />
        <div className="testina" />
        <div className="fulcro" />
      </div>
      <div className="cartiglio riga">
        <div className="testa-cartiglio">
          <b className="mono">{fmt(totale)}</b>
          <small>{inizio ? `dal ${breve(inizio)} · 1 solco = 1 settimana` : "1 solco = 1 settimana"}</small>
        </div>
        <div className="tracce">
          {attive.map((m) => (
            <span key={m} className={sess && sess.materia === m ? "in-corso" : ""}>
              <i style={{ background: colore(m) }} />
              {m.slice(0, 5)} <b className="mono">{corto(cumulo(m))}</b>
            </span>
          ))}
        </div>
      </div>
      {sess ? (
        <button className="termina" onClick={() => run(`${STUDIO} stop`)}>
          ■ TERMINA
        </button>
      ) : (
        <div>
          <button className="freccia freccia-scena" style={{ left: 4, top: 184 }} disabled={!puoiPrima} onClick={prima} title="Giorno prima">
            ‹
          </button>
          <button className="freccia freccia-scena" style={{ right: 4, top: 184 }} disabled={!puoiDopo} onClick={dopo} title="Giorno dopo">
            ›
          </button>
        </div>
      )}
    </div>
  );
};

// ---------- pezzi comuni a tutte le viste ----------

const Materia = ({ mat, sec, diOggi, colore, esteso, vecchia }) => (
  <div className={"materia" + (diOggi > 0 ? " oggi" : "") + (vecchia ? " vecchia" : "")}>
    <button className="play" title={`Avvia ${mat}`} onClick={() => run(`${STUDIO} start ${q(mat)}`)}>
      ▶
    </button>
    <div className="nome">
      <div className="sigla">
        <i style={{ background: colore }} />
        {mat}
      </div>
      {esteso ? <div className="esteso">{esteso}</div> : null}
    </div>
    <div className="conti">
      <div className="tot mono">{fmt(sec)}</div>
      <div className={"di-oggi mono" + (diOggi > 0 ? "" : " zero")}>{diOggi > 0 ? `+${fmt(diOggi)}` : "—"}</div>
    </div>
  </div>
);

export const render = (state, dispatch) => {
  let data;
  try {
    data = JSON.parse(state.output);
  } catch (e) {
    const pos = posizione();
    return (
      <div className="card" style={{ left: pos.x, top: pos.y }}>
        <div className="testa" onMouseDown={trascina}>
          <span className="title">Ore di studio</span>
        </div>
        <div className="idle">{state.error ? `errore: ${state.error}` : "in attesa dei dati…"}</div>
      </div>
    );
  }

  const ui = data.ui || {};
  const pref = data.preferenze || {};
  const nomi = pref.nomi || {};
  const pos = posizione(ui);
  const vista = VISTE.find((v) => v.id === (state.vista || ui.vista)) || VISTE[0];

  const totali = { ...(data.totali || {}) };
  const giorni = data.giorni || {};
  const sess = data.sessione;
  const now = Date.now() / 1000;

  // il giorno che si sta guardando; indietro ci si ferma al primo registrato
  const visto = new Date();
  visto.setDate(visto.getDate() - state.indietro);
  const chiave = giorno(visto);
  const primo = pref.inizio || Object.keys(giorni).sort()[0] || giorno(new Date());
  const oggi = { ...(giorni[chiave] || {}) };

  // la sessione aperta conta live: nel totale tutta, nel giorno solo da mezzanotte
  let durataSess = 0;
  const oggiLive = { ...(giorni[giorno(new Date())] || {}) };
  if (sess && sess.materia && sess.start) {
    durataSess = now - sess.start;
    totali[sess.materia] = (totali[sess.materia] || 0) + durataSess;
    const mezzanotte = new Date().setHours(0, 0, 0, 0) / 1000;
    const diOggi = now - Math.max(sess.start, mezzanotte);
    oggiLive[sess.materia] = (oggiLive[sess.materia] || 0) + diOggi;
    if (state.indietro === 0) oggi[sess.materia] = (oggi[sess.materia] || 0) + diOggi;
  }

  const totale = Object.values(totali).reduce((a, b) => a + b, 0);
  const totaleOggi = Object.values(oggi).reduce((a, b) => a + b, 0);
  const vuoto = Object.keys(oggi).length === 0;

  // attive nell'ordine scelto; le altre in archivio, dalla più studiata
  const attive = (data.attive || []).filter((m) => m in totali);
  const vecchie = Object.keys(totali)
    .filter((m) => !attive.includes(m))
    .sort((a, b) => totali[b] - totali[a]);
  const colore = (m) => (attive.includes(m) ? COLORI[attive.indexOf(m) % COLORI.length] : "#6b7280");

  // in tutte le viste il giorno e l'obiettivo stanno dentro la scena (tranne mentre studi)
  const scenaGiorno = ["solare", "citta", "vinile"].includes(vista.id) && !(sess && state.indietro === 0);

  const prossima = VISTE[(VISTE.indexOf(vista) + 1) % VISTE.length];
  const cambiaVista = () => {
    dispatch({ type: "VISTA", vista: prossima.id });
    run(`${STUDIO} ui vista ${prossima.id}`);
  };

  return (
    <div className="card" style={{ left: pos.x, top: pos.y }}>
      <div className="testa" onMouseDown={trascina}>
        <span className="maniglia">
          <i />
          <i />
        </span>
        <span className="title">Ore di studio</span>
        {sess ? (
          <span className="pillola live">● {sess.materia} focus</span>
        ) : (
          <span className="pillola" title="Cambia tema" onClick={cambiaVista}>
            {vista.icona} {vista.nome}
          </span>
        )}
      </div>

      {(() => {
        // nelle scene il totale è quello delle materie attive; quello di sempre resta nel piede
        const totAttive = attive.reduce((a, m) => a + totali[m], 0);
        const dati = { attive, vecchie, totali, oggi, colore, totale: totAttive };
        const studio = sess && state.indietro === 0;
        const crono = { sess, durataSess, oggiTot: totaleOggi, ...dati };
        const giornoScelto = {
          giorni: { ...giorni, [giorno(new Date())]: oggiLive },
          chiave,
          quando: etichetta(visto, state.indietro),
          obiettivo: pref.obiettivo,
          inizio: pref.inizio,
          puoiPrima: chiave > primo,
          puoiDopo: state.indietro > 0,
          prima: () => dispatch({ type: "GIORNO_PRIMA" }),
          dopo: () => dispatch({ type: "GIORNO_DOPO" }),
        };
        if (vista.id === "citta")
          return studio ? <CronoCitta {...crono} obiettivo={pref.obiettivo} /> : <ScenaCitta {...dati} {...giornoScelto} />;
        if (vista.id === "vinile")
          return (
            <Giradischi
              {...dati}
              {...giornoScelto}
              sess={studio ? sess : null}
              durataSess={durataSess}
              oggiTot={Object.values(oggiLive).reduce((a, b) => a + b, 0)}
            />
          );
        if (studio) return <CronoSolare {...crono} />;
        return <ScenaSolare {...dati} {...giornoScelto} />;
      })()}

      {scenaGiorno ? null : (
      <div className="barra">
        <button
          className="freccia"
          title="Giorno prima"
          disabled={chiave <= primo}
          onClick={() => dispatch({ type: "GIORNO_PRIMA" })}
        >
          ‹
        </button>
        <div className="giorno">
          {etichetta(visto, state.indietro)}
          <span className={"ore mono" + (vuoto ? " vuoto" : "")}>{vuoto ? "nessun dato" : fmt(totaleOggi)}</span>
        </div>
        <button
          className="freccia"
          title="Giorno dopo"
          disabled={state.indietro === 0}
          onClick={() => dispatch({ type: "GIORNO_DOPO" })}
        >
          ›
        </button>
      </div>
      )}

      {pref.obiettivo > 0 && !scenaGiorno ? (
        <div className="obiettivo">
          <div className="riga">
            <span>Obiettivo giornaliero</span>
            <span className="mono">
              <b>{fmt(totaleOggi)}</b> / {fmt(pref.obiettivo)}
            </span>
          </div>
          <div className="traccia">
            <div className="riempi" style={{ width: `${Math.min(100, (100 * totaleOggi) / pref.obiettivo)}%` }} />
          </div>
        </div>
      ) : null}

      {attive
        .filter((m) => !sess || m !== sess.materia)
        .map((m) => (
          <Materia key={m} mat={m} sec={totali[m]} diOggi={oggi[m] || 0} colore={colore(m)} esteso={nomi[m]} />
        ))}

      {vecchie.length > 0 ? (
        <div className="archivio" onClick={() => dispatch({ type: "ARCHIVIO" })}>
          {state.archivio ? "▾" : "▸"} archivio ({vecchie.length})
        </div>
      ) : null}
      {state.archivio
        ? vecchie
            .filter((m) => !sess || m !== sess.materia)
            .map((m) => (
              <Materia
                key={m}
                mat={m}
                sec={totali[m]}
                diOggi={oggi[m] || 0}
                colore={colore(m)}
                esteso={nomi[m]}
                vecchia
              />
            ))
        : null}

      <div className="piede">
        <span>Totale</span>
        <b className="mono">{fmt(totale)}</b>
      </div>
    </div>
  );
};
