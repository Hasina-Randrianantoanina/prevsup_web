#!/usr/bin/bash

# Apres de tous les fichies, il faut attribuer le droit d'execution du fichier install-prevsup-data.sh
# chmod 744 install-prevsup-data.sh
# sudo ./install-prevsup-data.sh

echo "Installation Prevsup Data"
cp -f mongodb.repo /etc/yum.repos.d/mongodb.repo
yum install -y mongodb-org
cp -f mongod.conf /etc/mongod.conf

# Demarrage du service mongodb
systemctl start mongod
systemctl enable mongod


unzip -o dump.zip

mongo mongodb://127.0.0.1:1526/prevsup --eval "printjson(db.dropDatabase())"
mongorestore mongodb://127.0.0.1:1526



