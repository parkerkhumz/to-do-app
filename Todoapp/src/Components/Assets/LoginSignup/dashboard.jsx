import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import supabase from '../../../config/supabaseClient';
import './dashboard.css';

const Dashboard = () => {
  // State for tasks and form inputs
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [tags, setTags] = useState('');
  const [editingId, setEditingId] = useState(null);

  // State for filtering/search
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  // Theme toggle
  const [darkMode, setDarkMode] = useState(false);

  // User session
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');

  const navigate = useNavigate();

  // Fetch currently authenticated user
  const fetchUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate('/'); // redirect to login if user not found
    } else {
      setUser(data.user);
      setUserName(data.user.user_metadata?.name || 'User');
    }
  }, [navigate]);

  // Load tasks for current user
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setTasks(data);
  }, [user]);

  // Add new task or update existing one
  const addOrUpdateTask = async () => {
    if (!title || !dueDate) {
      alert('Please fill in both title and due date.');
      return;
    }

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const formattedDate = dueDate.toISOString().split('T')[0];

    if (editingId) {
      // Update existing task
      await supabase
        .from('tasks')
        .update({ title, due_date: formattedDate, tags: tagArray })
        .eq('id', editingId)
        .eq('user_id', user.id);
    } else {
      // Insert new task
      await supabase.from('tasks').insert([{
        title,
        due_date: formattedDate,
        completed: false,
        tags: tagArray,
        user_id: user.id
      }]);
    }

    resetForm();
    fetchTasks();
  };

  // Clear form inputs and exit editing mode
  const resetForm = () => {
    setTitle('');
    setDueDate(null);
    setTags('');
    setEditingId(null);
  };

  // Populate form with task data for editing
  const editTask = (task) => {
    setTitle(task.title);
    setDueDate(new Date(task.due_date));
    setTags(task.tags?.join(', ') || '');
    setEditingId(task.id);
  };

  // Toggle task completion status
  const toggleComplete = async (id, currentStatus) => {
    await supabase
      .from('tasks')
      .update({ completed: !currentStatus })
      .eq('id', id)
      .eq('user_id', user.id);
    fetchTasks();
  };

  // Delete task
  const deleteTask = async (id) => {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    fetchTasks();
  };

  // Sign out user
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Fetch user on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Fetch tasks whenever user is set or updated
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Inject Tidio chat widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//code.tidio.co/htst4pijfyszlp5hndcmjtruii1fqhme.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Task counters
  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

  // Filter and search logic
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
      {/* Toggle light/dark mode */}
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
      </button>

      {/* Welcome message */}
      <div className="dashboard-header fade-in">
        <h2>Welcome back, {userName}!</h2>
        <p>Add new tasks, track progress, and stay productive!</p>
      </div>

      {/* Task form */}
      <div className="form-row fade-in">
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select due date"
          className="date-picker"
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

      {/* Task stats */}
      <div className="task-stats">
        <strong>Completed:</strong> {completedCount} | <strong>Pending:</strong> {pendingCount}
      </div>

      {/* Search and filter options */}
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

      {/* Task list */}
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

              {/* Task action buttons */}
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
