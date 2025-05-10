import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../../config/supabaseClient';
import './dashboard.css';

const Dashboard = () => {
  // State for managing task list and input fields
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [editingId, setEditingId] = useState(null);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  // Dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // User session and display name
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');

  const navigate = useNavigate();

  // Check for authenticated user on initial load
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      // Redirect to login if not logged in
      navigate('/');
    } else {
      setUser(data.user);
      setUserName(data.user.user_metadata?.name || 'User');
    }
  };

  // Fetch tasks from Supabase for the logged-in user
  const fetchTasks = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data);
    }
  };

  // Handle form submission for adding or updating a task
  const addOrUpdateTask = async () => {
    if (!title || !dueDate) {
      alert('Please fill in both title and due date.');
      return;
    }

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    if (editingId) {
      // Update an existing task
      const { error } = await supabase
        .from('tasks')
        .update({ title, due_date: dueDate, tags: tagArray })
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
      } else {
        resetForm();
        fetchTasks();
      }
    } else {
      // Insert a new task
      const { error } = await supabase.from('tasks').insert([
        { title, due_date: dueDate, completed: false, tags: tagArray, user_id: user.id },
      ]);

      if (error) {
        console.error('Error adding task:', error);
      } else {
        resetForm();
        fetchTasks();
      }
    }
  };

  // Reset the form fields and editing state
  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setTags('');
    setEditingId(null);
  };

  // Populate form fields for editing a task
  const editTask = (task) => {
    setTitle(task.title);
    setDueDate(task.due_date);
    setTags(task.tags?.join(', ') || '');
    setEditingId(task.id);
  };

  // Toggle task completion status
  const toggleComplete = async (id, currentStatus) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !currentStatus })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error toggling task:', error);
    } else {
      fetchTasks();
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      fetchTasks();
    }
  };

  // Sign out user and redirect to login
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Fetch user info on initial mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch tasks after user info is loaded
  useEffect(() => {
    fetchTasks();
  }, [user]);

  // Count of completed and pending tasks
  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Apply search and filter criteria to tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'Completed') return task.completed;
      if (filter === 'Pending') return !task.completed;
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      {/* Dark mode toggle */}
      <button className="dark-toggle" onClick={() => setDarkMode((prev) => !prev)}>
        {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Header greeting */}
      <div className="dashboard-header fade-in">
        <h2>Welcome back, {userName}!</h2>
        <p>Add new tasks, track progress, and stay productive!</p>
      </div>

      {/* Task form for adding/editing */}
      <div className="form-row fade-in">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tags (comma-separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <button onClick={addOrUpdateTask}>
          {editingId ? 'Update Task' : 'Add Task'}
        </button>
        {editingId && <button onClick={resetForm}>Cancel</button>}
      </div>

      {/* Task summary stats */}
      <div className="task-stats">
        <strong>Completed:</strong> {completedCount} | <strong>Pending:</strong> {pendingCount}
      </div>

      {/* Search and filter controls */}
      <div className="search-filter fade-in">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          <option>Completed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Task list display */}
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task.id} className={`task-card fade-in ${task.completed ? 'completed' : ''}`}>
            <div className="task-info">
              <div>
                <strong>{task.title}</strong> <span className="task-meta">({task.due_date})</span>
                {task.tags?.length > 0 && (
                  <div className="task-meta">Tags: {task.tags.join(', ')}</div>
                )}
              </div>
              {/* Action buttons */}
              <div className="task-buttons">
                <button onClick={() => toggleComplete(task.id, task.completed)}>
                  {task.completed ? 'Undo' : 'Complete'}
                </button>
                <button onClick={() => editTask(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Logout button */}
      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
