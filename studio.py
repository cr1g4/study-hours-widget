#!/usr/bin/env python3
"""Ore di studio — il timer del widget, usabile anche da terminale.

    studio.py start <materia>          fa partire il timer (chiude quello aperto)
    studio.py stop [-40m]              ferma il timer, togliendo i minuti indicati
    studio.py add <materia> <durata>   aggiunge (o toglie, con -) tempo a mano
    studio.py attiva <materia>         la mette tra le materie in primo piano
    studio.py archivia <materia>       la sposta nell'archivio
    studio.py status                   riassunto leggibile
    studio.py json                     stampa i dati (lo usa il widget)
    studio.py ui <chiave> <valore>     salva posizione e tema del widget

Le durate si scrivono come 1h30m, 45m, 90s, -10m.
In config.json: "file" (dove stanno i dati, altrimenti ~/.study-hours.json),
"obiettivo" (es. "3h", facoltativo), "inizio" (es. "2026-09-28", da quando
contare le ore nella vista Solare) e "nomi" (nome completo di ogni materia).
"""
import datetime
import json
import os
import re
import sys
import tempfile
import time

QUI = os.path.dirname(os.path.realpath(__file__))
FILE_DEFAULT = "~/.study-hours.json"


def config():
    try:
        with open(os.path.join(QUI, "config.json")) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def percorso():
    p = config().get("file", FILE_DEFAULT)
    # realpath: se il file è un link, si scrive sul file vero e il link resta
    return os.path.realpath(os.path.expanduser(p))


def ui():
    """Stato del widget che non è un dato di studio: posizione e vista."""
    for nome in ("ui.json", "posizione.json"):  # posizione.json = versione vecchia
        try:
            with open(os.path.join(QUI, nome)) as f:
                return json.load(f)
        except (FileNotFoundError, ValueError):
            pass
    return {}


def leggi(p):
    try:
        with open(p) as f:
            d = json.load(f)
    except FileNotFoundError:
        d = {}
    d.setdefault("totali", {})
    d.setdefault("sessione", None)
    d.setdefault("giorni", {})
    d.setdefault("attive", [])
    return d


def scrivi(p, d):
    # file temporaneo + rename: il widget non legge mai un file scritto a metà
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(p), suffix=".tmp")
    with os.fdopen(fd, "w") as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write("\n")
    os.chmod(tmp, 0o644)
    os.replace(tmp, p)


def durata(testo):
    m = re.fullmatch(r"(-)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?", testo.strip())
    if not m or not any(m.groups()[1:]):
        sys.exit(f"durata non valida: {testo!r} (esempi: 1h30m, 45m, -10m)")
    segno, h, mi, s = m.groups()
    sec = int(h or 0) * 3600 + int(mi or 0) * 60 + int(s or 0)
    return -sec if segno else sec


def fmt(sec):
    segno = "-" if sec < 0 else ""
    sec = abs(int(sec))
    return f"{segno}{sec // 3600}h{sec % 3600 // 60:02d}m{sec % 60:02d}s"


def accredita(d, materia, inizio, fine):
    """Somma [inizio, fine) al totale e la spezza sui giorni a mezzanotte."""
    d["totali"][materia] = d["totali"].get(materia, 0) + (fine - inizio)
    t = inizio
    while t < fine:
        giorno = datetime.date.fromtimestamp(t)
        domani = datetime.datetime.combine(giorno + datetime.timedelta(days=1), datetime.time())
        pezzo = min(fine, int(domani.timestamp())) - t
        g = d["giorni"].setdefault(giorno.isoformat(), {})
        g[materia] = g.get(materia, 0) + pezzo
        t += pezzo


def aggiusta(d, materia, sec, giorno):
    """Tempo aggiunto o tolto a mano: tutto sullo stesso giorno."""
    d["totali"][materia] = d["totali"].get(materia, 0) + sec
    g = d["giorni"].setdefault(giorno, {})
    g[materia] = g.get(materia, 0) + sec


def chiudi(d, scomputo=0):
    s = d["sessione"]
    if not s:
        return None
    fine = int(time.time())
    accredita(d, s["materia"], s["start"], fine)
    if scomputo:
        aggiusta(d, s["materia"], -scomputo, datetime.date.today().isoformat())
    d["sessione"] = None
    return s["materia"], fine - s["start"] - scomputo


def main(argv):
    if not argv:
        sys.exit(__doc__)
    cmd, args = argv[0], argv[1:]
    p = percorso()
    d = leggi(p)

    if cmd == "json":
        # al widget servono anche le preferenze, che non stanno nei dati
        c = config()
        d["ui"] = ui()
        d["preferenze"] = {
            "obiettivo": durata(c["obiettivo"]) if c.get("obiettivo") else 0,
            "nomi": c.get("nomi", {}),
            "inizio": c.get("inizio"),
        }
        print(json.dumps(d, ensure_ascii=False))
        return

    if cmd == "ui":
        # coppie chiave valore: ui x 488 y 131 · ui w 520 h 300 · ui vista citta
        stato = ui()
        for k, v in zip(args[::2], args[1::2]):
            stato[k] = int(float(v)) if k in ("x", "y", "w", "h") else v
        with open(os.path.join(QUI, "ui.json"), "w") as f:
            json.dump(stato, f)
        return

    if cmd == "status":
        oggi = d["giorni"].get(datetime.date.today().isoformat(), {})
        for m, sec in sorted(d["totali"].items(), key=lambda x: -x[1]):
            print(f"{m:<16}{fmt(sec):>12}   oggi {fmt(oggi.get(m, 0))}")
        print(f"{'TOTALE':<16}{fmt(sum(d['totali'].values())):>12}")
        s = d["sessione"]
        if s:
            print(f"in corso: {s['materia']} da {fmt(time.time() - s['start'])}")
        return

    if cmd == "start":
        materia = " ".join(args).strip()
        if not materia:
            sys.exit("quale materia?")
        chiusa = chiudi(d)
        d["sessione"] = {"materia": materia, "start": int(time.time())}
        if materia not in d["attive"]:
            d["attive"].append(materia)
        scrivi(p, d)
        if chiusa:
            print(f"chiusa {chiusa[0]}: {fmt(chiusa[1])}")
        print(f"partito: {materia}")

    elif cmd == "stop":
        scomputo = -durata(args[0]) if args else 0
        if scomputo < 0:
            sys.exit("allo stop si può solo togliere tempo: stop -40m")
        chiusa = chiudi(d, scomputo)
        if not chiusa:
            sys.exit("nessuna sessione in corso")
        scrivi(p, d)
        print(f"{chiusa[0]}: {fmt(chiusa[1])} → totale {fmt(d['totali'][chiusa[0]])}")

    elif cmd == "add":
        if len(args) < 2:
            sys.exit("uso: add <materia> <durata>")
        materia, sec = " ".join(args[:-1]), durata(args[-1])
        aggiusta(d, materia, sec, datetime.date.today().isoformat())
        scrivi(p, d)
        print(f"{materia}: {'+' if sec >= 0 else ''}{fmt(sec)} → totale {fmt(d['totali'][materia])}")

    elif cmd in ("attiva", "archivia"):
        materia = " ".join(args).strip()
        if materia in d["attive"]:
            d["attive"].remove(materia)
        if cmd == "attiva":
            d["attive"].append(materia)
        scrivi(p, d)

    else:
        sys.exit(f"comando sconosciuto: {cmd}\n{__doc__}")


if __name__ == "__main__":
    main(sys.argv[1:])
