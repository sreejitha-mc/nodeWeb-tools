#!/bin/sh

docker exec $1 echo "I'm inside the container!"

docker cp /home/viji/code/project/cert-tools/sample_data/certificate_templates/$2 $1:/etc/cert-issuer/data/unsigned_certificates/$2

docker exec $1 cert-issuer -c /etc/cert-issuer/conf.ini

docker cp $1:/etc/cert-issuer/data/blockchain_certificates/$2 /home/viji/code/project/cert-web-component/demo/blockchain_certificates/$2

docker cp $1:/etc/cert-issuer/data/blockchain_certificates/$2 /var/www/html/issued_certificates/$2

# docker exec $1 rm -rf /etc/cert-issuer/data/blockchain_certificates/$2

# docker exec $1 rm -rf /etc/cert-issuer/data/unsigned_certificates/$2



