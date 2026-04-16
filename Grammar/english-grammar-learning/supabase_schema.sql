-- GrammarQuest Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create the users table

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    xp INTEGER DEFAULT 0,
    completed_topics JSONB DEFAULT '{}',
    games_played INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS users_xp_idx ON users(xp DESC);

-- Create RLS (Row Level Security) policies
-- Allow anyone to read users data (for leaderboard)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all users (for leaderboard)
CREATE POLICY "Anyone can view users" ON users
    FOR SELECT USING (true);

-- Policy: Anyone can insert new users
CREATE POLICY "Anyone can create users" ON users
    FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update their own user data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (true)
    WITH CHECK (true);

-- Enable realtime for the users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;
