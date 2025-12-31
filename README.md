# ⚽ Application Web – Organisation de Matchs à 5

## 📌 Présentation du projet

Cette application web permet d’**organiser des rencontres sportives** entre équipes afin de jouer des **matchs à 5 joueurs**, avec la possibilité d’avoir **jusqu’à 3 remplaçants**.

Elle met en relation des joueurs souhaitant jouer un match, facilite la **création d’équipes**, la **gestion des disponibilités**, la **communication entre capitaines**, et conserve un **historique des matchs joués**.


## 🏗️ Architecture technique

### 🔧 Backend
- **Java**
- **Spring Boot**
- **Spring Data JPA (Hibernate)**
- **Spring Security + JWT**
- **PostgreSQL**

### 🎨 Frontend
- **Angular**
- **TypeScript**
- **HTML / CSS**
- **Angular Material**

### 🧱 Architecture
🎨 `Frontend (Angular)`  →  🔧 `REST API Backend (Spring Boot)`  →  💻 `JPA / Hibernate Base de données (PostgreSQL)`


## 👤 Acteurs du système

### 🧍 Joueur
Un joueur est un utilisateur inscrit dans l’application qui souhaite participer à un match.

Il peut :
- Créer une équipe (et devenir capitaine)
- Déclarer sa disponibilité (`DISPONIBLE`)
- Être invité dans une équipe
- Participer à des matchs
- Consulter son historique


### ⭐ Capitaine
Le capitaine est un joueur ayant créé une équipe.

Il peut :
- Créer et gérer une équipe
- Inviter des joueurs
- Attribuer un numéro de maillot et un poste
- Lancer une demande de match
- Discuter avec d’autres capitaines
- Terminer un match et enregistrer le score


## 👥 Gestion des équipes

### ➕ Création d’une équipe
Pour créer une équipe :
- Il faut être **capitaine**
- L’équipe doit contenir :
    - ✅ **Minimum : 5 joueurs**
    - ✅ **Maximum : 8 joueurs (5 titulaires + 3 remplaçants)**

### 📝 Informations d’une équipe
- Nom de l’équipe (**obligatoire**)
- Logo (**facultatif**)
- Ville et pays
- Liste des membres
- Capitaine

### 👕 Gestion des joueurs
Pour chaque membre de l’équipe :
- Numéro de maillot
- Poste de jeu (gardien, défenseur, milieu, attaquant, remplaçant)


## 📅 Demande de match

Une fois l’équipe complète :
- Le capitaine choisit :
    - 📆 Une date
    - ⏰ Un créneau horaire
- Une **demande de match** est créée avec le statut :

### 📌 Statuts possibles
- `DEMANDE` → en attente d’adversaire
- `DUAL` → match accepté
- `TERMINÉ` → match terminé


## 🔍 Recherche de matchs

Les capitaines peuvent consulter une liste de demandes :
- Filtrée par **pays**
- Filtrée par **ville**


## 💬 Communication entre équipes

### 📢 Chat privé
- Accessible aux joueurs disponibles souhaitant rejoindre l'équipe
- Accessible entre **capitaines** pour confirmer le matche
- Permet de :
    - Préciser l’heure exacte
    - Indiquer l’emplacement du terrain
    - Accepter directement la demande de match


## 🏟️ Déroulement du match

Lorsqu’une équipe accepte une demande :
- Le match passe au statut `DUAL`
- Un match officiel est créé

### 🏁 Fin du match
- Seuls les **deux capitaines** peuvent :
    - Terminer le match (**obligatoire**)
    - Enregistrer le score (**facultatif**)

Le match passe alors au statut :
- ✅ `TERMINÉ`


## 📚 Historique

Une fois terminé :
- Le match est conservé dans l’historique
- Les informations enregistrées :
    - Équipes
    - Date
    - Lieu
    - Score


## 🔮 Évolutions possibles

- Classement des équipes 🏆
- Notation des joueurs ⭐
- Notifications (email / push)
- Réservation de terrains
- Organisation de tournois