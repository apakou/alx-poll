-- Insert sample data for testing

-- Sample polls (replace the UUIDs with actual user IDs from your auth.users table)
-- Note: You'll need to update the created_by UUIDs with real user IDs from your database

INSERT INTO public.polls (id, title, description, created_by, category, expires_at, is_active) VALUES
(
    gen_random_uuid(),
    'Favorite Programming Language',
    'Help us understand which programming language is most popular among developers in our community.',
    'replace-with-actual-user-uuid',  -- Replace with actual user UUID
    'Technology',
    NOW() + INTERVAL '7 days',
    true
),
(
    gen_random_uuid(),
    'Best Time for Team Meetings',
    'Let''s find the optimal time slot for our weekly team synchronization meetings.',
    'replace-with-actual-user-uuid',  -- Replace with actual user UUID
    'Work',
    NOW() + INTERVAL '3 days',
    true
),
(
    gen_random_uuid(),
    'Office Lunch Preferences',
    'What type of cuisine should we order for our monthly office lunch gathering?',
    'replace-with-actual-user-uuid',  -- Replace with actual user UUID
    'Food',
    NOW() + INTERVAL '5 days',
    true
);

-- Sample poll options for the first poll (Programming Languages)
INSERT INTO public.poll_options (poll_id, option_text, option_order) VALUES
(
    (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1),
    'JavaScript',
    1
),
(
    (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1),
    'Python',
    2
),
(
    (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1),
    'TypeScript',
    3
),
(
    (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1),
    'Go',
    4
),
(
    (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1),
    'Rust',
    5
);

-- Sample poll options for the second poll (Meeting Times)
INSERT INTO public.poll_options (poll_id, option_text, option_order) VALUES
(
    (SELECT id FROM public.polls WHERE title = 'Best Time for Team Meetings' LIMIT 1),
    'Monday 9:00 AM',
    1
),
(
    (SELECT id FROM public.polls WHERE title = 'Best Time for Team Meetings' LIMIT 1),
    'Tuesday 2:00 PM',
    2
),
(
    (SELECT id FROM public.polls WHERE title = 'Best Time for Team Meetings' LIMIT 1),
    'Wednesday 10:00 AM',
    3
),
(
    (SELECT id FROM public.polls WHERE title = 'Best Time for Team Meetings' LIMIT 1),
    'Thursday 3:00 PM',
    4
),
(
    (SELECT id FROM public.polls WHERE title = 'Best Time for Team Meetings' LIMIT 1),
    'Friday 11:00 AM',
    5
);

-- Sample poll options for the third poll (Lunch Preferences)
INSERT INTO public.poll_options (poll_id, option_text, option_order) VALUES
(
    (SELECT id FROM public.polls WHERE title = 'Office Lunch Preferences' LIMIT 1),
    'Italian (Pizza, Pasta)',
    1
),
(
    (SELECT id FROM public.polls WHERE title = 'Office Lunch Preferences' LIMIT 1),
    'Asian (Chinese, Thai, Japanese)',
    2
),
(
    (SELECT id FROM public.polls WHERE title = 'Office Lunch Preferences' LIMIT 1),
    'Mexican (Tacos, Burritos)',
    3
),
(
    (SELECT id FROM public.polls WHERE title = 'Office Lunch Preferences' LIMIT 1),
    'Mediterranean (Greek, Turkish)',
    4
),
(
    (SELECT id FROM public.polls WHERE title = 'Office Lunch Preferences' LIMIT 1),
    'American (Burgers, Sandwiches)',
    5
);

-- Add some sample votes (you'll need to replace user IDs)
-- Note: These INSERT statements will only work if you have actual user UUIDs
-- Comment out or modify these based on your actual user data

/*
INSERT INTO public.votes (poll_id, poll_option_id, user_id) VALUES
(
    (SELECT id FROM public.polls WHERE title = 'Favorite Programming Language' LIMIT 1),
    (SELECT id FROM public.poll_options WHERE option_text = 'TypeScript' LIMIT 1),
    'replace-with-actual-user-uuid'
),
(
    (SELECT id FROM public.polls WHERE title = 'Best Time for Team Meetings' LIMIT 1),
    (SELECT id FROM public.poll_options WHERE option_text = 'Wednesday 10:00 AM' LIMIT 1),
    'replace-with-actual-user-uuid'
),
(
    (SELECT id FROM public.polls WHERE title = 'Office Lunch Preferences' LIMIT 1),
    (SELECT id FROM public.poll_options WHERE option_text = 'Italian (Pizza, Pasta)' LIMIT 1),
    'replace-with-actual-user-uuid'
);
*/
