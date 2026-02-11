# Fitness App Frontend

Dies ist das Frontend für die FitnessApp, entwickelt mit **React Native** und **Expo**. Es bietet eine plattformübergreifende Benutzeroberfläche (Web, iOS, Android) für das Trainingstagebuch.

## Voraussetzungen

Stelle sicher, dass du folgende Tools installiert hast:

- **Node.js** (LTS Version empfohlen): [Node.js herunterladen](https://nodejs.org/)
- **npm** (wird mit Node.js installiert) oder **yarn**
- **Expo Go App** (Optional: auf deinem Smartphone, wenn du darauf testen möchtest)

## Installation

Folge diesen Schritten, um das Frontend lokal einzurichten.

### 1. Repository klonen und in das Verzeichnis wechseln

Öffne dein Terminal und navigiere in den Projektordner:

```bash
cd fitnessapp
```

### 2. Abhängigkeiten installieren

Lade alle benötigten Node-Module herunter:

```bash
npm install
```

## App starten

### Standard-Start (für Entwicklung)

Um den Entwicklungsserver zu starten, führe einfach aus:

```bash
npx expo start
```
*Dies öffnet ein Menü im Terminal, über das du wählen kannst, wo du die App öffnen möchtest (w = Web, a = Android, i = iOS).*

### Starten im Web-Browser

Wenn du direkt im Browser entwickeln möchtest:

```bash
npx expo start --web
```

### Troubleshooting / Cache leeren

Falls du Probleme mit dem Start hast oder Änderungen nicht sichtbar werden, hilft oft das Leeren des Caches:

**Mac / Linux (mit Administratorrechten):**
```bash
sudo npx expo start --web --clear
```

**Windows (PowerShell als Administrator):**
```powershell
npx expo start --web --clear
```

## Projektstruktur

Das Frontend ist modular mit Expo Router aufgebaut:

- **`app/`**: Enthält die Seiten (Screens) und das Routing der App.
    - **`(auth)/`**: Login- und Registrierungs-Screens.
    - **`(tabs)/`**: Hauptnavigation (Dashboard, Training, Profil).
    - **`exercise/`**: Screens für Übungsdetails und Erstellung.
    - **`training/`**: Trainingspläne und aktive Sessions.
- **`components/`**: Wiederverwendbare UI-Elemente (Buttons, Listen, Icons).
- **`services/`**: API-Kommunikation mit dem Backend (`axios`-Instanzen).
- **`assets/`**: Bilder und Schriftarten.
- **`constants/`**: Globale Konstanten (Farben, Konfigurationen).

## Verbindung zum Backend

Das Frontend erwartet, dass das Backend lokal unter `http://127.0.0.1:8000` (bzw. `localhost`) läuft.
Stelle sicher, dass du das Backend startest, **bevor** du dich im Frontend anmeldest.

## Features

- **Dashboard**: Übersicht über deine Statistiken und aktuellen Fortschritt.
- **Training**: Erstelle und starte Trainingspläne, tracke deine Sätze und Gewichte.
- **Übungen**: Durchsuche eine Datenbank von Übungen oder erstelle eigene mit Bildern.
- **Profil**: Verwalte deine persönlichen Daten und Einstellungen.
