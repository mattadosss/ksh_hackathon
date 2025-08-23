# KSH Study Planner

An intelligent study planning application that automatically generates optimal study schedules for your exams. Built with Next.js and powered by an advanced scheduling algorithm, this tool helps students maximize their study efficiency by creating conflict-free study sessions that fit perfectly into their existing schedule.

## 🎯 What Makes This Special

Unlike traditional calendar apps, KSH Study Planner doesn't just help you manage events—it **intelligently plans your study time**. Simply input your exam details and study requirements, and the system automatically creates a personalized study schedule that:

- **Avoids conflicts** with your existing commitments
- **Optimizes timing** based on your preferred study hours
- **Distributes sessions** evenly before your exam
- **Prevents burnout** by limiting daily study sessions
- **Integrates seamlessly** with your existing calendar

## 🚀 Core Features

### 📚 Intelligent Study Planning
- **Smart Scheduling Algorithm**: Automatically generates optimal study sessions based on exam dates
- **Conflict-Free Planning**: Intelligently avoids conflicts with your existing calendar events
- **Customizable Study Windows**: Set your preferred study hours (e.g., 8 AM - 10 PM)
- **Flexible Duration Control**: Configure total study hours needed and session distribution
- **Burnout Prevention**: Limits daily study sessions to prevent overwhelming schedules
- **Exam-Focused**: Perfect for students preparing for exams, tests, or presentations

### 📅 Calendar Integration
- **Seamless Integration**: Study sessions automatically appear in your main calendar
- **Interactive Calendar Interface**: Built with FullCalendar.js for professional experience
- **Multiple Views**: Day, week, and month views to track your study progress
- **Event Management**: Create, edit, and delete both study sessions and regular events
- **Recurring Events**: Support for weekly recurring commitments

### 🛠 Technical Excellence
- **Modern Tech Stack**: Built with Next.js 15, React 19, and TypeScript
- **Real-time Database**: Supabase integration for reliable data persistence
- **Responsive Design**: Beautiful, mobile-friendly UI with Tailwind CSS
- **Fast Development**: Turbopack for lightning-fast development experience

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Calendar**: FullCalendar.js with day grid and time grid plugins
- **Database**: Supabase (PostgreSQL)
- **Development**: Turbopack for fast development builds

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- Environment variables configured

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ksh-hackaton
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Database

Create a table called `events` in your Supabase database with the following schema:

```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  end TIMESTAMP WITH TIME ZONE,
  repeat_weekly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📖 How to Use the Study Planner

### 🎯 Getting Started with Study Planning

1. **Access the Study Planner**: Click "Generate Studyplan" from the main calendar page
2. **Configure Your Study Plan**:
   - **Exam Name**: Enter a descriptive name (e.g., "Calculus Midterm", "Physics Final")
   - **Exam Date & Time**: Set when your exam will take place
   - **Total Study Hours**: Specify how many hours you need to study
   - **Study Window**: Set your preferred study hours (e.g., 8 AM - 10 PM)
3. **Generate Your Schedule**: Click "Generate schedule" and watch the magic happen!
4. **Review & Optimize**: The system shows you the generated study sessions
5. **Return to Calendar**: All study sessions automatically appear in your main calendar

### 📅 Managing Your Study Schedule

- **View Progress**: Check your calendar to see upcoming study sessions
- **Track Completion**: Study sessions are clearly marked in your calendar
- **Adjust as Needed**: Delete or modify study sessions if your schedule changes
- **Stay on Track**: The planner ensures you have enough time before your exam

### 🔄 Calendar Integration

- **Seamless Experience**: Study sessions integrate perfectly with your existing events
- **Conflict Resolution**: The system automatically avoids scheduling conflicts
- **Flexible Management**: Edit, delete, or reschedule study sessions just like regular events
- **Progress Tracking**: Visualize your study progress across different calendar views

### 🧠 The Smart Study Algorithm

Our advanced scheduling algorithm ensures optimal study planning by:

- **Conflict Detection**: Automatically identifies and avoids scheduling conflicts with existing events
- **Time Window Respect**: Only schedules sessions within your specified study hours
- **Optimal Distribution**: Spreads study sessions evenly across available days before your exam
- **Burnout Prevention**: Limits daily study sessions (default: 2 sessions per day) to prevent overwhelm
- **Recurring Event Awareness**: Intelligently works around weekly recurring commitments
- **Backward Planning**: Starts from your exam date and works backward to ensure adequate preparation time

## 🏗 Project Structure

```
ksh-hackaton/
├── src/
│   ├── app/
│   │   ├── page.js              # Main calendar page
│   │   ├── generate/
│   │   │   └── page.js          # Study scheduler page
│   │   ├── layout.js            # Root layout
│   │   └── globals.css          # Global styles
│   └── lib/
│       └── supabaseClient.js    # Supabase client configuration
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🚀 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server

## 🔧 Study Planner Configuration

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Study Planning Settings

- **Total Study Hours**: Total time needed for exam preparation (whole numbers only)
- **Day Start Hour**: Earliest time you're available to study (0-23, e.g., 8 for 8 AM)
- **Day End Hour**: Latest time you're available to study (0-23, e.g., 22 for 10 PM)
- **Session Limit**: Maximum study sessions per day (default: 2 to prevent burnout)
- **Session Duration**: Each study session is 1 hour by default for optimal focus

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page for existing problems
2. Create a new issue with detailed information about your problem
3. Include your environment details and steps to reproduce the issue

## 🎯 Study Planner Roadmap

- [ ] **Study Session Templates**: Pre-defined study plans for common subjects
- [ ] **Progress Tracking**: Mark completed study sessions and track progress
- [ ] **Study Reminders**: Push notifications for upcoming study sessions
- [ ] **Study Analytics**: Insights into your study patterns and effectiveness
- [ ] **Collaborative Study**: Share study schedules with study groups
- [ ] **Study Session Types**: Different session types (review, practice, new material)
- [ ] **Mobile App**: Native mobile application for on-the-go study planning
- [ ] **Study Resources Integration**: Link study materials to specific sessions

---

**Built with ❤️ to help students achieve their academic goals through intelligent study planning**
