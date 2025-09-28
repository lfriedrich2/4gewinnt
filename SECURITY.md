# Security Policy

## Supported Versions

Wir unterstützen die folgenden Versionen von Connect Four Pro mit Sicherheitsupdates:

| Version | Unterstützt        |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Sicherheitslücken melden

Die Sicherheit von Connect Four Pro ist uns wichtig. Falls Sie eine Sicherheitslücke entdecken, melden Sie diese bitte verantwortungsvoll.

### Meldeprozess

1. **Keine öffentlichen Issues:** Erstellen Sie bitte keine öffentlichen GitHub Issues für Sicherheitsprobleme
2. **Direkte Kontaktaufnahme:** Senden Sie eine E-Mail an security@connectfourpro.com
3. **Detaillierte Beschreibung:** Geben Sie so viele Details wie möglich an

### Was zu melden ist

- Cross-Site Scripting (XSS) Schwachstellen
- Code-Injection Möglichkeiten
- Authentifizierung oder Autorisierung Umgehungen
- Sensitive Daten Exposition
- Sicherheitskonfigurationsfehler

### Was Sie erwartet

- **Bestätigung:** Wir bestätigen den Erhalt innerhalb von 48 Stunden
- **Updates:** Regelmäßige Updates über den Bearbeitungsfortschritt
- **Anerkennung:** Bei berechtigten Meldungen werden Sie in den Credits erwähnt (falls gewünscht)
- **Zeitrahmen:** Kritische Sicherheitslücken werden innerhalb von 7 Tagen behoben

## Sicherheitsmaßnahmen

Connect Four Pro implementiert folgende Sicherheitsmaßnahmen:

- **Content Security Policy (CSP):** Verhindert XSS-Angriffe
- **Secure Defaults:** Sichere Standardkonfiguration
- **Input Validation:** Alle Benutzereingaben werden validiert
- **Local Storage Only:** Keine sensiblen Daten werden an Server gesendet
- **HTTPS Enforcement:** Funktioniert nur über sichere Verbindungen
- **Dependency Scanning:** Regelmäßige Überprüfung auf bekannte Schwachstellen

## Datenschutz

- **Keine Datensammlung:** Connect Four Pro sammelt keine persönlichen Daten
- **Local Storage:** Alle Spieldaten bleiben auf dem Gerät des Nutzers
- **Keine Cookies:** Verwendet keine Tracking-Cookies
- **Keine Analytics:** Keine Nutzungsstatistiken werden gesammelt

## Compliance

Connect Four Pro ist konform mit:

- **GDPR:** Europäische Datenschutz-Grundverordnung
- **CCPA:** California Consumer Privacy Act
- **WCAG 2.1:** Web Content Accessibility Guidelines
- **W3C Standards:** Web-Standards des World Wide Web Consortium
