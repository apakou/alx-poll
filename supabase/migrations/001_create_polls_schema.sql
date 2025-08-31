-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- Create the polls table
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_anonymous BOOLEAN DEFAULT false NOT NULL,
    allow_multiple_votes BOOLEAN DEFAULT false NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    total_votes INTEGER DEFAULT 0 NOT NULL,
    
    -- Constraints
    CONSTRAINT polls_title_length CHECK (char_length(title) >= 3),
    CONSTRAINT polls_description_length CHECK (char_length(description) <= 1000),
    CONSTRAINT polls_expires_at_future CHECK (expires_at IS NULL OR expires_at > created_at)
);

-- Create the poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    option_text VARCHAR(255) NOT NULL,
    option_order INTEGER NOT NULL,
    votes_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT poll_options_text_length CHECK (char_length(option_text) >= 1),
    CONSTRAINT poll_options_order_positive CHECK (option_order > 0),
    CONSTRAINT poll_options_votes_non_negative CHECK (votes_count >= 0),
    
    -- Unique constraint to prevent duplicate order within a poll
    UNIQUE(poll_id, option_order)
);

-- Create the votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    poll_option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    voter_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Constraints to prevent duplicate votes (depending on poll settings)
    UNIQUE(poll_id, user_id, poll_option_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON public.polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON public.polls(expires_at);
CREATE INDEX IF NOT EXISTS idx_polls_category ON public.polls(category);

CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_options_order ON public.poll_options(poll_id, option_order);

CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_option_id ON public.votes(poll_option_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON public.votes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for polls table
-- Allow users to view active polls
CREATE POLICY "Users can view active polls" ON public.polls
    FOR SELECT USING (is_active = true);

-- Allow users to view their own polls (including inactive)
CREATE POLICY "Users can view their own polls" ON public.polls
    FOR SELECT USING (created_by = auth.uid());

-- Allow authenticated users to create polls
CREATE POLICY "Authenticated users can create polls" ON public.polls
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());

-- Allow users to update their own polls
CREATE POLICY "Users can update their own polls" ON public.polls
    FOR UPDATE USING (created_by = auth.uid());

-- Allow users to delete their own polls
CREATE POLICY "Users can delete their own polls" ON public.polls
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for poll_options table
-- Allow users to view options for polls they can view
CREATE POLICY "Users can view poll options" ON public.poll_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND (p.is_active = true OR p.created_by = auth.uid())
        )
    );

-- Allow poll creators to manage their poll options
CREATE POLICY "Poll creators can manage poll options" ON public.poll_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND p.created_by = auth.uid()
        )
    );

-- RLS Policies for votes table
-- Allow users to view votes for polls they can view (for statistics)
CREATE POLICY "Users can view vote statistics" ON public.votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND (p.is_active = true OR p.created_by = auth.uid())
        )
    );

-- Allow users to view their own votes
CREATE POLICY "Users can view their own votes" ON public.votes
    FOR SELECT USING (user_id = auth.uid());

-- Allow users to vote on active polls
CREATE POLICY "Users can vote on active polls" ON public.votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND p.is_active = true 
            AND (p.expires_at IS NULL OR p.expires_at > NOW())
        )
        AND (user_id = auth.uid() OR user_id IS NULL)
    );

-- Allow users to update their own votes (if poll allows)
CREATE POLICY "Users can update their own votes" ON public.votes
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.polls p 
            WHERE p.id = poll_id 
            AND p.is_active = true 
            AND (p.expires_at IS NULL OR p.expires_at > NOW())
        )
        AND user_id = auth.uid()
    );

-- Allow users to delete their own votes
CREATE POLICY "Users can delete their own votes" ON public.votes
    FOR DELETE USING (user_id = auth.uid());
