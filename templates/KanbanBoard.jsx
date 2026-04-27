// @clj-animate torusKnot3D

function KanbanBoard() {
  const [tasks, setTasks] = __CLJ_useState({
    todo: [
      { id: 1, title: 'Design 4D interface', priority: 'high' },
      { id: 2, title: 'Implement quantum effects', priority: 'medium' },
      { id: 3, title: 'Test WebGL animations', priority: 'low' }
    ],
    inProgress: [
      { id: 4, title: 'Build UI components', priority: 'high' }
    ],
    done: [
      { id: 5, title: 'Setup project structure', priority: 'low' }
    ]
  });
  const [newTask, setNewTask] = __CLJ_useState('');
  const [selectedColumn, setSelectedColumn] = __CLJ_useState('todo');
  const [draggedTask, setDraggedTask] = __CLJ_useState(null);

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = { id: Date.now(), title: newTask, priority: 'medium' };
    setTasks({ ...tasks, [selectedColumn]: [...tasks[selectedColumn], task] });
    setNewTask('');
    if (typeof CLJ !== 'undefined') CLJ.Toast.show('✨ Task added!', 2000);
  };

  const moveTask = (task, fromCol, toCol) => {
    setTasks({
      ...tasks,
      [fromCol]: tasks[fromCol].filter(t => t.id !== task.id),
      [toCol]: [...tasks[toCol], task]
    });
    if (typeof CLJ !== 'undefined') CLJ.Toast.show(`📋 Task moved to ${toCol}`, 1500);
  };

  const deleteTask = (taskId, column) => {
    setTasks({ ...tasks, [column]: tasks[column].filter(t => t.id !== taskId) });
    if (typeof CLJ !== 'undefined') CLJ.Toast.show('🗑️ Task deleted', 1500);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return '#f43f5e';
    if (priority === 'medium') return '#f59e0b';
    return '#10b981';
  };

  const Column = ({ title, column, tasks, bgColor }) => (
    <div className="clj-card" style={{ background: bgColor || 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '15px', minWidth: '280px' }}>
      <h3 style={{ margin: '0 0 15px 0', paddingBottom: '10px', borderBottom: '2px solid #667eea' }}>{title} ({tasks.length})</h3>
      <div style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
        {tasks.map(task => (
          <div key={task.id} draggable onDragStart={() => setDraggedTask({ task, column })} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (draggedTask && draggedTask.column !== column) moveTask(draggedTask.task, draggedTask.column, column); setDraggedTask(null); }} className="clj-glass" style={{ marginBottom: '10px', padding: '12px', borderRadius: '12px', cursor: 'grab', borderLeft: `4px solid ${getPriorityColor(task.priority)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{task.title}</span>
              <button onClick={() => deleteTask(task.id, column)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
            </div>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: getPriorityColor(task.priority), color: '#fff' }}>{task.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '42px', background: 'linear-gradient(135deg,#667eea,#ff44aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📋 4D Kanban Board</h1>
      
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px', flexWrap: 'wrap' }}>
        <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#1a1a2e', color: '#fff', border: '1px solid #667eea' }}>
          <option value="todo">Todo</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <input value={newTask} onInput={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder="New task..." style={{ padding: '10px', borderRadius: '10px', width: '250px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: '#fff' }} />
        <button onClick={addTask} className="clj-btn" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', padding: '10px 25px', borderRadius: '10px' }}>➕ Add Task</button>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Column title="📝 To Do" column="todo" tasks={tasks.todo} bgColor="rgba(0,0,0,0.2)" />
        <Column title="⚡ In Progress" column="inProgress" tasks={tasks.inProgress} bgColor="rgba(102,126,234,0.1)" />
        <Column title="✅ Done" column="done" tasks={tasks.done} bgColor="rgba(16,185,129,0.1)" />
      </div>
    </div>
  );
}

__CLJ_mount(KanbanBoard, 'root');