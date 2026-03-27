/*
  # Add Unit-Specific Barcode Fields

  1. Modified Tables
    - `items` table
      - Added `singles_barcode` (text) - Barcode for individual item units
      - Added `case_barcode` (text) - Barcode for case/box quantities
      - Added `pallet_barcode` (text) - Barcode for pallet quantities
      - All new barcode fields are optional to maintain compatibility

  2. Notes
    - Existing `barcode` field will be used as the primary lookup barcode
    - New fields allow scanning specific barcodes per unit of measure
    - Fields can be blank if not applicable for an item
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'singles_barcode'
  ) THEN
    ALTER TABLE items ADD COLUMN singles_barcode text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'case_barcode'
  ) THEN
    ALTER TABLE items ADD COLUMN case_barcode text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'pallet_barcode'
  ) THEN
    ALTER TABLE items ADD COLUMN pallet_barcode text DEFAULT '';
  END IF;
END $$;
