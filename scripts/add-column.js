const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fbqpbobsqwcgzbwyeisx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicXBib2JzcXdjZ3pid3llaXN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU4OTI5MiwiZXhwIjoyMDg4MTY1MjkyfQ.2Cw7_nf-ewqLNQXN_R7n0zJU7DQs_eU4uGxSbCwtHHc';

const supabase = createClient(supabaseUrl, serviceKey);

async function addColumn() {
  try {
    // Use pg_catalog to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      query: "ALTER TABLE robots ADD COLUMN IF NOT EXISTS review_api_url TEXT;"
    });
    
    if (error) {
      console.log('RPC Error:', error);
      
      // Try alternative: check if column exists by querying
      const { data: rows, error: selectError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'robots')
        .eq('column_name', 'review_api_url');
      
      if (rows && rows.length > 0) {
        console.log('Column already exists!');
      } else {
        console.log('Column does not exist and could not be added via RPC');
        console.log('Please add manually: ALTER TABLE robots ADD COLUMN review_api_url TEXT;');
      }
    } else {
      console.log('Success:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

addColumn();
