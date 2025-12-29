'use client'

import { useState, useEffect } from 'react'
import TaskModal from './TaskModal'
import TimelineLane from './TimelineLane'
import TimelineRuler from './TimelineRuler'
import ChatBot from './ChatBot'

export interface Task {
  id: string
  title: string
  lane: 'testing' | 'design' | 'prototype' | 'outreach'
  category: 'planning' | 'development' | 'review' | 'milestone' | 'delivery'
  startDate: string
  endDate: string
  description?: string
}

export type ViewMode = 'months' | 'weeks' | 'days'

const LANE_NAMES = {
  testing: 'Testing Timeline',
  design: 'Design Revisions',
  prototype: 'Prototype Readiness',
  outreach: 'Outreach Timing'
}

export default function TimelineManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('months')
  
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 3)

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('timelineTasks')
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks))
      } catch (e) {
        console.error('Failed to load tasks:', e)
      }
    } else {
      // Load initial tasks if no saved tasks exist
      const today = new Date()
      const initialTasks: Task[] = [
        // Immediate Next Steps (Days 0-5)
        {
          id: '1',
          title: 'Create shared project folder structure',
          lane: 'outreach',
          category: 'planning',
          startDate: today.toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Create /Outreach, /Product & Tech, /Testing, /Notes & Learnings folders'
        },
        {
          id: '2',
          title: 'Split target list into 3 categories',
          lane: 'outreach',
          category: 'planning',
          startDate: today.toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'ADHD clinics (kids/adults), ADHD organizations/nonprofits, After-school academies'
        },
        {
          id: '3',
          title: 'Pick 3-5 priority targets',
          lane: 'outreach',
          category: 'planning',
          startDate: today.toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Select priority targets only, not all'
        },
        {
          id: '4',
          title: 'Lock roles (outreach, testing, product leads)',
          lane: 'outreach',
          category: 'planning',
          startDate: today.toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Assign outreach lead, testing & validation lead, product/design coordination'
        },
        // Week 1
        {
          id: '5',
          title: 'Research priority targets',
          lane: 'outreach',
          category: 'planning',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Who is the right person, their mission, how they handle ADHD/focus'
        },
        {
          id: '6',
          title: 'Draft master email template',
          lane: 'outreach',
          category: 'development',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Create master email, then customize for each target'
        },
        {
          id: '7',
          title: 'Prepare 1-paragraph product summary',
          lane: 'outreach',
          category: 'development',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Problem, what you measure, why it\'s useful (no tech details)'
        },
        {
          id: '8',
          title: 'Freeze current hardware/design',
          lane: 'prototype',
          category: 'milestone',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'No big changes - freeze current state'
        },
        {
          id: '9',
          title: 'Define current capabilities',
          lane: 'prototype',
          category: 'planning',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'What it can do today, what it cannot do yet, known issues & risks'
        },
        {
          id: '10',
          title: 'Decide testing stages',
          lane: 'testing',
          category: 'planning',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Internal team testing, controlled external testing, at-home testing (future)'
        },
        {
          id: '11',
          title: 'Define success criteria',
          lane: 'testing',
          category: 'planning',
          startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Signal stability, repeatability, usability'
        },
        {
          id: '12',
          title: 'Write testing plan (1-2 pages)',
          lane: 'testing',
          category: 'delivery',
          startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Document testing framework and success criteria'
        },
        // Week 2
        {
          id: '13',
          title: 'Send customized emails to 3-5 priority targets',
          lane: 'outreach',
          category: 'delivery',
          startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Send custom emails and log: date sent, who contacted, follow-up date'
        },
        {
          id: '14',
          title: 'Prepare 15-minute meeting agenda',
          lane: 'outreach',
          category: 'planning',
          startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Who we are, problem we see, what we\'re building, what feedback we want'
        },
        {
          id: '15',
          title: 'Internal team testing',
          lane: 'testing',
          category: 'development',
          startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Test device on team members, run consistent scenarios (focused/distracted tasks)'
        },
        {
          id: '16',
          title: 'Record internal test results',
          lane: 'testing',
          category: 'review',
          startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Signal behavior, failures, setup friction'
        },
        {
          id: '17',
          title: 'Create basic demo flow',
          lane: 'prototype',
          category: 'development',
          startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Put it on, show signal, explain in human language - no dashboards polish yet'
        },
        // Week 3
        {
          id: '18',
          title: 'Follow up with non-responders',
          lane: 'outreach',
          category: 'delivery',
          startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Follow up on outreach emails'
        },
        {
          id: '19',
          title: 'Run first intro calls',
          lane: 'outreach',
          category: 'review',
          startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Capture: their questions, concerns, definition of "useful"'
        },
        {
          id: '20',
          title: 'Fix critical blockers',
          lane: 'prototype',
          category: 'development',
          startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Stability, comfort, setup time - do not redesign everything'
        },
        {
          id: '21',
          title: 'Test with 2-3 external adults (controlled)',
          lane: 'testing',
          category: 'development',
          startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Focus on: ease of use, signal consistency - document everything'
        },
        // Week 4
        {
          id: '22',
          title: 'Summarize conversations and feedback',
          lane: 'outreach',
          category: 'review',
          startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Who you talked to, what resonated, what didn\'t - update target prioritization'
        },
        {
          id: '23',
          title: 'Write testing summary',
          lane: 'testing',
          category: 'delivery',
          startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Who, how many, what scenarios, what worked/didn\'t - credibility asset'
        },
        {
          id: '24',
          title: 'Draft next 2-month plan',
          lane: 'prototype',
          category: 'planning',
          startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Prototype readiness date, at-home testing timeline, partner engagement plan'
        },
        {
          id: '25',
          title: 'Decide on patent filing and expansion',
          lane: 'prototype',
          category: 'milestone',
          startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'Decide if/when to file provisional patent, expand outreach'
        }
      ]
      setTasks(initialTasks)
    }
  }, [])

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem('timelineTasks', JSON.stringify(tasks))
  }, [tasks])

  const handleAddTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      setEditingTask(task)
      setIsModalOpen(true)
    }
  }

  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(t => t.id === task.id ? task : t))
    } else {
      // Add new task
      setTasks([...tasks, task])
    }
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleTaskGenerated = (task: Task) => {
    // Add the AI-generated task directly
    setTasks([...tasks, task])
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(t => t.id !== taskId))
      setIsModalOpen(false)
      setEditingTask(null)
    }
  }

  const getLaneCount = (lane: string) => {
    return tasks.filter(t => t.lane === lane).length
  }

  const formatDateRange = () => {
    const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  return (
    <>
      <header>
        <h1>3-Month Execution Plan</h1>
        <div className="controls">
          <select 
            className="view-mode-select"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
          >
            <option value="months">Months</option>
            <option value="weeks">Weeks</option>
            <option value="days">Days</option>
          </select>
          <button className="btn-primary" onClick={handleAddTask}>
            + Add Task
          </button>
          <div className="date-range">
            {formatDateRange()}
          </div>
        </div>
      </header>

      <div className="timeline-container">
        <div className="timeline-wrapper">
          <TimelineRuler 
            startDate={startDate} 
            endDate={endDate} 
            viewMode={viewMode}
          />
          
          <div className="timeline-content">
            <div className="timeline-header">
              {Object.entries(LANE_NAMES).map(([key, name]) => (
                <div key={key} className="timeline-lane-header">
                  <h2>{name}</h2>
                  <span className="lane-count">
                    {getLaneCount(key)} task{getLaneCount(key) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>

            <div className="timeline-grid">
              {Object.keys(LANE_NAMES).map((lane) => (
                <TimelineLane
                  key={lane}
                  lane={lane as Task['lane']}
                  tasks={tasks.filter(t => t.lane === lane)}
                  startDate={startDate}
                  endDate={endDate}
                  onTaskClick={handleEditTask}
                />
              ))}
            </div>
          </div>
        </div>

        <ChatBot 
          existingTasks={tasks}
          onTaskGenerated={handleTaskGenerated}
        />
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onClose={() => {
            setIsModalOpen(false)
            setEditingTask(null)
          }}
        />
      )}
    </>
  )
}