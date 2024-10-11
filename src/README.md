# Prevsup ASP.NET C#

Prevsup : Application de prévision des effectifs du ministère de l'enseignement supérieur


## Contenu du repository:
- Branche main: Code source Asp.NET Core non refactorisé de l'application Prevsup
- Branche dev_refactoring : Code source Asp.NET Core et ReactJs refactorisés de l'application Prevsup

## Environement d'installation
Pré-requis
- .NET Core 5
- MongoDB v5.0.5
- npm v8.15.0
- MongoDB tools v100.5.1


## Déploiement de la base de données
- Extraire le fichier dump_refactoring_react_xx_xx_xxxx.zip
- Lorsqu'on se trouve sur le dossier "dump", lancer la commande:
    - mongorestore

## Déploiement du code
- Modifier le contenu de appsettings.json:
    - dbServerIP: Adresse IP de la base de données MongoDB
    - dbUsername: Nom utilisateur ayant accès à la base de données prevsup
    - dbPassword: Mot de passe de l'utilisateur
    - dbPort: Port d'accès à MongoDB
    - webPort: Port d'accès à l'application
- Se mettre au niveau du code source puis lancer la commande:
    - dotnet run
- Se rendre dans le dossier ClientApp:
    - modifier le contenu du fichier index.html dans le dossier public:
        - remplacer ${window.location.protocol}//${window.location.host} dans l'élément script par le lien d'excecution de l'application( par exemple: https://localhost:5001)
    -lancer les commandes:
        -npm install
        -npm start
