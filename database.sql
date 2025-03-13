CREATE DATABASE IF NOT EXISTS mapa_zabytkow;
USE mapa_zabytkow;

CREATE TABLE IF NOT EXISTS uzytkownicy (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    haslo VARCHAR(255) NOT NULL,
    rola ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS zabytki (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazwa VARCHAR(255) NOT NULL,
    opis TEXT,
    szerokosc DECIMAL(10,8) NOT NULL,
    dlugosc DECIMAL(11,8) NOT NULL,
    zdjecie VARCHAR(255),
    dodane_przez INT,
    data_dodania TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dodane_przez) REFERENCES uzytkownicy(id)
);

INSERT IGNORE INTO uzytkownicy (email, haslo, rola) VALUES ('admin@example.com', 'admin123', 'admin');
