import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import supabase from '../../../config/supabaseClient';
import './dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [tags, setTags] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');

  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const navigate = useNavigate();

  const fetchUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      navigate('/');
    } else {
      setUser(data.user);
      setUserName(data.user.user_metadata?.name || 'User');
    }
  }, [navigate]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setTasks(data);
      findUpcomingTasks(data);
    }
  }, [user]);

  const findUpcomingTasks = (allTasks) => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const soon = allTasks.filter(task => {
      const due = new Date(task.due_date);
      return due >= now && due <= tomorrow && !task.completed;
    });

    setUpcomingTasks(soon);

    // Notifications
    if (Notification.permission === 'granted') {
      soon.forEach(task => {
        new Notification(`\u23F0 Reminder: "${task.title}" is due soon!`, {
          body: `Due: ${task.due_date}`,
          icon: '/favicon.ico'
        });
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          soon.forEach(task => {
            new Notification(`\u23F0 Reminder: "${task.title}" is due soon!`, {
              body: `Due: ${task.due_date}`,
              icon: '/favicon.ico'
            });
          });
        }
      });
    }
  };

  const addOrUpdateTask = async () => {
    if (!title || !dueDate) {
      alert('Please fill in both title and due date.');
      return;
    }

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const formattedDate = dueDate.toISOString().split('T')[0];

    if (editingId) {
      await supabase
        .from('tasks')
        .update({ title, due_date: formattedDate, tags: tagArray })
        .eq('id', editingId)
        .eq('user_id', user.id);
    } else {
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

  const resetForm = () => {
    setTitle('');
    setDueDate(null);
    setTags('');
    setEditingId(null);
  };

  const editTask = (task) => {
    setTitle(task.title);
    setDueDate(new Date(task.due_date));
    setTags(task.tags?.join(', ') || '');
    setEditingId(task.id);
  };

  const toggleComplete = async (id, currentStatus) => {
    await supabase
      .from('tasks')
      .update({ completed: !currentStatus })
      .eq('id', id)
      .eq('user_id', user.id);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    fetchTasks();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "//code.tidio.co/htst4pijfyszlp5hndcmjtruii1fqhme.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;

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
      <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀ Light Mode' : '🌙 Dark Mode'}
      </button>

      <div className="dashboard-header fade-in">
        <h2>Welcome back, {userName}!</h2>
        <p>Add new tasks, track progress, and stay productive!</p>
      </div>

      {upcomingTasks.length > 0 && (
        <div className="reminder-box fade-in">
          <h4>⏰ Tasks due soon:</h4>
          <ul>
            {upcomingTasks.map(task => (
              <li key={task.id}><strong>{task.title}</strong> (Due: {task.due_date})</li>
            ))}
          </ul>
        </div>
      )}

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

      <div className="task-stats">
        <strong>Completed:</strong> {completedCount} | <strong>Pending:</strong> {pendingCount}
      </div>

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

      <div className="logout-container">
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;