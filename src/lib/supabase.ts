import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Item = {
  id: string;
  barcode: string;
  name: string;
  description: string;
  singles_barcode: string;
  case_barcode: string;
  pallet_barcode: string;
  created_at: string;
};

export type Inventory = {
  id: string;
  item_id: string;
  location: string;
  quantity: number;
  unit_of_measure: 'Singles' | 'Cases' | 'Pallets';
  updated_at: string;
};
