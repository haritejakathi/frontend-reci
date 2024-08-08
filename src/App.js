import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const history = useHistory();

  const register = async () => {
    try {
      await axios.post('http://localhost:5000/register', { username, password, role });
      history.push('/login');
    } catch (error) {
      console.error('Error registering new user.', error);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <input type="text" placeholder="Role" onChange={e => setRole(e.target.value)} />
      <button onClick={register}>Register</button>
    </div>
  );
};

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      history.push('/');
    } catch (error) {
      console.error('Error logging in.', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
};

const Dashboard = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await axios.get('http://localhost:5000/projects', {
        headers: { Authorization: token }
      });
      setProjects(response.data);
    };

    fetchProjects();
  }, [token]);

  const createProject = async () => {
    try {
      await axios.post('http://localhost:5000/projects', newProject, {
        headers: { Authorization: token }
      });
      setNewProject({ name: '', description: '' });
      // Refetch projects
      const response = await axios.get('http://localhost:5000/projects', {
        headers: { Authorization: token }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error creating project.', error);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        <input
          type="text"
          placeholder="Project Name"
          value={newProject.name}
          onChange={e => setNewProject({ ...newProject, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Project Description"
          value={newProject.description}
          onChange={e => setNewProject({ ...newProject, description: e.target.value })}
        />
        <button onClick={createProject}>Create Project</button>
      </div>
      <div>
        {projects.map(project => (
          <div key={project._id}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  return (
    <div className="App">
      <Switch>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/login">
          <Login setToken={setToken} />
        </Route>
        <Route path="/">
          {token ? <Dashboard token={token} /> : <Login setToken={setToken} />}
        </Route>
      </Switch>
    </div>
  );
};

export default App;
