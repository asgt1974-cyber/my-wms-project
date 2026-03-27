/*
  # Create WMS Tables

  1. New Tables
    - `items`
      - `id` (uuid, primary key) - Unique identifier for each item
      - `barcode` (text, unique, not null) - Barcode/SKU for the item
      - `name` (text, not null) - Item name
      - `description` (text) - Item description
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `inventory`
      - `id` (uuid, primary key) - Unique identifier for each inventory record
      - `item_id` (uuid, foreign key to items) - Reference to the item
      - `location` (text, not null) - Storage location
      - `quantity` (integer, not null) - Quantity in stock
      - `unit_of_measure` (text, not null) - Unit type (Singles, Cases, Pallets)
      - `updated_at` (timestamptz) - Last update timestamp
      - Unique constraint on (item_id, location, unit_of_measure)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and write data
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode text UNIQUE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  location text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit_of_measure text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(item_id, location, unit_of_measure)
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read items"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read inventory"
  ON inventory FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);