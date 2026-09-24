DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ministries' AND column_name = 'category') THEN
        ALTER TABLE ministries 
        ADD COLUMN category text NOT NULL DEFAULT 'ministry';

        ALTER TABLE ministries
        ADD CONSTRAINT ministries_category_check CHECK (category IN ('ministry', 'outreach'));
    END IF;
END $$;
