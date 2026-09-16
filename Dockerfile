FROM php:8.3-apache

WORKDIR /var/www/html
COPY . /var/www/html/

# Render supplies PORT at runtime. Apache is changed to listen on it when the container starts.
EXPOSE 10000
CMD ["sh", "-c", "sed -i \"s/80/${PORT:-10000}/g\" /etc/apache2/ports.conf /etc/apache2/sites-enabled/000-default.conf && apache2-foreground"]
