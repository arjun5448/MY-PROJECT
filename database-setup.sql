CREATE DATABASE IF NOT EXISTS lic_reminder;
USE lic_reminder;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    policy_number VARCHAR(100) NOT NULL UNIQUE,
    premium_amount DECIMAL(10, 2) NOT NULL,
    premium_cycle VARCHAR(50) NOT NULL,
    last_paid_date DATE NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_clients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    client_id BIGINT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    notification_type VARCHAR(40) NOT NULL,
    delivery_status VARCHAR(40) NOT NULL,
    message_body TEXT NOT NULL,
    notification_date DATE NOT NULL,
    sent_at DATETIME NOT NULL,
    CONSTRAINT fk_notification_logs_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);
