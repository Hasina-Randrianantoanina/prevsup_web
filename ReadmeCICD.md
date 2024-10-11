# Exportation CICD prevsup vers Softia ou autre dépôt

## Vers un changement de dépôt
### Dépôt de code source de l'application
1. Créer un runner dans la VM de test pour lancer les processus (suivre la documentation CICD.docx via ce lien https://ged.soa.mg/f/15585), avec "shell" comme executor
2. Trouver le chemin où se trouve le dépôt dans la VM :
  - voir dans le chemin /home/gitlab-runner/ le nom du runner dans gitlab
3. Mettre à jour les codes sources dans le nouveau dépôt à partir de l'ancien dépôt
4. Copier le fichier de configuration gitlab-ci dans l'ancien dépôt et l'adapter selon le chemin trouver en dessus dans le nouveau dépôt

### Dépôt de code source des tests IHM
1. Créer un runner dans la VM de test pour lancer les processus (suivre la documentation CICD.docx via ce lien https://ged.soa.mg/f/15585), avec "docker" comme executor
2. Mettre à jour les codes sources dans le nouveau dépôt à partir de l'ancien dépôt
3. Copier le fichier de configuration gitlab-ci dans l'ancien dépôt vers le nouveau dépôt

## Vers un changement de VM (redhat 8 pour le cas actuellement)
- Installer gitlab-runner dans la VM en suivant la même docummentation mentionnée en haut.
- Créer un runner dans la VM
- Installer npm pour pouvoir lancer la construction du projet react (node 18 et npm 8 minimum)
    Pour installer une version spécifique de nodeJs dans redhat:
		installer curl s'il n'est pas encore installé : sudo yum install --assumeyes curl
		Ajouter le dépôt node.js de nodeSource disponible : curl --silent --location https://rpm.nodesource.com/setup_18.x | sudo bash - (remplacer le setup_18 selon la version demandée)
		Installer nodeJs : sudo yum install --assumeyes nodejs
- Configurer l'autorisation de l'utilisateur gitlab-runner pour pouvoir lancer des commandes pour copier les fichiers de déploiement:
  Ajouter dans le fichier /etc/sudoers la ligne suivante "gitlab-runner	ALL=(ALL) 	NOPASSWD: ALL"
- Installer docker pour l'utiliser sur le lancement du test IHM:
    Ajouter Docker Repository : sudo yum config-manager –add-repo https://download.docker.com/linux/centos/docker-ce.repo
    Mettre à jour le dépôt du système: sudo yum update
    Vérifier si "Docker repository" est ajouter dans le système: sudo dnf repolist 
    Installer docker: sudo dnf install docker-ce docker-ce-cli containerd.io
    Mettre en marche docker service : 
      sudo systemctl start docker.service
      sudo systemctl enable docker.service

## Ecriture test IHM
