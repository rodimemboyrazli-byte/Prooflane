---
name: Prooflane
description: Sachlich-editoriale Produktwelt für belastbare Sicherheitsnachweise in industriellen Lieferketten.
colors:
  industrial-ink: "#14272d"
  industrial-ink-soft: "#254149"
  evidence-muted: "#596d72"
  proof-paper: "#f7f8f6"
  pure-white: "#ffffff"
  signal-teal: "#167a76"
  signal-teal-dark: "#0f5c59"
  evidence-teal-pale: "#e8f2f0"
  evidence-mint: "#bcded8"
  structural-line: "#cdd9d6"
  on-dark-muted: "#b4c5c4"
  on-dark-accent: "#9bdbd3"
  ops-ink: "#191b25"
  ops-page: "#ece8df"
  ops-panel: "#fbfaf6"
  ops-blue: "#4556ff"
  ops-orange: "#ff6b35"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(4.3rem, 7vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(3rem, 5.4vw, 5.8rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(2.4rem, 4vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  none: "0"
  menu: "15px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "64px"
  section: "150px"
components:
  button-primary:
    backgroundColor: "{colors.industrial-ink}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.proof-paper}"
    textColor: "{colors.industrial-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
    typography: "{typography.label}"
  button-light:
    backgroundColor: "{colors.evidence-teal-pale}"
    textColor: "{colors.industrial-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "48px"
    typography: "{typography.label}"
  field:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.industrial-ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "46px"
---

# Design System: Prooflane

## Overview

**Creative North Star: „Die industrielle Beweisspur“**

Prooflane verbindet eine helle, präzise Editorial-Fläche mit der materiellen Realität industrieller Produktion. Die Seite wirkt nicht wie ein abstraktes Security-Dashboard, sondern wie ein belastbares System, das direkt an echter Wertschöpfung andockt: großformatige Typografie, ruhige Papierflächen, technische Linien und eine dokumentarische Werkhallenaufnahme bilden die visuelle Klammer.

Die Gestaltung arbeitet mit kontrollierten Kontrasten. Gebrochenes Weiß hält lange Produktstrecken ruhig und lesbar, dunkles Anthrazit schafft institutionelle Verlässlichkeit, und Blaugrün markiert Status, aktive Zustände und Handlungsimpulse. Produktbeispiele erscheinen als klar gerahmte Evidenzflächen mit sichtbaren Quellen-, Status- und Verlaufsmustern; dekorative Effekte bleiben der Informationshierarchie untergeordnet.

**Key Characteristics:**

- Dokumentarische Industrieaufnahme statt abstrakter Hero-Animation
- Großzügige, editorial gesetzte Überschriften mit kurzen Textspalten
- Flache, kantige Datenflächen im Kontrast zu pillenförmigen Aktionen
- Blaugrün als seltenes Signal für Verbindung, Aktivität und bestätigte Evidenz
- Sichtbare Linien, Statusangaben und Zeitspuren als wiederkehrende Beweismotive
- Responsive Dramaturgie, die von breiten Zweispalten zu klaren, linearen Mobilstrecken wechselt

## Colors

Die Palette übersetzt industrielle Nüchternheit in eine warme, gut lesbare Produktoberfläche: tiefe Blau-Anthrazit-Töne tragen Vertrauen, helle Papier- und Mintflächen schaffen Luft, Signal-Teal führt Blick und Status.

### Primary

- **Signal-Teal** (`signal-teal`): Primärer Akzent für aktive Navigation, Hervorhebungen, Statuspunkte, Fortschrittsbalken, Iconlinien und CTA-Flächen.
- **Dunkles Signal-Teal** (`signal-teal-dark`): Verdichtete Akzentfläche im Hero-Hinweis und Hoverzustand dunkler Primäraktionen.

### Secondary

- **Evidenz-Mint** (`evidence-mint`): Zurückhaltender Verbindungs- und Evidenzton; nicht als großflächige Standardfläche einsetzen.
- **Teal-Nebel** (`evidence-teal-pale`): Helle Systemfläche für Profile, Prozessdarstellungen, Footer und sekundäre Aktionen.

### Neutral

- **Industrie-Tinte** (`industrial-ink`): Haupttext, dunkle Sektionen, primäre Buttons und tragende UI-Flächen.
- **Weiche Industrie-Tinte** (`industrial-ink-soft`): Kräftiger Fließtext, wenn reines Anthrazit zu dominant wäre.
- **Evidenz-Grau** (`evidence-muted`): Sekundärtext, Metadaten und ruhige Navigationselemente auf hellen Flächen.
- **Proof-Papier** (`proof-paper`): Grundfläche der Landingpage und heller Hintergrund der Hero-Typografie.
- **Reinweiß** (`pure-white`): Kontrastfläche für Produktkarten und Text auf dunklen Aktionen.
- **Strukturlinie** (`structural-line`): Trennlinien, Kartenrahmen und tabellarische Unterteilungen.
- **Gedämpft auf Dunkel** (`on-dark-muted`): Lesbarer Begleittext auf der dunklen Rollenfläche.
- **Akzent auf Dunkel** (`on-dark-accent`): Helle Status- und Überschriftenakzente auf Anthrazit.

**The Signal Rule.** Blaugrün bezeichnet Verbindung, Aktivität oder bestätigte Evidenz; es ist kein dekorativer Flächenfüller.

**The Contrast Pair Rule.** Große Kapitel wechseln bewusst zwischen Proof-Papier, Reinweiß und Industrie-Tinte. Zusätzliche Hintergrundfarben sind nicht nötig.

### Authenticated operations palette

Login und Arbeitsbereich sind bewusst antizyklisch zur Marketingseite gestaltet. Graphit (`ops-ink`) trägt Navigation und Zugangskontext, warmes Papier (`ops-page`) die Arbeitsfläche, Ultramarin (`ops-blue`) primäre Aktionen und Fokuszustände, Signal-Orange (`ops-orange`) Handlungsdruck und Identitätsmarker. Signal-Teal aus der Landingpage wird hier nicht wiederverwendet. So liest sich die öffentliche Seite als Erklärung, der eingeloggte Bereich dagegen als konzentriertes Arbeitswerkzeug.

Die Produktidentität im Arbeitsbereich verwendet eine eigenständige **Control-Stamp-Wortmarke**: ein ultramarines Prüfquadrat mit weißem Achsenzeichen und versetzter Orange-Platte, daneben die zweizeilige Bezeichnung „Prooflane / Operations“. Sie ersetzt Marketing-Balken und das frühere Sticker-Kürzel „OPS“ vollständig.

Die vier Arbeitsbereiche besitzen bewusst unterschiedliche Arbeitsmuster statt einer wiederholten Tabellenansicht: Der Überblick kombiniert Kennzahlen, Prioritäts-Queue und Evidenz-Watch; Nachweise erscheinen als prüfbare Evidenzkarten; Freigaben als horizontale Kundenverbindungen; Maßnahmen als dreispaltiges Status-Board. Auf kleinen Viewports werden diese Muster neu gestapelt, während Statuswechsel und Freigabeaktionen direkt im jeweiligen Kontext bleiben.

## Typography

**Display Font:** Manrope mit lokal ausgelieferten Schnitten Regular, Semibold und Extrabold

**Body Font:** Manrope mit generischem Sans-Serif-Fallback

**Label Font:** Manrope Extrabold

**Character:** Manrope gibt Prooflane eine moderne technische Stimme, ohne steril zu werden. Enge Laufweite und kompakte Zeilenhöhen verdichten Überschriften; Fließtexte bleiben normalgewichtig, offen und auf kurze Zeilenlängen begrenzt.

### Hierarchy

- **Display** (Semibold, `display`, Zeilenhöhe `0.92`): Ausschließlich für die Hero-Aussage; auf kleinen Geräten fluid bis zu einer gut umbrechenden Mobilgröße reduziert.
- **Headline** (Semibold, `headline`, Zeilenhöhe `0.98`): Kapitelüberschriften und die große Schlussaufforderung.
- **Title** (Semibold, `title`, Zeilenhöhe `1`): Produktpanel-Überschriften; Rollenüberschriften nutzen eine etwas kompaktere Variante derselben Stimme.
- **Body** (Regular, `body`): Erklärtexte mit ungefähr 34–54 Zeichen breiten Zeilen; im Hero größer (`18px`), in Produkt- und Rollenbereichen meist `15–17px`.
- **Label** (Extrabold, `label`): Prozessnamen, Status und Metadaten; häufig versal, mit deutlich erhöhter Laufweite. Kleinstinformationen reichen je nach Kontext von `8px` bis `12px`.

Hervorgehobene zweite Zeilen in Hero- und Kapitelüberschriften bleiben aufrecht gesetzt und wechseln lediglich zu Signal-Teal; sie sind trotz des semantischen `em` nicht kursiv.

**The One-Family Rule.** Ausdruck entsteht über Maßstab, Gewicht, Laufweite und Farbe – nicht über eine zusätzliche Display-Schrift.

**The Short-Line Rule.** Große Aussagen werden bewusst in zwei Zeilen komponiert; erklärender Text bleibt schmal genug, um auch neben visuellen Produktflächen schnell erfassbar zu sein.

## Layout

Die Hauptinhalte liegen in einer zentrierten Shell von maximal `1240px` mit `32px` Außenabstand. Der Header darf mit maximal `1380px` etwas breiter stehen. Die Desktop-Komposition verwendet asymmetrische Zweispalten – meist etwa `1.25fr / 0.75fr` – und große vertikale Kapitelabstände von ungefähr `150px`. Das erzeugt eine klare Leserichtung: Aussage links, Einordnung oder Handlung rechts.

Der Hero ist mindestens viewporthoch und zugleich nie niedriger als `900px`. Oben liegt die vollbreite, statische Werkhallenaufnahme mit einer fluiden Höhe zwischen `520px` und `650px`; ihr dokumentarischer Credit sitzt links, ein dunkel-teales Kontextfeld bündig rechts am unteren Bildrand. Die Überschrift und der Pitch schließen darunter auf Proof-Papier an. Bild, Text und Statuszeile bilden damit drei klar getrennte Ebenen, ohne Text direkt auf die unruhige Aufnahme zu legen.

Die Aufnahme `public/assets/prooflane-industrial-hero.jpg` ist `2400 × 1600px`, wird über Next Image responsiv und priorisiert geladen, deckend beschnitten und leicht entsättigt sowie kontrastverstärkt. Der Bildausschnitt verschiebt sich auf schmalen Viewports nach rechts, damit Produktionsstraße und Maschinen lesbar bleiben. Sichtbare Provenienz: **xing bowen / Unsplash**, Quelle: <https://unsplash.com/photos/industrial-machinery-in-a-large-factory-setting-mMgC9U15XR0>. Der Alttext beschreibt die Produktionsanlage sachlich; der Credit bleibt als echter Link erhalten.

Nach dem Hero folgt eine typografische Dreiersequenz mit links-, mittig- und rechtsbündigen Zeilen. Der Produktablauf kombiniert auf Desktop eine `350px` breite, sticky Schritt-Navigation mit langen Produktpanels; die sichtbare Sektion steuert den aktiven Schritt. Der Rollenbereich invertiert die Farbwelt und stellt Erklärung und simulierte Produktoberfläche nebeneinander. Danach führt die Seite direkt in den großen Schluss-CTA.

### Responsive behavior

- **Bis `1100px`:** Hero-Spalten und Hauptabstände werden enger, die Produktnavigation wird `290px` breit, komplexe Freigabevisualisierungen werden kompakter.
- **Bis `820px`:** Inhaltsraster wechseln auf eine Spalte. Der Hero nutzt ein `405px` hohes Bild, die Navigation wird zum aufklappbaren Mobilmenü, und der Produktablauf wird zu einer horizontal scrollbaren sticky Leiste.
- **Bis `600px`:** Außenabstände sinken auf `16px`, das Hero-Bild auf `360px`, Aktionen werden vollbreit gestapelt und komplexe Prozessverbindungen weichen linearen Kartenstapeln. Der Rollenbereich wird einspaltig.

**The Long-Form Rhythm Rule.** Zwischen eigenständigen Aussagen steht deutlich mehr Raum als innerhalb einer Produktkarte; Sektionen dürfen atmen, UI-Beispiele bleiben kompakt.

**The Mobile Recomposition Rule.** Kleine Viewports skalieren die Desktop-Geometrie nicht nur herunter, sondern ordnen Navigation, Hero, Produktablauf und Datengrafiken neu.

## Elevation & Depth

Prooflane ist flach im Grundzustand. Tiefe entsteht primär durch Flächenwechsel, feine Strukturlinien und Überlagerung; Schatten markieren nur tatsächlich schwebende oder hervorgehobene Elemente.

### Shadow Vocabulary

- **Schwebende Navigation** (`0 16px 36px rgba(20, 39, 45, .16)`): Ausschließlich für die dunkle Header-Kapsel.
- **Mobiles Menü** (`0 20px 45px rgba(20, 39, 45, .24)`): Trennt die geöffnete Navigation klar vom Hero.
- **Evidenz-Pass** (`0 24px 38px rgba(20, 39, 45, .2)`): Hebt das zusammengeführte Profil innerhalb der Prozessgrafik an.
- **Rollen-Profil** (`0 30px 70px rgba(0, 0, 0, .24)`): Markiert die helle Live-Profilfläche auf dunklem Grund.
- **Modal** (`0 28px 70px rgba(0, 0, 0, .28)`): Reserviert für den blockierenden Demo-Dialog.

**The Flat-by-Default Rule.** Karten und Kapitel erhalten keinen Schatten, solange sie nicht schweben oder innerhalb einer anderen Fläche bewusst hervortreten.

## Shapes

Die Formensprache setzt zwei Pole gegeneinander: Inhalte, Datenkarten, Bildnotiz, Felder und Modaldialog sind rechtwinklig; Aktionen, Navigation, Statuspunkte und Checkmarks sind vollständig gerundet. Dadurch wirken Produktdaten präzise und überprüfbar, während Interaktionen unmittelbar als klickbare Elemente erkennbar bleiben.

Feine Ein-Pixel-Linien strukturieren Listen und Gruppen. Die Wortmarke ergänzt die Geometrie um drei aufsteigende, leicht geneigte Teal-Balken. Icons sind linear, ohne Füllung, mit runden Linienenden; bestätigte Zustände erscheinen als umrandeter Kreis mit Checkmark.

**The Square-Data / Round-Action Rule.** Rechteckige Flächen tragen Evidenz; pillen- oder kreisförmige Formen lösen Aktionen aus oder signalisieren Status.

## Components

### Hero image composition

- **Image:** Vollbreite, statische Werkhallenaufnahme mit `object-fit: cover`, kontrollierter Entsättigung und leichter Kontrastanhebung.
- **Overlay:** Eine gleichmäßige, transparente Teal-Tönung verbindet das Foto mit der Palette; keine Verlaufsüberlagerung.
- **Context note:** Rechtwinklige, dunkel-teale Fläche am unteren rechten Bildrand mit kleinem versalem Index und kurzer Aussage.
- **Credit:** Kleines, kontrastreiches Tintenlabel mit sichtbarem Autoren- und Quellenlink.
- **Behavior:** Keine automatische Hero-Animation. Responsivität entsteht über Ausschnitt und Komposition, nicht über Bewegung.

### Buttons

- **Shape:** Vollständig pillenförmig (`999px`) mit mindestens `48px` Höhe.
- **Primary:** Industrie-Tinte auf Weiß, `20px` horizontaler Innenabstand, fettes kompaktes Label und Richtungspfeil.
- **Secondary:** Proof-Papier mit sichtbarer neutraler Kontur; Hover verschiebt Kontur und Text in Richtung Signal-Teal.
- **Light:** Teal-Nebel mit Industrie-Tinte für dunkle oder gesättigte Flächen.
- **Hover / Focus:** Hover hebt Buttons um `2px` an; ein globaler `3px` Fokusrahmen aus transparentem Signal-Teal bleibt mit `4px` Abstand sichtbar.

### Navigation

- **Desktop:** Dunkle, schwebende Kapsel mit einzeln gerundeten Links; Anmeldung erhält eine subtile Kontur, der Demo-CTA eine Signal-Teal-Fläche.
- **Mobile:** Kreisförmiger Menüschalter mit zwei Linien, der sich zu einem Kreuz dreht. Das geöffnete Menü ist eine dunkle, vertikale Fläche mit mindestens `48px` hohen Treffern.
- **State:** Der Schalter pflegt `aria-expanded` und wechselt sein zugängliches Label zwischen Öffnen und Schließen.

### Product story navigation

- **Desktop:** Sticky Seitenleiste mit großen Schrittnamen, Strukturlinien und einer einblendenden Teal-Aktivlinie. Nur der aktive Schritt zeigt seine Kurzbeschreibung.
- **Mobile:** Horizontal scrollbare, sticky Leiste; Beschreibungen entfallen, die Aktivlinie wandert an die Unterkante.
- **State:** Ein Intersection Observer hält Navigation und sichtbares Panel synchron.

### Evidence panels

- **Container:** Rechtwinklige, weiß oder hell-mint hinterlegte Flächen mit Ein-Pixel-Rahmen und mindestens `430px` Höhe.
- **Internal language:** Nummern, Zeitstempel, Statuswörter, Fortschrittslinien und Checkmarks machen Herkunft und Prozess sichtbar.
- **Integrity:** Fiktive Inhalte tragen dauerhaft den Hinweis „Illustrative Beispieldaten“.
- **Responsive:** Verbindungslinien und Mehrspalten-Diagramme werden mobil zu einfachen Kartenstapeln reduziert.

### Audience tabs and role profile

- **Tabs:** Echtes Tablist-/Tab-/Tabpanel-Muster mit roving `tabIndex`; Pfeiltasten sowie Home und End wechseln Auswahl und Fokus.
- **Active state:** Heller Text und eine Teal-Linie statt zusätzlicher Fläche.
- **Profile:** Weiße, kantige UI-Karte auf Industrie-Tinte mit klarer Firmenzeile, nummerierten Evidenzzeilen und Synchronisationsstatus.

### Modal and fields

- **Dialog:** Maximal `480px` breit, rechtwinklig auf abgedunkeltem Backdrop; Schließen bleibt als kreisförmige Aktion oben rechts sichtbar.
- **Fields:** Weiße, kantige `46px` hohe Eingaben mit klarer Ein-Pixel-Kontur und dauerhaft sichtbaren Labels.
- **Accessibility:** Beim Öffnen wird der Seiteninhalt inert und vor Assistenztechnik verborgen, der Body-Scroll gesperrt und der Fokus in den Dialog gesetzt. Tab und Shift+Tab bleiben im Dialog, Escape und Backdrop-Klick schließen ihn, anschließend kehrt der Fokus zum auslösenden Element zurück.
- **Feedback:** Nach dem Absenden ersetzt eine bestätigte Erfolgsansicht das Formular, ohne Dialogtitel oder Struktur zu verlieren.

## Do's and Don'ts

### Do:

- **Do** zeige industrielle Realität im Hero mit einem klar beschnittenen, lokal ausgelieferten und sichtbar kreditierten Foto.
- **Do** verwende Signal-Teal für aktive Zustände, Verbindungslinien, bestätigte Evidenz und gezielte Handlungsimpulse.
- **Do** halte Datenflächen kantig, durch Linien gegliedert und mit konkreten Status- oder Zeitspuren nachvollziehbar.
- **Do** komponiere große Überschriften in kurzen Zeilen und stelle erklärende Texte daneben oder klar darunter.
- **Do** kennzeichne Demo- und Beispieldaten ausdrücklich als illustrativ.
- **Do** erhalte Fokusführung, Tastaturmuster, semantische Rollen und reduzierte Bewegung bei jeder Komponentenänderung.

### Don't:

- **Don't** ersetze die dokumentarische Hero-Komposition durch eine unklare, dekorative oder automatisch laufende Animation.
- **Don't** lege längere Hero-Copy direkt über die detailreiche Werkhallenaufnahme.
- **Don't** verwende Blaugrün wahllos als Hintergrund für jede Sektion; seine Seltenheit trägt die Informationshierarchie.
- **Don't** runde Datenkarten, Felder und Dialoge zu generischen SaaS-Kacheln ab.
- **Don't** erfinde Kundenlogos, Zertifizierungsabzeichen, Kennzahlen oder Testimonials als visuelle Vertrauenssignale.
- **Don't** verkleinere komplexe Desktopgrafiken nur proportional; ordne sie für kleine Viewports neu.
