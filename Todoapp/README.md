# 📝 Todo App

A simple, clean, and efficient web-based Todo application built using **React**, **TypeScript**, and **Supabase**. This app allows users to manage their daily tasks with features like adding, editing, completing, deleting, and filtering todos.

---

## 🚀 Project Overview

This Todo App allows users to:

- Add tasks with a title and due date
- View a list of all tasks
- Mark tasks as completed
- Delete or edit tasks
- View counts of completed vs. pending tasks
- Filter tasks by status (All, Completed, Pending)

The goal of this app is to provide an intuitive interface for everyday task management, with real-time backend support via Supabase.

---

## ⚙️ Setup Instructions

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Yarn](https://classic.yarnpkg.com/lang/en/) or npm
- [VS Code](https://code.visualstudio.com/)
- [Supabase Account](https://supabase.io/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/todo-app.git
cd todo-app
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install
```

### 3. Configure Supabase

Create a `.env` file in the root directory and add your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Set up your Supabase database table with the required schema:

```sql
create table todos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  due_date date,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

Enable Row Level Security and add appropriate policies to allow reading/writing for authenticated users or anonymously, based on your setup.

### 4. Start the App

```bash
yarn dev
# or
npm run dev
```

Visit `http://localhost:3000` to view the app in your browser.

---


## 🌐 Deployed App

- **Live Demo**: [https://to-do-app-one-flame.vercel.app/) 

---

## 🧰 Technologies Used

- **React** – UI Library
- **TypeScript** – Typed JavaScript
- **Supabase** – Backend-as-a-Service (Database + Auth)
- **Vite** – Development bundler
- **Tailwind CSS** 

---

## ✅ Features Implemented

- [x] Add tasks with title and due date
- [x] List all tasks with title, due date, and completion status
- [x] Mark tasks as completed
- [x] Edit existing tasks
- [x] Delete tasks
- [x] View completed vs. pending task counts
- [x] Filter by task status (All, Completed, Pending)

---