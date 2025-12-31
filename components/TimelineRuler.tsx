'use client'

type ViewMode = 'months' | 'weeks' | 'days'

interface TimelineRulerProps {
  startDate: Date
  endDate: Date
  viewMode: ViewMode
}

export default function TimelineRuler({ startDate, endDate, viewMode }: TimelineRulerProps) {
  const getTimeMarkers = () => {
    const markers: { date: Date; label: string }[] = []
    const current = new Date(startDate)

    if (viewMode === 'months') {
      // Start from the first day of the current month
      const startMonth = new Date(current.getFullYear(), current.getMonth(), 1)
      let monthDate = new Date(startMonth)
      
      while (monthDate <= endDate) {
        markers.push({
          date: new Date(monthDate),
          label: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        })
        // Move to the first day of the next month to avoid date overflow issues
        monthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)
      }
    } else if (viewMode === 'weeks') {
      // Start from the beginning of the week
      const dayOfWeek = current.getDay()
      current.setDate(current.getDate() - dayOfWeek)
      
      while (current <= endDate) {
        markers.push({
          date: new Date(current),
          label: `Week ${getWeekNumber(current)}`
        })
        current.setDate(current.getDate() + 7)
      }
    } else { // days
      while (current <= endDate) {
        markers.push({
          date: new Date(current),
          label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })
        current.setDate(current.getDate() + 1)
      }
    }

    return markers
  }

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  }

  const calculatePosition = (date: Date) => {
    const totalTime = endDate.getTime() - startDate.getTime()
    const timeFromStart = date.getTime() - startDate.getTime()
    return (timeFromStart / totalTime) * 100
  }

  const markers = getTimeMarkers()
  const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)

  return (
    <div className="timeline-ruler-vertical">
      <div className="ruler-markers">
        {markers.map((marker, index) => {
          const position = calculatePosition(marker.date)
          return (
            <div
              key={index}
              className="ruler-marker"
              style={{ top: `${position}%` }}
            >
              <div className="ruler-marker-line"></div>
              <div className="ruler-marker-label">{marker.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}