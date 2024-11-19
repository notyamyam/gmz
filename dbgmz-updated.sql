/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 100138
 Source Host           : localhost:3306
 Source Schema         : dbgmz

 Target Server Type    : MySQL
 Target Server Version : 100138
 File Encoding         : 65001

 Date: 19/11/2024 16:47:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tblcategories
-- ----------------------------
DROP TABLE IF EXISTS `tblcategories`;
CREATE TABLE `tblcategories`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `type` enum('Document','Inventory','RawMaterial') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblcategories
-- ----------------------------
INSERT INTO `tblcategories` VALUES (1, 'Bills', 'Document');
INSERT INTO `tblcategories` VALUES (2, 'Contracts', 'Document');
INSERT INTO `tblcategories` VALUES (10, 'Shawarma Meats', 'Inventory');
INSERT INTO `tblcategories` VALUES (11, 'Sauces', 'Inventory');
INSERT INTO `tblcategories` VALUES (12, 'Pitas', 'Inventory');
INSERT INTO `tblcategories` VALUES (13, 'Meat Raw Materials', 'RawMaterial');
INSERT INTO `tblcategories` VALUES (14, 'Sauce Ingredients', 'RawMaterial');
INSERT INTO `tblcategories` VALUES (15, 'Bread Ingredients', 'RawMaterial');
INSERT INTO `tblcategories` VALUES (16, 'Vegetable Raw Materials', 'RawMaterial');
INSERT INTO `tblcategories` VALUES (17, 'Spices and Seasonings', 'RawMaterial');

