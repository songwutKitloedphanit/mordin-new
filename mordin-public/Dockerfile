FROM php:8.2-apache

# Install system dependencies and PHP extensions (curl is required for API integration)
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    && docker-php-ext-install curl \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Update Apache configuration to allow .htaccess overrides
RUN sed -ri -e 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set timezone
RUN echo "Asia/Bangkok" > /usr/local/etc/php/conf.d/timezone.ini

# Copy application files
COPY . /var/www/html/

# Ensure proper permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
