'use client'

import { Task } from './TimelineManager'

interface TimelineLaneProps {
  lane: Task['lane']
  tasks: Task[]
  startDate: Date
  endDate: Date
  onTaskClick: (taskId: string) => void
}

export default function TimelineLane({ tasks, startDate, endDate, onTaskClick }: TimelineLaneProps) {
  const calculateTaskPosition = (task: Task) => {
    const taskStartDate = new Date(task.startDate)
    const taskEndDate = new Date(task.endDate)
    
    // Calculate position as percentage of timeline
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (taskStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    const taskDuration = (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Position from top (most recent/upcoming at top)
    const topPercent = Math.max(0, (daysFromStart / totalDays) * 100)
    const heightPercent = Math.min(100, (taskDuration / totalDays) * 100)
    
    return {
      top: `${topPercent}%`,
      height: `${Math.max(5, heightPercent)}%`
    }
  }

  // Sort tasks by start date (most recent/upcoming first)
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  })

  return (
    <div className="timeline-lane">
      <div className="timeline-line"></div>
      <div className="tasks-container" style={{ minHeight: '600px' }}>
        {sortedTasks.map((task) => {
          const position = calculateTaskPosition(task)
          const startDateStr = new Date(task.startDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
          const endDateStr = new Date(task.endDate).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })

          return (
            <div
              key={task.id}
              className={`task-item ${task.category}`}
              style={{
                top: position.top,
                height: position.height,
                minHeight: '60px'
              }}
              onClick={() => onTaskClick(task.id)}
            >
              <div className="task-title">{task.title}</div>
              {task.description && (
                <div className="task-description">{task.description}</div>
              )}
              <div className="task-dates">{startDateStr} - {endDateStr}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
