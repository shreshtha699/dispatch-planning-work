-- Create the database once before running this file:
-- CREATE DATABASE dispatch_form;
-- Then connect to dispatch_form and execute this script.

CREATE TABLE IF NOT EXISTS dispatch_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor_name VARCHAR(160) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    contact VARCHAR(10) NOT NULL CHECK (contact ~ '^[0-9]{10}$'),
    item_name VARCHAR(200) NOT NULL,
    deadline DATE NOT NULL,
    feedback TEXT,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT latitude_range CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT longitude_range CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE INDEX IF NOT EXISTS dispatch_requests_submitted_at_idx
    ON dispatch_requests (submitted_at DESC);
