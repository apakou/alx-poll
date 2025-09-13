# ALX Poll - Modern Polling Application

![ALX Poll Application](https://github.com/user-attachments/assets/73151e6f-67e6-4aeb-87be-683e027898f9)

A modern, full-stack polling application built with Next.js 15, TypeScript, and Supabase. Create, share, and analyze polls with real-time voting, comprehensive analytics, and a beautiful user interface.

## 🚀 Features

### Core Functionality
- **Poll Creation & Management**: Create polls with multiple options, descriptions, categories, and expiration dates
- **Real-time Voting**: Instant vote counting with live result updates
- **Poll Sharing**: Share polls via social media, email, or direct links
- **User Dashboard**: Comprehensive analytics and poll management interface
- **Authentication**: Secure user registration and login with Supabase Auth

### Advanced Features
- **Anonymous Voting**: Privacy-focused voting with IP tracking for abuse prevention
- **Multiple Vote Options**: Allow users to select multiple choices per poll
- **Poll Expiration**: Set automatic poll closure dates
- **Responsive Design**: Mobile-first design that works on all devices
- **Type-Safe**: Complete TypeScript implementation with comprehensive type definitions

### Security & Performance
- **Row Level Security (RLS)**: Database-level access control
- **Middleware Authentication**: Automatic session management and token refresh
- **Optimistic UI Updates**: Instant feedback with proper error handling
- **Comprehensive Testing**: Unit tests for all critical business logic

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern React component library
- **Lucide Icons** - Beautiful SVG icon library
- **Date-fns** - Modern date utility library

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Row Level Security** - Database-level access control
- **Real-time Subscriptions** - Live data updates

### Development & Testing
- **Jest** - JavaScript testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Supabase Account** (free tier available)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/alx-poll.git
cd alx-poll
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics and Monitoring
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

#### Create a Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the database to be ready (usually 2-3 minutes)
3. Get your project URL and anon key from Settings > API

#### Set Up Database Schema
Run the following SQL in your Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create polls table
CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  allow_multiple_votes BOOLEAN DEFAULT false,
  total_votes INTEGER DEFAULT 0,
  image_url TEXT
);

-- Create poll_options table
CREATE TABLE poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  poll_option_id UUID REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  voter_ip INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

-- Polls table policies
CREATE POLICY "Users can view active polls and their own polls" ON polls
  FOR SELECT USING (
    is_active = true OR created_by = auth.uid()
  );

CREATE POLICY "Users can create polls" ON polls
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own polls" ON polls
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own polls" ON polls
  FOR DELETE USING (created_by = auth.uid());

-- Poll options table policies
CREATE POLICY "Users can view poll options" ON poll_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND (polls.is_active = true OR polls.created_by = auth.uid())
    )
  );

CREATE POLICY "Poll creators can manage options" ON poll_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = poll_options.poll_id 
      AND polls.created_by = auth.uid()
    )
  );

-- Votes table policies
CREATE POLICY "Users can view vote statistics" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on active polls" ON votes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls 
      WHERE polls.id = votes.poll_id 
      AND polls.is_active = true 
      AND (polls.expires_at IS NULL OR polls.expires_at > NOW())
    )
  );

