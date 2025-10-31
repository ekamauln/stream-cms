/*
 Navicat Premium Dump SQL

 Source Server         : MySQL
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : stream-cms

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 31/10/2025 15:25:45
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _moviecategories
-- ----------------------------
DROP TABLE IF EXISTS `_moviecategories`;
CREATE TABLE `_moviecategories`  (
  `A` int NOT NULL,
  `B` int NOT NULL,
  UNIQUE INDEX `_MovieCategories_AB_unique`(`A` ASC, `B` ASC) USING BTREE,
  INDEX `_MovieCategories_B_index`(`B` ASC) USING BTREE,
  CONSTRAINT `_MovieCategories_A_fkey` FOREIGN KEY (`A`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_MovieCategories_B_fkey` FOREIGN KEY (`B`) REFERENCES `movie` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of _moviecategories
-- ----------------------------
INSERT INTO `_moviecategories` VALUES (2, 2);

-- ----------------------------
-- Table structure for _prisma_migrations
-- ----------------------------
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations`  (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) NULL DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `rolled_back_at` datetime(3) NULL DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of _prisma_migrations
-- ----------------------------
INSERT INTO `_prisma_migrations` VALUES ('bb99c700-2465-4fdb-a126-6c13dd64a660', '1752bb5115e58bdb63629fcaec92f9f0359f3ea35888eb29fe73ff09097f0ba3', '2025-10-31 02:10:16.024', '20251031021015_update', NULL, NULL, '2025-10-31 02:10:15.952', 1);
INSERT INTO `_prisma_migrations` VALUES ('bc26284d-c9b4-4512-9e21-2b290c16cb73', '7f688f90fb7915051338726808d617020c0cb46cb7e10431245416545222de0b', '2025-10-30 07:30:54.908', '20251030073054_init', NULL, NULL, '2025-10-30 07:30:54.265', 1);
INSERT INTO `_prisma_migrations` VALUES ('d4520bed-fc96-4341-8c14-460d531dac72', '1c428a5004a7b846894b9720c029272f255c3e632c461134d48d08b8af639845', '2025-10-31 01:12:36.303', '20251031011236_add_movie_meta_tags', NULL, NULL, '2025-10-31 01:12:36.216', 1);

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accountId` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerId` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accessToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `refreshToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `idToken` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `accessTokenExpiresAt` datetime(3) NULL DEFAULT NULL,
  `refreshTokenExpiresAt` datetime(3) NULL DEFAULT NULL,
  `scope` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `account_userId_fkey`(`userId` ASC) USING BTREE,
  CONSTRAINT `account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of account
-- ----------------------------
INSERT INTO `account` VALUES ('Qq1H7cZ0RVLmKkqyabzowZbTXzbZwEeP', 'v74xfPz66MgiBBpIjUbunGPbsEuJ3S9q', 'credential', 'v74xfPz66MgiBBpIjUbunGPbsEuJ3S9q', NULL, NULL, NULL, NULL, NULL, NULL, 'aa35d772dc8742ca9939ecdb1bb0b35b:06769bf77d6524c0f438f18621be7c9a7ec38c88fb88b1f42f0704f26d6084e69bd37168bd2fec9dc0e7d2839e270786305442dadb7a655fab2eed55f365b8e9', '2025-10-30 07:46:15.190', '2025-10-30 07:46:15.190');

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `Category_slug_key`(`slug` ASC) USING BTREE,
  INDEX `Category_name_idx`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES (1, 'Action', 'action', 'Action', '2025-10-30 09:37:42.394', '2025-10-31 06:55:37.066');
INSERT INTO `category` VALUES (2, 'Comedy', 'comedy', 'Comedy', '2025-10-30 09:37:54.584', '2025-10-31 06:55:44.050');

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `movieId` int NOT NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `authorName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `authorEmail` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `text` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `isApproved` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `Comment_movieId_idx`(`movieId` ASC) USING BTREE,
  INDEX `Comment_userId_idx`(`userId` ASC) USING BTREE,
  INDEX `Comment_createdAt_idx`(`createdAt` ASC) USING BTREE,
  CONSTRAINT `Comment_movieId_fkey` FOREIGN KEY (`movieId`) REFERENCES `movie` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment
-- ----------------------------
INSERT INTO `comment` VALUES (1, 2, 'v74xfPz66MgiBBpIjUbunGPbsEuJ3S9q', NULL, NULL, 'test', '::1', 1, '2025-10-31 08:15:49.912');
INSERT INTO `comment` VALUES (2, 2, NULL, 'test', 'test@example.com', 'testsltl;fdgkhlkfjghfhj', '::1', 1, '2025-10-31 08:16:45.724');
INSERT INTO `comment` VALUES (3, 2, 'v74xfPz66MgiBBpIjUbunGPbsEuJ3S9q', NULL, NULL, 'test lagi', '::1', 1, '2025-10-31 08:21:26.328');

-- ----------------------------
-- Table structure for movie
-- ----------------------------
DROP TABLE IF EXISTS `movie`;
CREATE TABLE `movie`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `synopsis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `releaseYear` int NULL DEFAULT NULL,
  `duration` int NULL DEFAULT NULL,
  `language` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `posterUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `videoUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT 0,
  `featured` tinyint(1) NOT NULL DEFAULT 0,
  `viewCount` int NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `metaDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `metaKeywords` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `metaTitle` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `Movie_slug_key`(`slug` ASC) USING BTREE,
  INDEX `Movie_title_idx`(`title` ASC) USING BTREE,
  INDEX `Movie_isPublished_idx`(`isPublished` ASC) USING BTREE,
  INDEX `Movie_featured_idx`(`featured` ASC) USING BTREE,
  INDEX `Movie_createdAt_idx`(`createdAt` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of movie
-- ----------------------------
INSERT INTO `movie` VALUES (2, 'Agak laen 1', 'agak-laen-1', 'Agak laen 1', 2025, 120, 'English', '/images/posters/localhost-agak-laen-1.webp', 'https://short.icu/H-qxNCUOi', 1, 1, 24, '2025-10-31 06:39:56.225', '2025-10-31 08:21:17.093', '', 'begini, begitu, film', '');

-- ----------------------------
-- Table structure for session
-- ----------------------------
DROP TABLE IF EXISTS `session`;
CREATE TABLE `session`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `token` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `ipAddress` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `userAgent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `userId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `session_token_key`(`token` ASC) USING BTREE,
  INDEX `session_userId_fkey`(`userId` ASC) USING BTREE,
  CONSTRAINT `session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of session
-- ----------------------------
INSERT INTO `session` VALUES ('8DY5QRQuA7v1IlKv88ueL6KIriBTeyZl', '2025-11-07 08:17:26.523', 'XynwiTFE9zjQ0nboygi1FqFdUDSabSA4', '2025-10-31 08:17:26.524', '2025-10-31 08:17:26.524', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'v74xfPz66MgiBBpIjUbunGPbsEuJ3S9q');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `image` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_email_key`(`email` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('v74xfPz66MgiBBpIjUbunGPbsEuJ3S9q', 'Saya', 'saya@example.com', 0, NULL, '2025-10-30 07:46:15.183', '2025-10-30 07:46:15.183');

-- ----------------------------
-- Table structure for verification
-- ----------------------------
DROP TABLE IF EXISTS `verification`;
CREATE TABLE `verification`  (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `identifier` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of verification
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
