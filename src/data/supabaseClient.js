import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tenuvwcyiyqtrzairydb.supabase.co';
const supabaseKey = 'sb_publishable_HMI1Qu40qlnHGmxH7PrCJg_GSLn0tjf';

export const supabase = createClient(supabaseUrl, supabaseKey);