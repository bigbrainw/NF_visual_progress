'use client'

import { useState, useRef, useEffect } from 'react'
import { Task } from './TimelineManager'

interface TimelineLaneProps {
  lane: Task['lane']
  tasks: Task[]
  startDate: Date
  endDate: Date
  onTaskClick: (taskId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
}

interface TaskLayout {
  task: Task
  top: number
  height: number
  left: number
  width: number
  row: number
}

export default function TimelineLane({ tasks, startDate, endDate, onTaskClick, onTaskUpdate }: TimelineLaneProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const calculateTaskPosition = (task: Task) => {
    const taskStartDate = new Date(task.startDate)
    const taskEndDate = new Date(task.endDate)
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (taskStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const taskDuration = (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)
    
    const topPercent = Math.max(0, (daysFromStart / totalDays) * 100)
    const heightPercent = Math.min(100, (taskDuration / totalDays) * 100)
    
    return {
      topPercent,
      heightPercent: Math.max(2, heightPercent)
    }
  }

  // Layout algorithm - position tasks strictly by their dates, no pushing down
  const layoutTasks = (): TaskLayout[] => {
    if (tasks.length === 0) return []

    // Sort tasks by start date, then by end date
    const sortedTasks = [...tasks].sort((a, b) => {
      const startA = new Date(a.startDate).getTime()
      const startB = new Date(b.startDate).getTime()
      if (startA !== startB) return startA - startB
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    })

    const layouts: TaskLayout[] = []

    // Place each task at its actual date position, no overlap avoidance
    sortedTasks.forEach((task, index) => {
      const taskStart = new Date(task.startDate).getTime()
      const taskEnd = new Date(task.endDate).getTime()
      
      // Calculate position based on actual task dates
      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      const daysFromStart = (taskStart - startDate.getTime()) / (1000 * 60 * 60 * 24)
      const taskDuration = (taskEnd - taskStart) / (1000 * 60 * 60 * 24)
      
      const topPercent = Math.max(0, (daysFromStart / totalDays) * 100)
      const heightPercent = Math.max(2, (taskDuration / totalDays) * 100)
      const minHeightPx = Math.max(80, heightPercent * 8) // Increased min height
      
      layouts.push({
        task,
        top: topPercent,
        height: minHeightPx,
        left: 1,
        width: 98, // Full width minus small margins
        row: index
      })
    })

    return layouts
  }

  const layouts = layoutTasks()
  
  // Calculate the maximum bottom position to extend timeline automatically
  const maxBottom = layouts.length > 0 
    ? Math.max(...layouts.map(l => l.top + (l.height / 8))) 
    : 100

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedTask || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const y = e.clientY - containerRect.top
    const containerHeight = containerRect.height
    const percentY = (y / containerHeight) * 100

    // Calculate new date based on drop position
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (percentY / 100) * totalDays
    const newStartDate = new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000)

    const task = tasks.find(t => t.id === draggedTask)
    if (task) {
      const oldStart = new Date(task.startDate).getTime()
      const oldEnd = new Date(task.endDate).getTime()
      const duration = oldEnd - oldStart
      const newEndDate = new Date(newStartDate.getTime() + duration)

      onTaskUpdate(draggedTask, {
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0]
      })
    }

    setDraggedTask(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
  }

  return (
    <div className="timeline-lane">
      <div className="timeline-line"></div>
      <div 
        className="tasks-container" 
        ref={containerRef}
        style={{ 
          minHeight: `${Math.max(1200, maxBottom * 12)}px`, 
          height: '100%', 
          position: 'relative' 
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {layouts.map((layout) => {
          const startDateStr = new Date(layout.task.startDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
          const endDateStr = new Date(layout.task.endDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })

          return (
            <div
              key={layout.task.id}
              className={`task-item ${layout.task.category} ${draggedTask === layout.task.id ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, layout.task.id)}
              onDragEnd={handleDragEnd}
              style={{
                top: `${layout.top}%`,
                height: 'auto',
                minHeight: `${layout.height}px`,
                left: `${layout.left}%`,
                width: `${layout.width}%`,
                cursor: 'move',
                maxHeight: 'none',
                overflow: 'visible'
              }}
              onClick={(e) => {
                if (!draggedTask) {
                  onTaskClick(layout.task.id)
                }
              }}
            >
              <div className="task-title">{layout.task.title}</div>
              {layout.task.description && (
                <div className="task-description">{layout.task.description}</div>
              )}
              <div className="task-dates">{startDateStr} - {endDateStr}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
