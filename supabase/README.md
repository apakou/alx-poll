# Supabase Database Schema for ALX Poll Application

This directory contains the database schema and migrations for the ALX Poll application using Supabase PostgreSQL.

## 📁 Directory Structure

```
supabase/
├── migrations/
│   ├── 001_create_polls_schema.sql      # Main tables and RLS policies
│   ├── 002_create_functions_and_triggers.sql  # Database functions and triggers
│   └── 003_insert_sample_data.sql       # Sample data for testing
└── README.md
```

## 🗄️ Database Schema Overview

### Tables

#### 1. `polls`
Main table storing poll information.

**Columns:**
- `id` (UUID, Primary Key) - Unique poll identifier
- `title` (VARCHAR(255), NOT NULL) - Poll title
- `description` (TEXT) - Optional poll description
- `created_by` (UUID, NOT NULL) - Reference to auth.users(id)
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp
- `expires_at` (TIMESTAMP) - Optional expiration date
- `is_active` (BOOLEAN) - Whether the poll is active
- `is_anonymous` (BOOLEAN) - Whether votes are anonymous
- `allow_multiple_votes` (BOOLEAN) - Whether users can vote multiple times
- `category` (VARCHAR(100)) - Poll category
- `image_url` (TEXT) - Optional poll image
- `total_votes` (INTEGER) - Total number of votes (auto-updated)

#### 2. `poll_options`
Stores the available options for each poll.

**Columns:**
- `id` (UUID, Primary Key) - Unique option identifier
- `poll_id` (UUID, NOT NULL) - Reference to polls(id)
- `option_text` (VARCHAR(255), NOT NULL) - Option text
- `option_order` (INTEGER, NOT NULL) - Display order
- `votes_count` (INTEGER) - Number of votes for this option (auto-updated)
- `created_at` (TIMESTAMP) - Creation timestamp

#### 3. `votes`
Records individual votes cast by users.

**Columns:**
- `id` (UUID, Primary Key) - Unique vote identifier
- `poll_id` (UUID, NOT NULL) - Reference to polls(id)
- `poll_option_id` (UUID, NOT NULL) - Reference to poll_options(id)
- `user_id` (UUID) - Reference to auth.users(id) (NULL for anonymous votes)
- `voter_ip` (INET) - IP address for anonymous votes
- `created_at` (TIMESTAMP) - Vote timestamp

### Views

#### 1. `poll_statistics`
Provides poll statistics with calculated fields.

#### 2. `poll_results`
Shows poll results with vote counts and percentages.

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Polls Table
- **View**: Users can view active polls + their own polls (any status)
- **Create**: Authenticated users can create polls
- **Update/Delete**: Users can only modify their own polls

### Poll Options Table
- **View**: Users can view options for polls they have access to
- **Manage**: Poll creators can manage their poll options

### Votes Table
- **View**: Users can view vote statistics + their own votes
- **Create**: Users can vote on active, non-expired polls
- **Update/Delete**: Users can modify their own votes

## 🔧 Database Functions

### `update_updated_at_column()`
Automatically updates the `updated_at` timestamp when polls are modified.

### `update_vote_counts()`
Maintains vote count consistency across `poll_options` and `polls` tables.

### `check_poll_voting_eligibility()`
Validates voting eligibility (active poll, not expired, duplicate vote prevention).

### `cleanup_expired_polls()`
Marks expired polls as inactive (can be called periodically).

## 🚀 Setup Instructions

### 1. Manual Setup in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration files in order:
   - First: `001_create_polls_schema.sql`
   - Second: `002_create_functions_and_triggers.sql`
   - Third: `003_insert_sample_data.sql` (optional, for testing)

### 2. Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### 3. Environment Setup

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📝 Important Notes

### Before Using Sample Data

The sample data in `003_insert_sample_data.sql` contains placeholder UUIDs for the `created_by` field. You need to:

1. **Replace Placeholder UUIDs**: Update `replace-with-actual-user-uuid` with real user IDs from your `auth.users` table
2. **Get User UUIDs**: Query your auth.users table to get actual user IDs:
   ```sql
   SELECT id, email FROM auth.users;
   ```
3. **Update Sample Data**: Replace the placeholders in the INSERT statements

### Sample Data Modification Example

```sql
-- Instead of:
INSERT INTO public.polls (title, created_by, ...) VALUES
('Poll Title', 'replace-with-actual-user-uuid', ...);

-- Use:
INSERT INTO public.polls (title, created_by, ...) VALUES
('Poll Title', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', ...);
```

## 🔍 Querying Examples

### Get All Active Polls with Options
```sql
SELECT p.*, po.option_text, po.votes_count 
FROM polls p 
LEFT JOIN poll_options po ON p.id = po.poll_id 
WHERE p.is_active = true 
ORDER BY p.created_at DESC, po.option_order;
```

### Get Poll Results with Percentages
```sql
SELECT * FROM poll_results 
WHERE poll_id = 'your-poll-id' 
ORDER BY option_order;
```

### Get User's Voting History
```sql
SELECT v.*, p.title, po.option_text 
FROM votes v 
JOIN polls p ON v.poll_id = p.id 
JOIN poll_options po ON v.poll_option_id = po.id 
WHERE v.user_id = 'user-id' 
ORDER BY v.created_at DESC;
```

## 🛡️ Security Features

1. **Row Level Security**: All tables have RLS enabled
2. **User Isolation**: Users can only access their own data and public polls
3. **Vote Integrity**: Triggers prevent duplicate votes and maintain count consistency
4. **Expiration Handling**: Automatic prevention of votes on expired polls
5. **Input Validation**: Database constraints ensure data integrity

## 🎯 Next Steps

After setting up the database:

1. Update your TypeScript types using `lib/types/database.ts`
2. Create API routes for poll operations
3. Implement poll creation and voting UI components
4. Set up real-time subscriptions for live poll updates
5. Add database backup and monitoring

## 📊 Monitoring and Maintenance

### Periodic Tasks
- Run `cleanup_expired_polls()` to mark expired polls as inactive
- Monitor vote count consistency
- Review and update RLS policies as needed

### Performance Considerations
- Indexes are created for common query patterns
- Consider partitioning large tables in production
- Monitor query performance and add indexes as needed
