'use client'

import { useState, useEffect, useCallback } from 'react'
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
  testing: 'Testing',
  design: 'Design',
  prototype: 'Prototype',
  outreach: 'Outreach'
}

export default function TimelineManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('months')
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + 3)

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('timelineTasks')
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks)
        // Only use saved tasks if the array has items
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed)
          return
        }
      } catch (e) {
        console.error('Failed to load tasks:', e)
      }
    }
    
    // Load initial tasks if no saved tasks exist or array is empty
    const today = new Date()
    let taskId = 1
    
    const initialTasks: Task[] = [
      // Meta Tasks - Week 1
      {
        id: String(taskId++),
        title: 'Create shared project folder',
        lane: 'outreach',
        category: 'planning',
        startDate: today.toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Centralize documents (not just group chat)'
      },
      {
        id: String(taskId++),
        title: 'Ensure everyone reviews and comments',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Maintain living documents, write things down (no "it\'s in my head")'
      },
      
      // Testing Tasks - Week 1-2
      {
        id: String(taskId++),
        title: 'Define testing stages',
        lane: 'testing',
        category: 'planning',
        startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Internal → controlled external → at-home'
      },
      {
        id: String(taskId++),
        title: 'Decide who is allowed to be tested at each stage',
        lane: 'testing',
        category: 'planning',
        startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Define participant criteria for each testing stage'
      },
      {
        id: String(taskId++),
        title: 'Define success criteria for "working"',
        lane: 'testing',
        category: 'planning',
        startDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Accuracy, stability, usability'
      },
      {
        id: String(taskId++),
        title: 'Run internal team testing',
        lane: 'testing',
        category: 'development',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Focused vs distracted scenarios'
      },
      {
        id: String(taskId++),
        title: 'Document test setup, environment, and procedure',
        lane: 'testing',
        category: 'delivery',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Record test methodology and conditions'
      },
      {
        id: String(taskId++),
        title: 'Record failures, noise, instability, edge cases',
        lane: 'testing',
        category: 'review',
        startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Document all issues encountered during testing'
      },
      {
        id: String(taskId++),
        title: 'Compare signal behavior against existing EEG / reference devices',
        lane: 'testing',
        category: 'review',
        startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Benchmark against reference devices'
      },
      {
        id: String(taskId++),
        title: 'Decide what data can be shown publicly vs kept internal',
        lane: 'testing',
        category: 'planning',
        startDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Define data disclosure policy'
      },
      {
        id: String(taskId++),
        title: 'Create a simple testing summary',
        lane: 'testing',
        category: 'delivery',
        startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Who, how many, where, results'
      },
      {
        id: String(taskId++),
        title: 'Decide what level of testing is acceptable to clinics',
        lane: 'testing',
        category: 'planning',
        startDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Define clinic acceptance criteria'
      },
      {
        id: String(taskId++),
        title: 'Define what qualifies as "ready for partner testing"',
        lane: 'testing',
        category: 'planning',
        startDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Set partner testing readiness criteria'
      },
      {
        id: String(taskId++),
        title: 'Prepare answers to: "How did you test this?"',
        lane: 'testing',
        category: 'delivery',
        startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Prepare clear explanation of testing methodology'
      },
      
      // Design Tasks - Week 1-3
      {
        id: String(taskId++),
        title: 'Finalize how the device sits on the user',
        lane: 'design',
        category: 'development',
        startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Determine optimal device placement and fit'
      },
      {
        id: String(taskId++),
        title: 'Identify comfort and usability pain points',
        lane: 'design',
        category: 'review',
        startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Document user comfort and usability issues'
      },
      {
        id: String(taskId++),
        title: 'Decide what cannot change before testing',
        lane: 'design',
        category: 'planning',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Freeze design elements required for testing'
      },
      {
        id: String(taskId++),
        title: 'Document known design compromises',
        lane: 'design',
        category: 'delivery',
        startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Record design trade-offs and limitations'
      },
      {
        id: String(taskId++),
        title: 'Align design constraints with testing needs',
        lane: 'design',
        category: 'planning',
        startDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Ensure design supports testing requirements'
      },
      {
        id: String(taskId++),
        title: 'Ensure design supports repeatable testing',
        lane: 'design',
        category: 'development',
        startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Design for consistent test setup and execution'
      },
      {
        id: String(taskId++),
        title: 'Decide what level of polish is required vs unnecessary',
        lane: 'design',
        category: 'planning',
        startDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Define minimum viable design polish'
      },
      {
        id: String(taskId++),
        title: 'Prepare explanation of design decisions for partners',
        lane: 'design',
        category: 'delivery',
        startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Document rationale for design choices'
      },
      
      // Prototype Tasks - Week 1-4
      {
        id: String(taskId++),
        title: 'Clearly define what "prototype" means (not PoC)',
        lane: 'prototype',
        category: 'planning',
        startDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Distinguish prototype from proof of concept'
      },
      {
        id: String(taskId++),
        title: 'Freeze hardware and firmware scope',
        lane: 'prototype',
        category: 'milestone',
        startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Lock hardware and firmware specifications'
      },
      {
        id: String(taskId++),
        title: 'Identify critical blockers that must be fixed',
        lane: 'prototype',
        category: 'planning',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'List must-fix issues before testing'
      },
      {
        id: String(taskId++),
        title: 'Improve stability and reliability',
        lane: 'prototype',
        category: 'development',
        startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Fix stability issues and improve reliability'
      },
      {
        id: String(taskId++),
        title: 'Reduce setup friction',
        lane: 'prototype',
        category: 'development',
        startDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Simplify device setup process'
      },
      {
        id: String(taskId++),
        title: 'Ensure prototype can be demoed live',
        lane: 'prototype',
        category: 'development',
        startDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Make prototype demo-ready'
      },
      {
        id: String(taskId++),
        title: 'Decide what features are intentionally missing',
        lane: 'prototype',
        category: 'planning',
        startDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Document intentionally excluded features'
      },
      {
        id: String(taskId++),
        title: 'Prepare a demo flow',
        lane: 'prototype',
        category: 'delivery',
        startDate: new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Put on → show signal → explain meaning'
      },
      {
        id: String(taskId++),
        title: 'Decide what level of failure is acceptable',
        lane: 'prototype',
        category: 'planning',
        startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Define acceptable failure thresholds'
      },
      {
        id: String(taskId++),
        title: 'Ensure prototype does not require debugging by users',
        lane: 'prototype',
        category: 'development',
        startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Make prototype user-friendly without technical debugging'
      },
      {
        id: String(taskId++),
        title: 'Document known limitations honestly',
        lane: 'prototype',
        category: 'delivery',
        startDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Transparently document prototype limitations'
      },
      {
        id: String(taskId++),
        title: 'Align prototype readiness with outreach expectations',
        lane: 'prototype',
        category: 'planning',
        startDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Coordinate prototype timeline with outreach schedule'
      },
      
      // Outreach Tasks - Week 1-4
      {
        id: String(taskId++),
        title: 'Categorize targets into: ADHD clinics, ADHD organizations/nonprofits, After-school academies',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Organize outreach targets by category'
      },
      {
        id: String(taskId++),
        title: 'Decide who is customer vs partner',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Distinguish between customers and partners'
      },
      {
        id: String(taskId++),
        title: 'Select 3–5 priority targets',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Choose highest priority outreach targets'
      },
      {
        id: String(taskId++),
        title: 'Identify decision-makers at each organization',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Find key contacts at target organizations'
      },
      {
        id: String(taskId++),
        title: 'Research: Mission, Current ADHD workflow, What they care about',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Research target organizations thoroughly'
      },
      {
        id: String(taskId++),
        title: 'Draft core product description',
        lane: 'outreach',
        category: 'development',
        startDate: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Create base product description'
      },
      {
        id: String(taskId++),
        title: 'Create custom versions per target type',
        lane: 'outreach',
        category: 'development',
        startDate: new Date(today.getTime() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Customize messaging for each target category'
      },
      {
        id: String(taskId++),
        title: 'Draft customized cold email templates',
        lane: 'outreach',
        category: 'development',
        startDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Create personalized email templates'
      },
      {
        id: String(taskId++),
        title: 'Prepare 15-minute intro meeting agenda',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 19 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Structure for initial partner meetings'
      },
      {
        id: String(taskId++),
        title: 'Decide what not to say (IP protection)',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Define IP protection boundaries'
      },
      {
        id: String(taskId++),
        title: 'Use "confidential / proprietary" language correctly',
        lane: 'outreach',
        category: 'development',
        startDate: new Date(today.getTime() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Properly mark confidential materials'
      },
      {
        id: String(taskId++),
        title: 'Send outreach emails',
        lane: 'outreach',
        category: 'delivery',
        startDate: new Date(today.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Send customized emails to priority targets'
      },
      {
        id: String(taskId++),
        title: 'Track responses and follow-ups',
        lane: 'outreach',
        category: 'review',
        startDate: new Date(today.getTime() + 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Monitor and follow up on outreach responses'
      },
      {
        id: String(taskId++),
        title: 'Capture stakeholder feedback verbatim',
        lane: 'outreach',
        category: 'review',
        startDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Record exact feedback from stakeholders'
      },
      {
        id: String(taskId++),
        title: 'Identify conference / event opportunities',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Find relevant conferences and events'
      },
      {
        id: String(taskId++),
        title: 'Decide when to pause or double down on outreach',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Evaluate outreach strategy and adjust'
      },
      
      // Meta Tasks - Ongoing
      {
        id: String(taskId++),
        title: 'Align team before mentor review',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Ensure team alignment before reviews'
      },
      {
        id: String(taskId++),
        title: 'Prepare to answer timeline questions confidently',
        lane: 'outreach',
        category: 'planning',
        startDate: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(today.getTime() + 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Be ready to discuss project timeline'
      }
    ]
    setTasks(initialTasks)
  }, [])

  useEffect(() => {
    // Save tasks to localStorage whenever they change
    localStorage.setItem('timelineTasks', JSON.stringify(tasks))
  }, [tasks])

  const handleTaskSelect = (taskId: string, ctrlKey: boolean) => {
    if (ctrlKey) {
      // Toggle selection
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(taskId)) {
          newSet.delete(taskId)
        } else {
          newSet.add(taskId)
        }
        return newSet
      })
    } else {
      // Single select (clear others)
      setSelectedTaskIds(new Set([taskId]))
    }
  }

  // Handle keyboard shortcuts for multi-select deletion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Delete or Ctrl+Backspace to delete selected tasks
      if ((e.ctrlKey || e.metaKey) && (e.key === 'Delete' || e.key === 'Backspace')) {
        setSelectedTaskIds(currentSelected => {
          if (currentSelected.size === 0) return currentSelected
          
          const count = currentSelected.size
          if (confirm(`Are you sure you want to delete ${count} task${count !== 1 ? 's' : ''}?`)) {
            setTasks(prevTasks => prevTasks.filter(t => !currentSelected.has(t.id)))
            setIsModalOpen(false)
            setEditingTask(null)
            return new Set()
          }
          return currentSelected
        })
        e.preventDefault()
      }
      // Escape to clear selection
      if (e.key === 'Escape') {
        setSelectedTaskIds(new Set())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t))
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
          {tasks.length === 0 && (
            <button 
              className="btn-secondary" 
              onClick={() => {
                if (confirm('Load initial 3-month execution plan tasks?')) {
                  localStorage.removeItem('timelineTasks')
                  window.location.reload()
                }
              }}
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              Load Initial Tasks
            </button>
          )}
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
                  onTaskUpdate={handleTaskUpdate}
                  selectedTaskIds={selectedTaskIds}
                  onTaskSelect={handleTaskSelect}
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