import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'

function getOllamaUrl(): string {
  // If explicitly set via environment variable, use it
  if (process.env.OLLAMA_URL) {
    return process.env.OLLAMA_URL
  }

  // Check if we're in WSL (Windows Subsystem for Linux)
  let isWSL = false
  if (process.platform === 'linux') {
    // Check environment variables first (fastest)
    if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) {
      isWSL = true
    } else {
      // Check /proc/version for Microsoft/WSL indicator
      try {
        const procVersion = readFileSync('/proc/version', 'utf8').toLowerCase()
        isWSL = procVersion.includes('microsoft') || procVersion.includes('wsl')
      } catch (e) {
        // File doesn't exist or can't read, assume not WSL
      }
    }
  }

  if (isWSL) {
    try {
      // In WSL2, try multiple methods to connect to Windows host
      // Method 1: Try using the nameserver IP from /etc/resolv.conf
      const resolvConf = readFileSync('/etc/resolv.conf', 'utf8')
      const nameserverMatch = resolvConf.match(/nameserver\s+(\d+\.\d+\.\d+\.\d+)/)
      if (nameserverMatch && nameserverMatch[1]) {
        const windowsHost = nameserverMatch[1]
        // Try the detected IP first
        const url = `http://${windowsHost}:11434/api/generate`
        console.log(`WSL detected, trying Windows host IP: ${url}`)
        console.log(`Note: If this fails, ensure Ollama is configured to listen on all interfaces (OLLAMA_HOST=0.0.0.0)`)
        return url
      }
    } catch (e) {
      console.warn('Could not read /etc/resolv.conf, falling back to localhost')
    }
  }

  // Default to localhost
  return 'http://localhost:11434/api/generate'
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, existingTasks } = await request.json()

    // Get Ollama endpoint (handles WSL detection)
    const ollamaUrl = getOllamaUrl()
    const model = process.env.OLLAMA_MODEL || 'llama2'

    const systemPrompt = `You are a project management assistant helping to create tasks for a 3-month execution plan. 
The plan has 4 parallel work streams:
1. Testing Timeline
2. Design Revisions
3. Prototype Readiness
4. Outreach Timing

Task categories: planning, development, review, milestone, delivery

Based on the user's request, suggest a well-structured task with:
- A clear, actionable title
- Appropriate timeline (testing/design/prototype/outreach)
- Appropriate category
- Realistic start and end dates within a 3-month period
- A helpful description

${existingTasks ? `Existing tasks: ${JSON.stringify(existingTasks, null, 2)}` : ''}

Respond with a JSON object containing: title, lane, category, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD), description`

    const userPrompt = `User request: ${prompt}\n\nGenerate a task suggestion as JSON.`

    // Try to connect with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    let response
    try {
      response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          format: 'json',
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      // If connection fails and we're in WSL, provide helpful error message
      if (fetchError.code === 'ECONNREFUSED' && process.platform === 'linux') {
        throw new Error(
          `Cannot connect to Ollama on Windows. ` +
          `Please ensure Ollama is running and configured to listen on all interfaces. ` +
          `Set OLLAMA_HOST=0.0.0.0 in Windows environment variables or run: ` +
          `ollama serve --host 0.0.0.0`
        )
      }
      throw fetchError
    }

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Extract JSON from response (Ollama may wrap it)
    let taskData
    try {
      taskData = typeof data.response === 'string' ? JSON.parse(data.response) : data.response
    } catch (e) {
      // Try to extract JSON from text if it's wrapped
      const jsonMatch = data.response?.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        taskData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse JSON from Ollama response')
      }
    }

    return NextResponse.json({ task: taskData })
  } catch (error: any) {
    console.error('Ollama API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate task suggestion' },
      { status: 500 }
    )
  }
}
