-- Migration: Add advance_amount to invoices table
ALTER TABLE `invoices` ADD COLUMN `advance_amount` DECIMAL(10,2) DEFAULT 0.00 AFTER `subtotal`;
    