-- ----------------------------
-- Table structure for tbldocument
-- ----------------------------
DROP TABLE IF EXISTS `tbldocument`;
CREATE TABLE `tbldocument`  (
  `id` int(55) NOT NULL AUTO_INCREMENT,
  `documentName` varchar(255) CHARACTER SET utf8 COLLATE utf8_estonian_ci NOT NULL,
  `filePath` varchar(255) CHARACTER SET utf8 COLLATE utf8_estonian_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8 COLLATE utf8_estonian_ci NOT NULL,
  `dateUploaded` date NOT NULL,
  `expirationDate` date NOT NULL,
  `description` varchar(255) CHARACTER SET utf8 COLLATE utf8_estonian_ci NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_estonian_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tbldocument
-- ----------------------------
INSERT INTO `tbldocument` VALUES (1, 'PRAF', '/uploads/1731982157346-PRAF.pdf', 'Bills', '2024-11-19', '2025-10-22', 'This is a praf');
INSERT INTO `tbldocument` VALUES (2, 'Employee_starter_kit', '/uploads/1731984745417-Employee_starter_kit.pdf', 'Contracts', '2024-11-19', '2025-06-10', 'This is starter kit.');

-- ----------------------------
-- Table structure for tblinventory
-- ----------------------------
DROP TABLE IF EXISTS `tblinventory`;
CREATE TABLE `tblinventory`  (
  `inventoryId` int(11) NOT NULL AUTO_INCREMENT,
  `productionId` int(11) NOT NULL,
  `quantity` int(255) NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lastUpdated` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`inventoryId`) USING BTREE,
  INDEX `productionId`(`productionId`) USING BTREE,
  CONSTRAINT `tblinventory_ibfk_1` FOREIGN KEY (`productionId`) REFERENCES `tblproduction` (`productionId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblinventory
-- ----------------------------
INSERT INTO `tblinventory` VALUES (1, 4, 40, 'Available', '2024-10-07 19:25:01');
INSERT INTO `tblinventory` VALUES (2, 5, 30, 'Available', '2024-10-07 19:15:27');
INSERT INTO `tblinventory` VALUES (3, 6, 100, 'Available', '2024-10-07 19:15:31');
INSERT INTO `tblinventory` VALUES (4, 7, 20, 'Available', '2024-10-07 19:15:35');

-- ----------------------------
-- Table structure for tblitems
-- ----------------------------
DROP TABLE IF EXISTS `tblitems`;
CREATE TABLE `tblitems`  (
  `itemId` int(11) NOT NULL AUTO_INCREMENT,
  `itemName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `price` int(11) NOT NULL,
  `category` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` double(55, 0) NOT NULL,
  PRIMARY KEY (`itemId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblitems
-- ----------------------------
INSERT INTO `tblitems` VALUES (1, 'Cooked Chicken Shawarma 1kg', 1005, 'Shawarma Meats', 'Cooked Shawarma Chicken ', 25);
INSERT INTO `tblitems` VALUES (2, 'Hot Vegan Sauce 1 Bottle', 50, 'Sauces', 'A hot sauce', 25);
INSERT INTO `tblitems` VALUES (6, '1kg Grilled Lamb Shawarma', 150, 'Shawarma Meats', 'Juicy grilled lamb Shawarma, seasoned with spices and grilled to perfection.', 25);
INSERT INTO `tblitems` VALUES (7, '500g Ground Beef Shawarma', 90, 'Shawarma Meats', 'Ground beef Shawarma, perfect for mixing with vegetables and sauces.', 25);
INSERT INTO `tblitems` VALUES (8, '1kg Beef Ribs Shawarma', 180, 'Shawarma Meats', 'Slow-cooked beef ribs Shawarma with a smoky flavor, ideal for wraps.', 25);
INSERT INTO `tblitems` VALUES (10, '500g Garlic Tahini Sauce', 45, 'Sauces', 'Creamy and savory tahini sauce with a rich garlic flavor, perfect for Shawarma wraps.', 25);
INSERT INTO `tblitems` VALUES (11, '1 liter Lemon Garlic Sauce', 40, 'Sauces', 'Zesty lemon and garlic sauce, ideal for enhancing the flavors of Shawarma.', 25);
INSERT INTO `tblitems` VALUES (12, '500g Yogurt-Based Shawarma Sauce', 60, 'Sauces', 'Tangy yogurt-based sauce, adding creaminess to Shawarma wraps.', 25);
INSERT INTO `tblitems` VALUES (13, '10 Pita Bread (Pack)', 30, 'Pitas', 'Soft, fluffy pita bread, perfect for wrapping Shawarma meat and veggies.', 25);
INSERT INTO `tblitems` VALUES (14, '20 Whole Wheat Pita Breads', 40, 'Pitas', 'Healthier option with whole wheat flour, perfect for Shawarma wraps.', 25);
INSERT INTO `tblitems` VALUES (15, '10 Mini Pita Breads', 25, 'Pitas', 'Small-sized pita breads, ideal for making Shawarma sliders or wraps.', 25);
INSERT INTO `tblitems` VALUES (16, 'Pork Sams', 27, 'Sauces', 'This is sam buff', 0);

-- ----------------------------
-- Table structure for tblmatlogsmats
-- ----------------------------
DROP TABLE IF EXISTS `tblmatlogsmats`;
CREATE TABLE `tblmatlogsmats`  (
  `logId` int(11) NOT NULL,
  `matId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`logId`, `matId`) USING BTREE,
  INDEX `matId`(`matId`) USING BTREE,
  CONSTRAINT `tblmatlogsmats_ibfk_1` FOREIGN KEY (`logId`) REFERENCES `tblproductionmateriallogs` (`logId`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `tblmatlogsmats_ibfk_2` FOREIGN KEY (`matId`) REFERENCES `tblrawmats` (`matId`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblmatlogsmats
-- ----------------------------
INSERT INTO `tblmatlogsmats` VALUES (1, 3, 50);
INSERT INTO `tblmatlogsmats` VALUES (2, 3, 30);
INSERT INTO `tblmatlogsmats` VALUES (3, 6, 20);
INSERT INTO `tblmatlogsmats` VALUES (4, 6, 15);
INSERT INTO `tblmatlogsmats` VALUES (5, 6, 25);
INSERT INTO `tblmatlogsmats` VALUES (9, 12, 1);
INSERT INTO `tblmatlogsmats` VALUES (9, 14, 1);

-- ----------------------------
-- Table structure for tblorders
-- ----------------------------
DROP TABLE IF EXISTS `tblorders`;
CREATE TABLE `tblorders`  (
  `orderId` int(11) NOT NULL AUTO_INCREMENT,
  `itemId` int(11) NULL DEFAULT NULL,
  `quantity` int(11) NULL DEFAULT NULL,
  `customerName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `date` date NULL DEFAULT NULL,
  `price` decimal(10, 2) NULL DEFAULT NULL,
  `status` enum('preparing','on delivery','delivered','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lastUpdateDate` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0),
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `paymentStatus` enum('paid','unpaid') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'unpaid',
  `modeOfPayment` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`orderId`) USING BTREE,
  INDEX `itemId`(`itemId`) USING BTREE,
  CONSTRAINT `tblorders_ibfk_1` FOREIGN KEY (`itemId`) REFERENCES `tblitems` (`itemId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblorders
-- ----------------------------
INSERT INTO `tblorders` VALUES (1, 1, 5, 'John Doe', '2024-10-30', 250.00, 'delivered', '2024-11-19 13:45:42', '123 Main St', 'unpaid', 'credit card');
INSERT INTO `tblorders` VALUES (2, 2, 3, 'Jane Smith', '2024-10-29', 180.00, 'cancelled', '2024-11-19 13:42:58', '456 Elm St', 'paid', 'cash');
INSERT INTO `tblorders` VALUES (5, 1, 1, 'LA ', '2024-10-30', 200.00, 'on delivery', '2024-10-30 19:22:44', 'Cabuyao', 'paid', 'GCASH');
INSERT INTO `tblorders` VALUES (6, 1, 1, 'LA', '2024-10-30', 200.00, 'preparing', '2024-10-30 19:22:51', 'CALAMBA', 'paid', 'GCASH');
INSERT INTO `tblorders` VALUES (7, 1, 1, 'Sharon', '2024-10-30', 200.00, 'preparing', '2024-10-30 19:23:06', 'Canlalay', 'unpaid', 'Paymaya');
INSERT INTO `tblorders` VALUES (11, 1, 2, 'Oner', '2024-11-03', 200.00, 'preparing', '2024-11-03 18:43:20', 'Korea', 'paid', 'Gcash');
INSERT INTO `tblorders` VALUES (12, 1, 17, 'Oner', '2024-11-03', 100.00, 'preparing', '2024-11-03 19:14:48', 'Korea', 'paid', 'Gcash');
INSERT INTO `tblorders` VALUES (13, 1, 3, 'Keria', '2024-11-03', 300.00, 'cancelled', '2024-11-19 13:45:19', 'Koreaa', 'paid', 'Cash on Delivery');

-- ----------------------------
-- Table structure for tblproduction
-- ----------------------------
DROP TABLE IF EXISTS `tblproduction`;
CREATE TABLE `tblproduction`  (
  `productionId` int(11) NOT NULL AUTO_INCREMENT,
  `itemId` int(11) NULL DEFAULT NULL,
  `quantityProduced` int(11) NOT NULL,
  `productionDate` date NOT NULL,
  `staffName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  PRIMARY KEY (`productionId`) USING BTREE,
  INDEX `itemId`(`itemId`) USING BTREE,
  CONSTRAINT `tblproduction_ibfk_1` FOREIGN KEY (`itemId`) REFERENCES `tblitems` (`itemId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblproduction
-- ----------------------------
INSERT INTO `tblproduction` VALUES (4, 1, 40, '2024-10-03', 'John Doo');
INSERT INTO `tblproduction` VALUES (5, 2, 30, '2024-10-05', 'Jane Smith');
INSERT INTO `tblproduction` VALUES (6, 2, 100, '2024-10-04', 'Mark Johnson');
INSERT INTO `tblproduction` VALUES (7, 2, 20, '2024-10-06', 'Miguel');
INSERT INTO `tblproduction` VALUES (12, 6, 10, '2024-11-07', 'John Doe');

-- ----------------------------
-- Table structure for tblproductionmateriallogs
-- ----------------------------
DROP TABLE IF EXISTS `tblproductionmateriallogs`;
CREATE TABLE `tblproductionmateriallogs`  (
  `logId` int(11) NOT NULL AUTO_INCREMENT,
  `dateLogged` date NOT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`logId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblproductionmateriallogs
-- ----------------------------
INSERT INTO `tblproductionmateriallogs` VALUES (1, '2024-11-03', 'Used for producing item A');
INSERT INTO `tblproductionmateriallogs` VALUES (2, '2024-11-03', 'Used for producing item B');
INSERT INTO `tblproductionmateriallogs` VALUES (3, '2024-11-03', 'Additional usage for item A');
INSERT INTO `tblproductionmateriallogs` VALUES (4, '2024-11-03', 'Used for producing item C');
INSERT INTO `tblproductionmateriallogs` VALUES (5, '2024-11-03', 'Supplemental usage for item B');
INSERT INTO `tblproductionmateriallogs` VALUES (8, '2024-11-07', 'Making Sauces');
INSERT INTO `tblproductionmateriallogs` VALUES (9, '2024-11-07', 'Making Sauces');

-- ----------------------------
-- Table structure for tblrawmats
-- ----------------------------
DROP TABLE IF EXISTS `tblrawmats`;
CREATE TABLE `tblrawmats`  (
  `matId` int(11) NOT NULL AUTO_INCREMENT,
  `matName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quantity` int(11) NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`matId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblrawmats
-- ----------------------------
INSERT INTO `tblrawmats` VALUES (3, '1kg Chicken Meat', 0, 'Meat Raw Materials');
INSERT INTO `tblrawmats` VALUES (6, '1 liter Soy Sauce', 0, 'Sauce Ingredients');
INSERT INTO `tblrawmats` VALUES (8, '1kg Chicken Breast', 10, 'Meat Raw Materials');
INSERT INTO `tblrawmats` VALUES (9, '1kg Lamb Shoulder', 15, 'Meat Raw Materials');
INSERT INTO `tblrawmats` VALUES (10, '500g Ground Beef', 20, 'Meat Raw Materials');
INSERT INTO `tblrawmats` VALUES (11, '2kg Beef Ribs', 8, 'Meat Raw Materials');
INSERT INTO `tblrawmats` VALUES (12, '1 liter Soy Sauce', 30, 'Sauce Ingredients');
INSERT INTO `tblrawmats` VALUES (13, '500g Tahini', 12, 'Sauce Ingredients');
INSERT INTO `tblrawmats` VALUES (14, '1 liter Olive Oil', 25, 'Sauce Ingredients');
INSERT INTO `tblrawmats` VALUES (15, '200g Garlic Paste', 18, 'Sauce Ingredients');
INSERT INTO `tblrawmats` VALUES (16, '2kg All-Purpose Flour', 40, 'Bread Ingredients');
INSERT INTO `tblrawmats` VALUES (17, '500g Yeast', 15, 'Bread Ingredients');
INSERT INTO `tblrawmats` VALUES (18, '1 liter Olive Oil', 12, 'Bread Ingredients');
INSERT INTO `tblrawmats` VALUES (19, '1kg Whole Wheat Flour', 20, 'Bread Ingredients');
INSERT INTO `tblrawmats` VALUES (20, '1kg Tomatoes', 50, 'Vegetable Raw Materials');
INSERT INTO `tblrawmats` VALUES (21, '500g Lettuce', 30, 'Vegetable Raw Materials');
INSERT INTO `tblrawmats` VALUES (22, '1kg Cucumbers', 45, 'Vegetable Raw Materials');
INSERT INTO `tblrawmats` VALUES (23, '500g Onions', 35, 'Vegetable Raw Materials');
INSERT INTO `tblrawmats` VALUES (24, '200g Cumin Powder', 40, 'Spices and Seasonings');
INSERT INTO `tblrawmats` VALUES (25, '100g Paprika', 60, 'Spices and Seasonings');
INSERT INTO `tblrawmats` VALUES (26, '250g Ground Coriander', 25, 'Spices and Seasonings');
INSERT INTO `tblrawmats` VALUES (27, '150g Ground Black Pepper', 20, 'Spices and Seasonings');

-- ----------------------------
-- Table structure for tblrawmatsinv
-- ----------------------------
DROP TABLE IF EXISTS `tblrawmatsinv`;
CREATE TABLE `tblrawmatsinv`  (
  `inventoryId` int(11) NOT NULL AUTO_INCREMENT,
  `supDeliId` int(11) NOT NULL,
  `quantity` int(255) NOT NULL,
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lastUpdated` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`inventoryId`) USING BTREE,
  INDEX `supplyDeliveryId`(`supDeliId`) USING BTREE,
  CONSTRAINT `supplyDeliveryId` FOREIGN KEY (`supDeliId`) REFERENCES `tblsupdeli` (`supDeliId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblrawmatsinv
-- ----------------------------
INSERT INTO `tblrawmatsinv` VALUES (1, 1, 100, 'Available', '2024-10-14 21:16:46');
INSERT INTO `tblrawmatsinv` VALUES (2, 2, 200, 'Available', '2024-10-14 21:16:55');
INSERT INTO `tblrawmatsinv` VALUES (3, 3, 50, 'Used', '2024-10-16 16:42:50');
INSERT INTO `tblrawmatsinv` VALUES (4, 4, 150, 'Available', '2024-10-14 21:17:00');
INSERT INTO `tblrawmatsinv` VALUES (5, 7, 75, 'Available', '2024-10-14 21:16:11');

-- ----------------------------
-- Table structure for tblsupdeli
-- ----------------------------
DROP TABLE IF EXISTS `tblsupdeli`;
CREATE TABLE `tblsupdeli`  (
  `supDeliId` int(11) NOT NULL AUTO_INCREMENT,
  `supplyId` int(11) NOT NULL,
  `matId` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `cost` int(11) NOT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`supDeliId`) USING BTREE,
  INDEX `supplier`(`supplyId`) USING BTREE,
  INDEX `rawMats`(`matId`) USING BTREE,
  CONSTRAINT `rawMats` FOREIGN KEY (`matId`) REFERENCES `tblrawmats` (`matId`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `supplier` FOREIGN KEY (`supplyId`) REFERENCES `tblsuppliers` (`supplyId`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblsupdeli
-- ----------------------------
INSERT INTO `tblsupdeli` VALUES (1, 7, 3, 20, 2002, '2024-09-11');
INSERT INTO `tblsupdeli` VALUES (2, 4, 6, 23, 3500, '2024-09-16');
INSERT INTO `tblsupdeli` VALUES (3, 7, 3, 20, 4001, '2024-10-05');
INSERT INTO `tblsupdeli` VALUES (4, 4, 3, 20, 4000, '2024-10-05');
INSERT INTO `tblsupdeli` VALUES (7, 4, 3, 10, 2000, '2024-10-14');

-- ----------------------------
-- Table structure for tblsupplierrawmats
-- ----------------------------
DROP TABLE IF EXISTS `tblsupplierrawmats`;
CREATE TABLE `tblsupplierrawmats`  (
  `supplierId` int(11) NOT NULL,
  `rawMatId` int(11) NOT NULL,
  PRIMARY KEY (`supplierId`, `rawMatId`) USING BTREE,
  INDEX `rawMatId`(`rawMatId`) USING BTREE,
  CONSTRAINT `tblsupplierrawmats_ibfk_1` FOREIGN KEY (`supplierId`) REFERENCES `tblsuppliers` (`supplyId`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `tblsupplierrawmats_ibfk_2` FOREIGN KEY (`rawMatId`) REFERENCES `tblrawmats` (`matId`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblsupplierrawmats
-- ----------------------------
INSERT INTO `tblsupplierrawmats` VALUES (4, 3);
INSERT INTO `tblsupplierrawmats` VALUES (4, 6);
INSERT INTO `tblsupplierrawmats` VALUES (5, 3);
INSERT INTO `tblsupplierrawmats` VALUES (7, 6);
INSERT INTO `tblsupplierrawmats` VALUES (9, 3);
INSERT INTO `tblsupplierrawmats` VALUES (9, 6);
INSERT INTO `tblsupplierrawmats` VALUES (12, 20);
INSERT INTO `tblsupplierrawmats` VALUES (12, 24);

-- ----------------------------
-- Table structure for tblsuppliers
-- ----------------------------
DROP TABLE IF EXISTS `tblsuppliers`;
CREATE TABLE `tblsuppliers`  (
  `supplyId` int(11) NOT NULL AUTO_INCREMENT,
  `supplyName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `contact` bigint(100) NOT NULL,
  PRIMARY KEY (`supplyId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblsuppliers
-- ----------------------------
INSERT INTO `tblsuppliers` VALUES (4, 'Jester', 'Mamatid', 9987654321);
INSERT INTO `tblsuppliers` VALUES (5, 'John', 'Calamba', 9454468426);
INSERT INTO `tblsuppliers` VALUES (7, 'LA', 'Binan', 9123456789);
INSERT INTO `tblsuppliers` VALUES (9, 'Lawrence', 'Cabuyao', 9999999999);
INSERT INTO `tblsuppliers` VALUES (12, 'Sam Milby', '', 998764532212);

-- ----------------------------
-- Table structure for tblusers
-- ----------------------------
DROP TABLE IF EXISTS `tblusers`;
CREATE TABLE `tblusers`  (
  `id` int(55) NOT NULL AUTO_INCREMENT,
  `username` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `access` int(55) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tblusers
-- ----------------------------
INSERT INTO `tblusers` VALUES (1, 'admin', 'password', 1);
INSERT INTO `tblusers` VALUES (2, 'data', 'password', 2);
INSERT INTO `tblusers` VALUES (3, 'sales', 'password', 3);
INSERT INTO `tblusers` VALUES (8, 'liam', 'password', 4);

SET FOREIGN_KEY_CHECKS = 1;
