-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : ven. 27 juin 2025 à 13:40
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
-- Structure de la table `contributions`
--

DROP TABLE IF EXISTS `contributions`;
CREATE TABLE IF NOT EXISTS `contributions` (
  `contribution_id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method_id` int DEFAULT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `due_date` date NOT NULL,
  `paid_date` timestamp NULL DEFAULT NULL,
  `status` enum('pending','paid','late','missed') DEFAULT 'pending',
  `penalty_amount` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`contribution_id`),
  KEY `tontine_id` (`tontine_id`),
  KEY `user_id` (`user_id`),
  KEY `payment_method_id` (`payment_method_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `forumposts`
--

DROP TABLE IF EXISTS `forumposts`;
CREATE TABLE IF NOT EXISTS `forumposts` (
  `post_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `category` enum('funding','entrepreneurship','education','general') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`post_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `forumreplies`
--

DROP TABLE IF EXISTS `forumreplies`;
CREATE TABLE IF NOT EXISTS `forumreplies` (
  `reply_id` int NOT NULL AUTO_INCREMENT,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reply_id`),
  KEY `post_id` (`post_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mentoringsessions`
--

DROP TABLE IF EXISTS `mentoringsessions`;
CREATE TABLE IF NOT EXISTS `mentoringsessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `mentor_id` int NOT NULL,
  `mentee_id` int NOT NULL,
  `topic` varchar(200) NOT NULL,
  `scheduled_time` datetime NOT NULL,
  `duration_minutes` int NOT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `notes` text,
  `rating` int DEFAULT NULL,
  `feedback` text,
  PRIMARY KEY (`session_id`),
  KEY `mentor_id` (`mentor_id`),
  KEY `mentee_id` (`mentee_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `mentors`
--

DROP TABLE IF EXISTS `mentors`;
CREATE TABLE IF NOT EXISTS `mentors` (
  `mentor_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `expertise_area` varchar(100) NOT NULL,
  `professional_title` varchar(100) DEFAULT NULL,
  `bio` text,
  `availability` varchar(100) DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`mentor_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `notification_type` enum('payment','tontine','forum','mentoring','system') NOT NULL,
  `related_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paymentmethods`
--

DROP TABLE IF EXISTS `paymentmethods`;
CREATE TABLE IF NOT EXISTS `paymentmethods` (
  `payment_method_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `method_type` enum('mobile_money','credit_card','paypal','bank_transfer') NOT NULL,
  `details` json DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_method_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
CREATE TABLE IF NOT EXISTS `payouts` (
  `payout_id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `beneficiary_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payout_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_reference` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  PRIMARY KEY (`payout_id`),
  KEY `tontine_id` (`tontine_id`),
  KEY `beneficiary_id` (`beneficiary_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE IF NOT EXISTS `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `reporter_id` int NOT NULL,
  `reported_user_id` int NOT NULL,
  `tontine_id` int DEFAULT NULL,
  `reason` enum('fraud','non_payment','inappropriate','other') NOT NULL,
  `description` text,
  `status` enum('pending','investigating','resolved') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `reporter_id` (`reporter_id`),
  KEY `reported_user_id` (`reported_user_id`),
  KEY `tontine_id` (`tontine_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tontineparticipants`
--

DROP TABLE IF EXISTS `tontineparticipants`;
CREATE TABLE IF NOT EXISTS `tontineparticipants` (
  `participation_id` int NOT NULL AUTO_INCREMENT,
  `tontine_id` int NOT NULL,
  `user_id` int NOT NULL,
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','active','suspended','left') DEFAULT 'pending',
  `is_approved` tinyint(1) DEFAULT '0',
  `position_in_order` int DEFAULT NULL,
  `has_received_payout` tinyint(1) DEFAULT '0',
  `payout_date` date DEFAULT NULL,
  PRIMARY KEY (`participation_id`),
  UNIQUE KEY `tontine_id` (`tontine_id`,`user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `tontines`
--

DROP TABLE IF EXISTS `tontines`;
CREATE TABLE IF NOT EXISTS `tontines` (
  `tontine_id` int NOT NULL AUTO_INCREMENT,
  `creator_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text,
  `target_amount` decimal(10,2) NOT NULL,
  `contribution_amount` decimal(10,2) NOT NULL,
  `frequency` enum('weekly','biweekly','monthly') NOT NULL,
  `participant_limit` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('forming','active','completed','cancelled') DEFAULT 'forming',
  `distribution_order` enum('fixed','random','auction','need_based') NOT NULL,
  `rules` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tontine_id`),
  KEY `creator_id` (`creator_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `phone_number`, `date_of_birth`, `university`, `student_id`, `is_verified`, `verification_document`, `trust_score`, `created_at`, `updated_at`) VALUES
(4, 'Mansour Djamil', 'Ndiaye', 'mansourdjamil14@gmail.com', '$2b$10$JfectDk4i/44kwk8kPIBxe121SWFM/.5t8Yi90F6X8NZ.EprfTI3G', NULL, NULL, 'EPSI-Paris', '01', 0, NULL, 100, '2025-06-26 19:42:44', '2025-06-26 19:42:44');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