-- Enable RLS on all tables
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_polls_is_active ON polls(is_active);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_poll_option_id ON votes(poll_option_id);
```

### 5. Run the Application

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Examples

### Creating a Poll

1. **Sign up or log in** to your account
2. **Navigate to Dashboard** and click "Create Poll"
3. **Fill in poll details**:
   ```
   Title: "What's your favorite programming language?"
   Description: "Help us understand developer preferences"
   Category: "Technology"
   ```
4. **Add poll options**:
   - JavaScript
   - Python
   - TypeScript
   - Go
5. **Configure settings**:
   - ✅ Active (allow voting)
   - ❌ Anonymous (show voter names)
   - ❌ Multiple votes (one choice per user)
6. **Set expiration** (optional): 7 days from now
7. **Click "Create Poll"**

### Voting on a Poll

1. **Browse polls** on the polls page
2. **Click on a poll** to view details
3. **Select your choice(s)** from available options
4. **Click "Submit Vote"**
5. **View real-time results** immediately

### Sharing a Poll

1. **Open any poll** you've created or can vote on
2. **Click the "Share" button**
3. **Choose sharing method**:
   - Copy direct link
   - Share on Twitter
   - Share on Facebook
   - Share via WhatsApp
   - Use native sharing (mobile)

### Managing Your Polls

1. **Go to your Dashboard**
2. **View statistics**:
   - Total polls created
   - Total votes received
   - Active polls count
   - Average response rate
3. **Manage individual polls**:
   - Edit poll details
   - Add/remove options
   - Toggle active status
   - View detailed analytics

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The application includes comprehensive tests for:
- **Poll editing utilities** (100% coverage)
- **Form validation logic**
- **Data transformation functions**
- **Error handling scenarios**

## 🏗 Project Structure

```
alx-poll/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   └── dashboard/
│   ├── polls/                    # Poll-related pages
│   │   ├── [id]/                # Individual poll pages
│   │   └── create/              # Poll creation page
│   ├── api/                     # API routes
│   │   └── polls/               # Poll API endpoints
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/                   # Reusable components
│   ├── ui/                      # Shadcn/ui components
│   ├── edit-poll-form.tsx       # Poll editing form
│   └── share-poll.tsx           # Poll sharing component
├── contexts/                     # React contexts
│   └── auth-context.tsx         # Authentication context
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase configuration
│   ├── utils/                  # Utility functions
│   │   └── poll-edit.ts        # Poll editing utilities
│   └── types.ts                # TypeScript type definitions
├── __tests__/                   # Test files
│   └── poll-edit.test.ts       # Poll utility tests
├── middleware.ts                # Next.js middleware
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup
└── README.md                   # Project documentation
```

## 🔧 API Reference

### Authentication Endpoints

All API endpoints require authentication except for viewing active polls.

### Poll Endpoints

#### `GET /api/polls`
Fetch all polls with optional filtering.

**Query Parameters:**
- `category` - Filter by poll category
- `is_active` - Filter by active status (true/false)
- `created_by` - Filter by creator user ID
- `search` - Search in title and description
- `sort_by` - Sort field (created_at, total_votes, etc.)
- `sort_order` - Sort direction (asc/desc)

**Response:**
```json
{
  "polls": [
    {
      "id": "uuid",
      "title": "Poll Title",
      "description": "Poll description",
      "is_active": true,
      "total_votes": 42,
      "poll_options": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /api/polls`
Create a new poll.

**Request Body:**
```json
{
  "title": "What's your favorite color?",
  "description": "Optional description",
  "category": "General",
  "options": ["Red", "Blue", "Green"],
  "isAnonymous": false,
  "allowMultipleVotes": false,
  "endDate": "2024-12-31T23:59:59Z"
}
```

#### `GET /api/polls/[id]`
Fetch a specific poll by ID.

**Response:**
```json
{
  "poll": {
    "id": "uuid",
    "title": "Poll Title",
    "poll_options": [...],
    "total_votes": 42
  },
  "hasVoted": false
}
```

#### `PATCH /api/polls/[id]`
Update a poll (creators only).

#### `POST /api/polls/[id]/vote`
Submit a vote for a poll.

**Request Body:**
```json
{
  "optionIds": ["option-uuid-1", "option-uuid-2"]
}
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Configure environment variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **Heroku**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Add JSDoc comments for functions
- Write tests for new features
- Use Prettier for code formatting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or run into issues:

1. Check the [existing issues](https://github.com/your-username/alx-poll/issues)
2. Create a new issue with detailed information
3. Join our community discussions

## 🔮 Roadmap

- [ ] **Advanced Analytics**: Detailed voting analytics and charts
- [ ] **Poll Templates**: Pre-built poll templates for common use cases
- [ ] **Team Collaboration**: Multi-user poll management
- [ ] **API Rate Limiting**: Enhanced security and abuse prevention
- [ ] **Mobile App**: Native mobile applications
- [ ] **Integration APIs**: Webhook support for external integrations
- [ ] **Advanced Sharing**: Embed polls in external websites

---

## Requesting for database schema using MCP server

<img width="1882" height="1045" alt="image" src="https://github.com/user-attachments/assets/db04231b-3a58-4665-8769-a15ccf27b7c7" />


Built with ❤️ using Next.js, TypeScript, and Supabase.
