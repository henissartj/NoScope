# NoScope

NoScope est un outil de capture et d’analyse de trafic réseau, simple, rapide et pensé pour explorer les paquets en toute clarté. Conçu comme une alternative moderne à Wireshark, il offre une interface épurée, une analyse avancée et une détection d'intrusion (IDS) intégrée.

Développé par le Cartel Amiri]([[https://nodejs.org/](https://fr.wikipedia.org/wiki/Cartel_Amiri)])) & L'EMPRISE.

## 🚀 Fonctionnalités

- **Analyse Avancée** : Traduction automatique du trafic en résumés clairs.
- **Détection d'Intrusion (IDS)** : Analyse de la réputation source et du payload.
- **Interface Moderne** : Thème sombre natif, sans animations superflues.
- **Filtres Dynamiques** : Filtrage en temps réel par IP, port, protocole, etc.
- **Export Avancé** : Génération de rapports PDF et export des paquets (JSON/PCAP).

## 🛠️ Installation et Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- Git

### Instructions

1. **Cloner le dépôt :**
   ```bash
   git clone https://github.com/henissartj/NoScope.git
   cd NoScope
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Lancer l'application :**
   ```bash
   npm start
   ```
   *Cette commande lance simultanément le serveur de développement (Vite) et la fenêtre native (Electron).*

## 📄 Structure du Projet

- `src/` : Code source de l'interface (React, TypeScript, Tailwind CSS).
- `electron/` : Configuration du processus principal Electron (`main.cjs`).

## 📜 Licence

MIT License

Copyright (c) 2026 Chronique

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
