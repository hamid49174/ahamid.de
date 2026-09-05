# ahamid.de

Quellcode meiner persönlichen Website: [ahamid.de](https://ahamid.de)

Statisch, ohne Framework und ohne Build-Schritt. Kein Tracking, keine Cookies, keine externen Requests (Schriften liegen lokal).

## Struktur

```
index.html          Startseite (Hero, Über mich, Skills, Erfahrung, Projekte, Bildung, Kontakt)
impressum.html      Impressum (§ 5 DDG)
datenschutz.html    Datenschutzerklärung
404.html            Fehlerseite
assets/css/         style.css (Design + Effekte), fonts.css (@font-face)
assets/js/main.js   Navigation, Reveal, Typewriter, Zähler, Tilt, Partikelnetz, Cursor
assets/fonts/       Syne + Manrope (variable, Latin-Subset, OFL)
assets/img/         Porträt
.htaccess           Redirects (www/https), Security-Header, Caching
```

## Lokal ansehen

```bash
python -m http.server 8080
```

Dann http://localhost:8080 öffnen.

## Deploy

Alle Dateien außer `README.md`, `LICENSE` und `.git` in das DocRoot des Webhostings (netcup, `httpdocs`) hochladen. `.htaccess` mitnehmen.

## Lizenz

Code: MIT. Texte, Fotos und persönliche Daten: alle Rechte vorbehalten. Siehe [LICENSE](LICENSE).
