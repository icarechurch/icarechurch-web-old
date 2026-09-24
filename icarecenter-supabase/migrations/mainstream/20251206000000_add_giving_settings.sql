-- Create giving_settings table to store donation platform information
CREATE TABLE IF NOT EXISTS giving_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gcash_qr_url TEXT,
  donation_platform_name TEXT DEFAULT 'Buy Me a Coffee',
  donation_platform_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row
INSERT INTO giving_settings (gcash_qr_url, donation_platform_name, donation_platform_url)
VALUES (
  NULL,
  'Buy Me a Coffee',
  NULL
);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_giving_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_giving_settings_timestamp
  BEFORE UPDATE ON giving_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_giving_settings_updated_at();

-- Enable RLS
ALTER TABLE giving_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to giving settings"
  ON giving_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update (admins only in practice)
CREATE POLICY "Allow authenticated users to update giving settings"
  ON giving_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
