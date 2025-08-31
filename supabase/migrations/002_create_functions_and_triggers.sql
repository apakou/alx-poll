-- Create functions and triggers for maintaining data consistency

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at for polls
CREATE TRIGGER update_polls_updated_at 
    BEFORE UPDATE ON public.polls
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update vote counts when votes are added/removed
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        -- Update poll_option votes_count
        UPDATE public.poll_options 
        SET votes_count = votes_count + 1 
        WHERE id = NEW.poll_option_id;
        
        -- Update poll total_votes
        UPDATE public.polls 
        SET total_votes = total_votes + 1 
        WHERE id = NEW.poll_id;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        -- Update poll_option votes_count
        UPDATE public.poll_options 
        SET votes_count = GREATEST(0, votes_count - 1) 
        WHERE id = OLD.poll_option_id;
        
        -- Update poll total_votes
        UPDATE public.polls 
        SET total_votes = GREATEST(0, total_votes - 1) 
        WHERE id = OLD.poll_id;
        
        RETURN OLD;
    END IF;
    
    -- Handle UPDATE (if vote changes option)
    IF TG_OP = 'UPDATE' THEN
        -- If the option changed
        IF OLD.poll_option_id != NEW.poll_option_id THEN
            -- Decrease count for old option
            UPDATE public.poll_options 
            SET votes_count = GREATEST(0, votes_count - 1) 
            WHERE id = OLD.poll_option_id;
            
            -- Increase count for new option
            UPDATE public.poll_options 
            SET votes_count = votes_count + 1 
            WHERE id = NEW.poll_option_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers to maintain vote counts
CREATE TRIGGER update_vote_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.votes
    FOR EACH ROW 
    EXECUTE FUNCTION update_vote_counts();

-- Function to prevent voting on expired or inactive polls
CREATE OR REPLACE FUNCTION check_poll_voting_eligibility()
RETURNS TRIGGER AS $$
DECLARE
    poll_record RECORD;
BEGIN
    -- Get poll details
    SELECT is_active, expires_at, allow_multiple_votes 
    INTO poll_record 
    FROM public.polls 
    WHERE id = NEW.poll_id;
    
    -- Check if poll is active
    IF NOT poll_record.is_active THEN
        RAISE EXCEPTION 'Cannot vote on inactive poll';
    END IF;
    
    -- Check if poll has expired
    IF poll_record.expires_at IS NOT NULL AND poll_record.expires_at < NOW() THEN
        RAISE EXCEPTION 'Cannot vote on expired poll';
    END IF;
    
    -- Check for duplicate votes if multiple votes are not allowed
    IF NOT poll_record.allow_multiple_votes AND NEW.user_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM public.votes 
            WHERE poll_id = NEW.poll_id 
            AND user_id = NEW.user_id 
            AND id != COALESCE(NEW.id, gen_random_uuid())
        ) THEN
            RAISE EXCEPTION 'User has already voted on this poll';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to check voting eligibility
CREATE TRIGGER check_voting_eligibility_trigger
    BEFORE INSERT OR UPDATE ON public.votes
    FOR EACH ROW 
    EXECUTE FUNCTION check_poll_voting_eligibility();

-- Function to clean up expired polls (can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_polls()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    -- Mark expired polls as inactive
    UPDATE public.polls 
    SET is_active = false 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    RETURN affected_rows;
END;
$$ language 'plpgsql';

-- Create a view for poll statistics
CREATE OR REPLACE VIEW poll_statistics AS
SELECT 
    p.id,
    p.title,
    p.description,
    p.created_by,
    p.created_at,
    p.expires_at,
    p.is_active,
    p.category,
    p.total_votes,
    COUNT(DISTINCT v.user_id) as unique_voters,
    CASE 
        WHEN p.expires_at IS NOT NULL AND p.expires_at < NOW() THEN 'expired'
        WHEN p.is_active THEN 'active'
        ELSE 'inactive'
    END as status
FROM public.polls p
LEFT JOIN public.votes v ON p.id = v.poll_id
GROUP BY p.id, p.title, p.description, p.created_by, p.created_at, 
         p.expires_at, p.is_active, p.category, p.total_votes;

-- Create a view for poll results with percentages
CREATE OR REPLACE VIEW poll_results AS
SELECT 
    po.id as option_id,
    po.poll_id,
    po.option_text,
    po.option_order,
    po.votes_count,
    p.total_votes,
    CASE 
        WHEN p.total_votes > 0 THEN 
            ROUND((po.votes_count::DECIMAL / p.total_votes::DECIMAL) * 100, 2)
        ELSE 0 
    END as percentage
FROM public.poll_options po
JOIN public.polls p ON po.poll_id = p.id
ORDER BY po.poll_id, po.option_order;
