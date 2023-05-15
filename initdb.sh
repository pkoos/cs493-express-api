#!/bin/sh

mysql -u ${MYSQL_USER} "-p${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" -e "CREATE TABLE business (id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, owner_id MEDIUMINT UNSIGNED NOT NULL, name VARCHAR(255) NOT NULL, address VARCHAR(255) NOT NULL, city VARCHAR(255) NOT NULL, state VARCHAR(255) NOT NULL, zip VARCHAR(255) NOT NULL, phone VARCHAR(255) NOT NULL, category VARCHAR(255) NOT NULL, subcategory VARCHAR(255) NOT NULL, website VARCHAR(255), email VARCHAR(255));CREATE TABLE review (id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, business_id MEDIUMINT UNSIGNED NOT NULL, owner_id MEDIUMINT UNSIGNED NOT NULL, stars INT NOT NULL, dollars INT NOT NULL, text TEXT NOT NULL);CREATE TABLE photo(id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, owner_id INT UNSIGNED NOT NULL, business_id INT UNSIGNED NOT NULL, file_name VARCHAR(255) NOT NULL, caption TEXT NOT NULL);"
# "CREATE TABLE IF NOT EXISTS business (
#         id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
#         owner_id MEDIUMINT UNSIGNED NOT NULL, 
#         name VARCHAR(255) NOT NULL, 
#         address VARCHAR(255) NOT NULL, 
#         city VARCHAR(255) NOT NULL, 
#         state VARCHAR(255) NOT NULL, 
#         zip VARCHAR(255) NOT NULL, 
#         phone VARCHAR(255) NOT NULL, 
#         category VARCHAR(255) NOT NULL, 
#         subcategory VARCHAR(255) NOT NULL, 
#         website VARCHAR(255), email VARCHAR(255)
# );
# CREATE TABLE IF NOT EXISTS review (
#     id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
#     business_id MEDIUMINT UNSIGNED NOT NULL, 
#     owner_id MEDIUMINT UNSIGNED NOT NULL, 
#     stars INT NOT NULL, 
#     dollars INT NOT NULL,
#     text TEXT NOT NULL
# );
# CREATE TABLE IF NOT EXISTS photo(
#     id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
#     owner_id INT UNSIGNED NOT NULL, 
#     business_id INT UNSIGNED NOT NULL, 
#     file_name VARCHAR(255) NOT NULL,
#     caption TEXT NOT NULL
# );"
