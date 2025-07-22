-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 08 juil. 2025 à 10:16
-- Version du serveur : 9.1.0
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `tanticampus25`
--

-- --------------------------------------------------------

--
-- Structure de la table `group_messages`
--

DROP TABLE IF EXISTS `group_messages`;
CREATE TABLE IF NOT EXISTS `group_messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `tontine_id` (`tontine_id`),
  KEY `sender_id` (`sender_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

-- 
-- Structure de la table `join_requests`
--

DROP TABLE IF EXISTS `join_requests`;
CREATE TABLE IF NOT EXISTS `join_requests` (
  `request_id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('pending','accepted','rejected','expired') DEFAULT 'pending',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `tontine_id` (`tontine_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

DROP TABLE IF EXISTS `messages`;
CREATE TABLE IF NOT EXISTS `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `content` text NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tontine_id` int DEFAULT NULL,
  `type` enum('warning','reminder','system','group_message','private_message') NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `tontine_id` (`tontine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tontines`
--

DROP TABLE IF EXISTS `tontines`;
CREATE TABLE IF NOT EXISTS `tontines` (
  `tontine_id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `tontine_code` varchar(10) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `frequency` enum('weekly','biweekly','monthly') NOT NULL,
  `contribution_amount` decimal(10,2) NOT NULL,
  `max_participants` int NOT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('pending','active','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`tontine_id`),
  UNIQUE KEY `tontine_code` (`tontine_code`),
  KEY `admin_id` (`admin_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tontines`
--

INSERT INTO `tontines` (`tontine_id`, `admin_id`, `tontine_code`, `title`, `description`, `frequency`, `contribution_amount`, `max_participants`, `start_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, '93392148QD', 'Test', NULL, 'weekly', 30.00, 5, '2025-07-10', 'pending', '2025-07-04 15:18:12', '2025-07-04 15:18:12');

-- --------------------------------------------------------

--
-- Structure de la table `tontine_cycles`
--

DROP TABLE IF EXISTS `tontine_cycles`;
CREATE TABLE IF NOT EXISTS `tontine_cycles` (
  `cycle_id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NULL DEFAULT NULL,
  `status` enum('pending','active','completed') DEFAULT 'pending',
  `amount_per_participant` decimal(10,2) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `beneficiary_id` int DEFAULT NULL,
  `payout_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`cycle_id`),
  KEY `tontine_id` (`tontine_id`),
  KEY `beneficiary_id` (`beneficiary_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tontine_participants`
--

DROP TABLE IF EXISTS `tontine_participants`;
CREATE TABLE IF NOT EXISTS `tontine_participants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role` enum('admin','coadmin','participant') DEFAULT 'participant',
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `has_received` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tontine_id` (`tontine_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tontine_participants`
--

INSERT INTO `tontine_participants` (`id`, `tontine_id`, `user_id`, `role`, `join_date`, `has_received`, `is_active`) VALUES
(1, 1, 1, 'admin', '2025-07-04 15:18:12', 0, 1);

-- --------------------------------------------------------

--
-- Structure de la table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tontine_id` int DEFAULT NULL,
  `type` enum('deposit','withdrawal','contribution','payout') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transaction_id`),
  KEY `user_id` (`user_id`),
  KEY `tontine_id` (`tontine_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `transactions`
--

INSERT INTO `transactions` (`transaction_id`, `user_id`, `tontine_id`, `type`, `amount`, `transaction_date`) VALUES
(1, 1, NULL, 'deposit', 100.00, '2025-07-06 14:57:56'),
(2, 1, NULL, 'deposit', 1000.00, '2025-07-06 14:58:42'),
(3, 1, NULL, 'withdrawal', 50.00, '2025-07-06 15:17:33');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `university` varchar(100) DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_document` varchar(255) DEFAULT NULL,
  `trust_score` int DEFAULT '100',
  `score_last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `wallet_balance` decimal(10,2) DEFAULT '0.00',
  `last_activity_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_banned` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone_number`, `date_of_birth`, `university`, `student_id`, `is_verified`, `verification_document`, `trust_score`, `score_last_updated`, `wallet_balance`, `last_activity_at`, `is_banned`, `created_at`, `updated_at`) VALUES
(1, 'Mansour Djamil', 'Ndiaye', 'mansourdjamil14@gmail.com', '$2b$10$593KphZ1UM7P2x6LQL4Mcu/65Q5sCn6TmQrWKEtcns2fFqK8wZihC', NULL, NULL, 'EPSI-Paris', '01', 0, NULL, 100, '2025-07-04 11:24:10', 1050.00, '2025-07-04 13:24:10', 0, '2025-07-04 11:24:10', '2025-07-06 15:17:33');

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `group_messages`
--
ALTER TABLE `group_messages`
  ADD CONSTRAINT `group_messages_ibfk_1` FOREIGN KEY (`tontine_id`) REFERENCES `tontines` (`tontine_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `join_requests`
--
ALTER TABLE `join_requests`
  ADD CONSTRAINT `join_requests_ibfk_1` FOREIGN KEY (`tontine_id`) REFERENCES `tontines` (`tontine_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `join_requests_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`tontine_id`) REFERENCES `tontines` (`tontine_id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `tontines`
--
ALTER TABLE `tontines`
  ADD CONSTRAINT `tontines_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `tontine_cycles`
--
ALTER TABLE `tontine_cycles`
  ADD CONSTRAINT `tontine_cycles_ibfk_1` FOREIGN KEY (`tontine_id`) REFERENCES `tontines` (`tontine_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tontine_cycles_ibfk_2` FOREIGN KEY (`beneficiary_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `tontine_participants`
--
ALTER TABLE `tontine_participants`
  ADD CONSTRAINT `tontine_participants_ibfk_1` FOREIGN KEY (`tontine_id`) REFERENCES `tontines` (`tontine_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tontine_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`tontine_id`) REFERENCES `tontines` (`tontine_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
