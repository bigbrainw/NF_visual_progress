'use client'

import { useState, useEffect } from 'react'
import { Task } from './TimelineManager'

interface TaskModalProps {
  task: Task | null
  onSave: (task: Task) => void
  onDelete: (taskId: string) => void
  onClose: () => void
}

export default function TaskModal({ task, onSave, onDelete, onClose }: TaskModalProps) {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: '',
    lane: 'testing',
    category: 'planning',
    startDate: '',
    endDate: '',
    description: ''
  })

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        lane: task.lane,
        category: task.category,
        startDate: task.startDate,
        endDate: task.endDate,
        description: task.description || ''
      })
    } else {
      // Set default dates for new task
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      setFormData({
        title: '',
        lane: 'testing',
        category: 'planning',
        startDate: today,
        endDate: nextWeek.toISOString().split('T')[0],
        description: ''
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: Task = {
      id: task?.id || Date.now().toString(),
      ...formData
    }
    onSave(newTask)
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={onClose}>&times;</span>
        <h2>{task ? 'Edit Task' : 'Add New Task'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">Task Title</label>
            <input
              type="text"
              id="taskTitle"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskLane">Timeline</label>
            <select
              id="taskLane"
              value={formData.lane}
              onChange={(e) => handleChange('lane', e.target.value)}
              required
            >
              <option value="testing">Testing Timeline</option>
              <option value="design">Design Revisions</option>
              <option value="prototype">Prototype Readiness</option>
              <option value="outreach">Outreach Timing</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="taskCategory">Category</label>
            <select
              id="taskCategory"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              required
            >
              <option value="planning">Planning</option>
              <option value="development">Development</option>
              <option value="review">Review</option>
              <option value="milestone">Milestone</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="taskStartDate">Start Date</label>
            <input
              type="date"
              id="taskStartDate"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskEndDate">End Date</label>
            <input
              type="date"
              id="taskEndDate"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskDescription">Description</label>
            <textarea
              id="taskDescription"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Save Task</button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {task && (
              <button
                type="button"
                className="btn-danger"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}