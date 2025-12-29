'use client'

import { useState } from 'react'
import { Task } from './TimelineManager'

interface ChatBotProps {
  existingTasks: Task[]
  onTaskGenerated: (task: Task) => void
}

export default function ChatBot({ existingTasks, onTaskGenerated }: ChatBotProps) {
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return

    const userPrompt = input.trim()
    setInput('')
    setError(null)
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          existingTasks: existingTasks.slice(0, 10)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate task')
      }

      const data = await response.json()
      const suggestedTask = data.task

      if (suggestedTask) {
        onTaskGenerated({
          id: Date.now().toString(),
          ...suggestedTask
        })
      }
    } catch (err: any) {
      console.error('AI generation error:', err)
      setError(err.message || 'Failed to generate task suggestion. Make sure Ollama is running.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-box">
        <input
          className="chatbot-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask AI to create a task... (e.g., 'Create unit tests for authentication')"
          disabled={isGenerating}
        />
        {error && (
          <div className="chatbot-error">{error}</div>
        )}
      </div>
    </div>
  )
}