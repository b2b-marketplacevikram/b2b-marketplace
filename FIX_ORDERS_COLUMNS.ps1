# Fix Missing Columns in Orders Table
# This script adds missing GST and payment commission columns to the orders table

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FIXING ORDERS TABLE SCHEMA" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$mysqlPath = "mysql"
$dbUser = "root"
$dbPass = "1234"
$dbName = "b2b_marketplace"

Write-Host "Adding missing columns to orders table..." -ForegroundColor Yellow

$sql = @"
USE b2b_marketplace;

-- Add missing payment fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(12,2) AFTER due_date,
ADD COLUMN IF NOT EXISTS payment_commission_rate DECIMAL(5,2) DEFAULT 0.00 AFTER credit_limit,
ADD COLUMN IF NOT EXISTS payment_commission_amount DECIMAL(12,2) DEFAULT 0.00 AFTER payment_commission_rate,
ADD COLUMN IF NOT EXISTS payment_commission_paid_by ENUM('BUYER', 'SUPPLIER') DEFAULT 'BUYER' AFTER payment_commission_amount,
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE AFTER payment_commission_paid_by;

-- Add GST Invoice fields
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE AFTER is_urgent,
ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP NULL AFTER invoice_number,
ADD COLUMN IF NOT EXISTS buyer_gstin VARCHAR(15) AFTER invoice_date,
ADD COLUMN IF NOT EXISTS supplier_gstin VARCHAR(15) AFTER buyer_gstin,
ADD COLUMN IF NOT EXISTS place_of_supply VARCHAR(100) AFTER supplier_gstin,
ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(12,2) DEFAULT 0.00 AFTER place_of_supply,
ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(12,2) DEFAULT 0.00 AFTER cgst_amount,
ADD COLUMN IF NOT EXISTS igst_amount DECIMAL(12,2) DEFAULT 0.00 AFTER sgst_amount,
ADD COLUMN IF NOT EXISTS cess_amount DECIMAL(12,2) DEFAULT 0.00 AFTER igst_amount,
ADD COLUMN IF NOT EXISTS is_same_state BOOLEAN DEFAULT TRUE AFTER cess_amount;

SELECT 'SUCCESS: All columns added!' as Result;
"@

try {
    # Execute SQL
    $sql | & $mysqlPath -u $dbUser -p$dbPass $dbName 2>&1 | Out-String | Write-Host
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  ORDERS TABLE FIXED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Added columns:" -ForegroundColor White
    Write-Host "  Payment Fields:" -ForegroundColor Cyan
    Write-Host "    - credit_limit" -ForegroundColor Gray
    Write-Host "    - payment_commission_rate" -ForegroundColor Gray
    Write-Host "    - payment_commission_amount" -ForegroundColor Gray
    Write-Host "    - payment_commission_paid_by" -ForegroundColor Gray
    Write-Host "    - is_urgent" -ForegroundColor Gray
    Write-Host "`n  GST Invoice Fields:" -ForegroundColor Cyan
    Write-Host "    - invoice_number" -ForegroundColor Gray
    Write-Host "    - invoice_date" -ForegroundColor Gray
    Write-Host "    - buyer_gstin" -ForegroundColor Gray
    Write-Host "    - supplier_gstin" -ForegroundColor Gray
    Write-Host "    - place_of_supply" -ForegroundColor Gray
    Write-Host "    - cgst_amount" -ForegroundColor Gray
    Write-Host "    - sgst_amount" -ForegroundColor Gray
    Write-Host "    - igst_amount" -ForegroundColor Gray
    Write-Host "    - cess_amount" -ForegroundColor Gray
    Write-Host "    - is_same_state" -ForegroundColor Gray
    
    Write-Host "`nYou can now place orders successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "  ERROR OCCURRED" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease run the SQL manually in MySQL:" -ForegroundColor Yellow
    Write-Host $sql -ForegroundColor White
}
