// src/App.js
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const defaultX = 7;
const defaultY = "09:00";

function App() {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [xDays, setXDays] = useState(defaultX);
  const [yTime, setYTime] = useState(defaultY);
  const [activePage, setActivePage] = useState('home');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDay, setNewTaskDay] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('taskAppData');
    if (stored) {
      const { tasks, groups, xDays, yTime } = JSON.parse(stored);
      setTasks(tasks);
      setGroups(groups);
      setXDays(xDays);
      setYTime(yTime);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskAppData', JSON.stringify({ tasks, groups, xDays, yTime }));
  }, [tasks, groups, xDays, yTime]);

  const exportData = () => {
    const dataStr = JSON.stringify({ tasks, groups, xDays, yTime });
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task_data.json';
    a.click();
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const data = JSON.parse(e.target.result);
      setTasks(data.tasks || []);
      setGroups(data.groups || []);
      setXDays(data.xDays || defaultX);
      setYTime(data.yTime || defaultY);
    };
    reader.readAsText(file);
  };

  const handleAddTask = () => {
    if (newTaskTitle && newTaskDay) {
      const newTask = { id: Date.now(), title: newTaskTitle, dayOfMonth: Number(newTaskDay) };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDay('');
      setShowTaskModal(false);
    }
  };

  const handleAddGroup = () => {
    if (newGroupName) {
      const newGroup = { id: Date.now(), name: newGroupName, taskIds: [], taskOverrides: {} };
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowGroupModal(false);
    }
  };

  const renderHome = () => (
    <div>
      <h2 className="text-lg font-semibold mb-2">Action Items</h2>
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setShowTaskModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Add Task</button>
        <button onClick={() => setShowGroupModal(true)} className="bg-purple-500 text-white px-4 py-2 rounded">Add Group</button>
      </div>
      <ul className="list-disc pl-5">
        {groups.map(group => (
          <li key={group.id}>
            <strong>{group.name}</strong>
            <ul className="pl-4">
              {group.taskIds.map(taskId => {
                const task = tasks.find(t => t.id === taskId);
                if (!task) return null;
                return <li key={taskId}>{task.title} (Due: {task.dayOfMonth})</li>;
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderTasks = () => (
    <div>
      <h2 className="text-lg font-semibold mb-2">My Tasks</h2>
      <ul className="list-disc pl-5">
        {tasks.map(task => (
          <li key={task.id}>{task.title} (Due: {task.dayOfMonth})</li>
        ))}
      </ul>
    </div>
  );

  const renderGroups = () => (
    <div>
      <h2 className="text-lg font-semibold mb-2">My Groups</h2>
      <ul className="list-disc pl-5">
        {groups.map(group => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </div>
  );

  const renderSettings = () => (
    <div>
      <h2 className="text-lg font-semibold mb-2">Settings</h2>
      <div className="mb-2">
        <label className="block mb-1">Days prior to notify (x):</label>
        <input
          type="number"
          value={xDays}
          onChange={e => setXDays(Number(e.target.value))}
          className="border px-2 py-1 rounded w-20"
        />
      </div>
      <div className="mb-2">
        <label className="block mb-1">Notification time (y):</label>
        <input
          type="time"
          value={yTime}
          onChange={e => setYTime(e.target.value)}
          className="border px-2 py-1 rounded w-32"
        />
      </div>
      <button onClick={exportData} className="mr-2 p-2 bg-green-500 text-white rounded">Export Data</button>
      <input type="file" accept="application/json" onChange={e => importData(e.target.files[0])} />
    </div>
  );

  return (
    <div className="flex h-screen">
      <div className={`bg-gray-100 transition-all duration-300 ${sidebarOpen ? 'w-1/4' : 'w-12'} p-4 overflow-hidden`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-xl font-bold ${!sidebarOpen && 'hidden'}`}>Task Reminder</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        <ul className="space-y-2">
          <li><button onClick={() => setActivePage('home')} className="w-full text-left">Home</button></li>
          <li><button onClick={() => setActivePage('tasks')} className="w-full text-left">My Tasks</button></li>
          <li><button onClick={() => setActivePage('groups')} className="w-full text-left">My Groups</button></li>
          <li><button onClick={() => setActivePage('settings')} className="w-full text-left">Settings</button></li>
        </ul>
      </div>
      <main className="flex-1 p-6 overflow-y-auto">
        {activePage === 'home' && renderHome()}
        {activePage === 'tasks' && renderTasks()}
        {activePage === 'groups' && renderGroups()}
        {activePage === 'settings' && renderSettings()}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-80">
              <h3 className="font-bold text-lg mb-2">Add Task</h3>
              <input type="text" placeholder="Task Title" className="border w-full mb-2 px-2 py-1" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
              <input type="number" placeholder="Day of Month" className="border w-full mb-2 px-2 py-1" value={newTaskDay} onChange={e => setNewTaskDay(e.target.value)} />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowTaskModal(false)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                <button onClick={handleAddTask} className="px-3 py-1 bg-blue-500 text-white rounded">Add</button>
              </div>
            </div>
          </div>
        )}

        {/* Group Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-80">
              <h3 className="font-bold text-lg mb-2">Add Group</h3>
              <input type="text" placeholder="Group Name" className="border w-full mb-2 px-2 py-1" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowGroupModal(false)} className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
                <button onClick={handleAddGroup} className="px-3 py-1 bg-purple-500 text-white rounded">Add</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
