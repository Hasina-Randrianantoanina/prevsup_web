#!/usr/bin/bash

# Apres de tous les fichies, il faut attribuer le droit d'execution du fichier install-prevsup-code.sh
# chmod 744 install-prevsup-code.sh
# sudo ./install-prevsup-code.sh

adduser -U www-data

echo "Installation Prevsup (code)"
cp -f nginx.conf /etc/nginx/nginx.conf
nginx -t
nginx -s reload 

# Parametrage du firewall
systemctl start firewalld
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=5000/tcp --permanent
firewall-cmd --reload

unzip -o publish.zip -d ../prevsup
chown -R www-data:www-data ../prevsup

cp -f appsettings.json ../prevsup
cp -f prevsup.service /etc/systemd/system/prevsup.service
systemctl enable prevsup.service
systemctl start prevsup.service
