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

  // Layout algorithm to prevent overlaps
  const layoutTasks = (): TaskLayout[] => {
    if (tasks.length === 0) return []

    // Sort tasks by start date
    const sortedTasks = [...tasks].sort((a, b) => {
      const startA = new Date(a.startDate).getTime()
      const startB = new Date(b.startDate).getTime()
      if (startA !== startB) return startA - startB
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    })

    const layouts: TaskLayout[] = []
    const rows: Task[][] = []

    // Group overlapping tasks into rows
    sortedTasks.forEach(task => {
      const taskStart = new Date(task.startDate).getTime()
      const taskEnd = new Date(task.endDate).getTime()
      
      let placed = false
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        // Check if task doesn't overlap with any task in this row
        const noOverlap = row.every(existingTask => {
          const existingStart = new Date(existingTask.startDate).getTime()
          const existingEnd = new Date(existingTask.endDate).getTime()
          return taskEnd <= existingStart || taskStart >= existingEnd
        })
        
        if (noOverlap) {
          row.push(task)
          placed = true
          break
        }
      }
      
      if (!placed) {
        rows.push([task])
      }
    })

    // Calculate positions for each task - stack overlapping tasks horizontally with spacing
    const taskRowMap = new Map<string, number>()
    rows.forEach((row, rowIndex) => {
      row.forEach(task => {
        taskRowMap.set(task.id, rowIndex)
      })
    })

    const maxRows = Math.max(1, rows.length)
    const spacing = 3 // Percentage spacing between tasks horizontally
    const availableWidth = 100 - (spacing * (maxRows - 1))
    const taskWidth = availableWidth / maxRows
    
    sortedTasks.forEach(task => {
      const { topPercent, heightPercent } = calculateTaskPosition(task)
      const rowIndex = taskRowMap.get(task.id) || 0
      
      // Calculate minimum height based on duration, but allow content to expand
      const minHeightPx = Math.max(60, heightPercent * 6)
      
      layouts.push({
        task,
        top: topPercent,
        height: minHeightPx, // This will be minHeight in CSS
        left: (taskWidth + spacing) * rowIndex + 1,
        width: taskWidth - 2,
        row: rowIndex
      })
    })

    return layouts
  }

  const layouts = layoutTasks()

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
        style={{ minHeight: '600px', position: 'relative' }}
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
