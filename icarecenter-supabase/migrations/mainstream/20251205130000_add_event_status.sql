-- Add status column to events table
ALTER TABLE events 
ADD COLUMN status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'postponed', 'done'));

-- Update existing events to have 'done' status if their date is in the past
UPDATE events 
SET status = 'done' 
WHERE event_date < CURRENT_DATE AND status = 'scheduled';

-- Add index for better query performance
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_status_date ON events(status, event_date);

-- Add comment to document the status values
COMMENT ON COLUMN events.status IS 'Event status: scheduled (upcoming), postponed (delayed), done (completed)';