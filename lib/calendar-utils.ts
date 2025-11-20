/**
 * Calendar utility functions for conflict detection and scheduling
 */

import { format, parseISO, areIntervalsOverlapping, isSameDay } from 'date-fns';
import { Event } from '@/hooks/useEvents';
import { TaskWithRelations } from '@/hooks/useTasks';

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingEvents: Event[];
  conflictingTasks: TaskWithRelations[];
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface SchedulingConflict {
  type: 'event' | 'task';
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  conflictSeverity: 'low' | 'medium' | 'high';
}

/**
 * Check for conflicts when scheduling a task as an event
 */
export function checkTaskSchedulingConflicts(
  targetDate: Date,
  targetHour: number = 9,
  duration: number = 1, // hours
  existingEvents: Event[],
  existingTasks: TaskWithRelations[]
): ConflictInfo {
  const startTime = new Date(targetDate);
  startTime.setHours(targetHour, 0, 0, 0);
  
  const endTime = new Date(startTime);
  endTime.setHours(targetHour + duration, 0, 0, 0);

  const targetInterval = { start: startTime, end: endTime };

  // Check conflicts with events
  const conflictingEvents = existingEvents.filter(event => {
    if (event.status === 'cancelled') return false;
    
    const eventStart = parseISO(event.start_at);
    const eventEnd = parseISO(event.end_at);
    
    return isSameDay(eventStart, targetDate) && areIntervalsOverlapping(
      targetInterval,
      { start: eventStart, end: eventEnd }
    );
  });

  // Check conflicts with tasks that have specific times (converted to events)
  const conflictingTasks = existingTasks.filter(task => {
    if (!task.due_date || task.status === 'completed' || task.status === 'cancelled') return false;
    
    const taskDate = new Date(task.due_date);
    return isSameDay(taskDate, targetDate);
  });

  const totalConflicts = conflictingEvents.length + conflictingTasks.length;
  let severity: 'low' | 'medium' | 'high' = 'low';
  let message = '';

  if (totalConflicts === 0) {
    return {
      hasConflict: false,
      conflictingEvents: [],
      conflictingTasks: [],
      severity: 'low',
      message: 'Nenhum conflito detectado'
    };
  }

  // Determine severity
  if (totalConflicts >= 3) {
    severity = 'high';
    message = `⚠️ Alta sobrecarga: ${totalConflicts} itens no mesmo período`;
  } else if (totalConflicts >= 2) {
    severity = 'medium';
    message = `⚠️ Possível conflito: ${totalConflicts} itens no mesmo período`;
  } else {
    severity = 'low';
    message = `ℹ️ Conflito menor: ${totalConflicts} item no mesmo período`;
  }

  return {
    hasConflict: true,
    conflictingEvents,
    conflictingTasks,
    severity,
    message
  };
}

/**
 * Get available time slots for a given date
 */
export function getAvailableTimeSlots(
  date: Date,
  existingEvents: Event[],
  workingHours = { start: 8, end: 18 }
): { hour: number; available: boolean; conflicts: number }[] {
  const slots = [];
  
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    const conflicts = checkTaskSchedulingConflicts(date, hour, 1, existingEvents, []);
    slots.push({
      hour,
      available: !conflicts.hasConflict,
      conflicts: conflicts.conflictingEvents.length + conflicts.conflictingTasks.length
    });
  }
  
  return slots;
}

/**
 * Find the next available time slot
 */
export function findNextAvailableSlot(
  date: Date,
  existingEvents: Event[],
  preferredHour = 9,
  workingHours = { start: 8, end: 18 }
): { hour: number; hasConflicts: boolean } {
  const slots = getAvailableTimeSlots(date, existingEvents, workingHours);
  
  // Try preferred hour first
  const preferredSlot = slots.find(slot => slot.hour === preferredHour);
  if (preferredSlot && preferredSlot.available) {
    return { hour: preferredHour, hasConflicts: false };
  }
  
  // Find next available slot
  const availableSlot = slots.find(slot => slot.available);
  if (availableSlot) {
    return { hour: availableSlot.hour, hasConflicts: false };
  }
  
  // Return least conflicted slot if none available
  const leastConflictedSlot = slots.reduce((min, slot) => 
    slot.conflicts < min.conflicts ? slot : min
  );
  
  return { hour: leastConflictedSlot.hour, hasConflicts: true };
}

/**
 * Calculate task density for a given date
 */
export function calculateDayDensity(
  date: Date,
  events: Event[],
  tasks: TaskWithRelations[]
): { density: number; score: 'low' | 'medium' | 'high'; description: string } {
  const dayEvents = events.filter(event => 
    event.status !== 'cancelled' && isSameDay(parseISO(event.start_at), date)
  );
  
  const dayTasks = tasks.filter(task => 
    task.due_date && 
    task.status !== 'completed' && 
    task.status !== 'cancelled' && 
    isSameDay(new Date(task.due_date), date)
  );
  
  const totalItems = dayEvents.length + dayTasks.length;
  
  let score: 'low' | 'medium' | 'high' = 'low';
  let description = '';
  
  if (totalItems >= 6) {
    score = 'high';
    description = `Dia muito carregado (${totalItems} itens)`;
  } else if (totalItems >= 3) {
    score = 'medium';
    description = `Dia moderado (${totalItems} itens)`;
  } else {
    score = 'low';
    description = `Dia livre (${totalItems} itens)`;
  }
  
  return {
    density: totalItems,
    score,
    description
  };
}

/**
 * Generate scheduling suggestions
 */
export function generateSchedulingSuggestions(
  task: TaskWithRelations,
  targetDate: Date,
  existingEvents: Event[],
  existingTasks: TaskWithRelations[]
): {
  recommended: boolean;
  suggestions: string[];
  alternativeSlots: { hour: number; reason: string }[];
} {
  const dayDensity = calculateDayDensity(targetDate, existingEvents, existingTasks);
  const conflicts = checkTaskSchedulingConflicts(targetDate, 9, 1, existingEvents, existingTasks);
  const availableSlots = getAvailableTimeSlots(targetDate, existingEvents);
  
  const suggestions: string[] = [];
  const alternativeSlots: { hour: number; reason: string }[] = [];
  
  // Analyze density
  if (dayDensity.score === 'high') {
    suggestions.push('⚠️ Dia muito carregado - considere reagendar');
  } else if (dayDensity.score === 'medium') {
    suggestions.push('ℹ️ Dia moderadamente ocupado');
  }
  
  // Analyze conflicts
  if (conflicts.hasConflict) {
    suggestions.push(conflicts.message);
  }
  
  // Find alternative slots
  availableSlots.forEach(slot => {
    if (slot.available) {
      alternativeSlots.push({
        hour: slot.hour,
        reason: 'Horário livre'
      });
    } else if (slot.conflicts <= 1) {
      alternativeSlots.push({
        hour: slot.hour,
        reason: 'Conflito menor'
      });
    }
  });
  
  // Priority-based recommendations
  if (task.priority === 'urgent' || task.priority === 'high') {
    suggestions.push('✅ Tarefa de alta prioridade - agendar mesmo com conflitos');
  }
  
  return {
    recommended: !conflicts.hasConflict || task.priority === 'urgent',
    suggestions,
    alternativeSlots: alternativeSlots.slice(0, 3) // Top 3 alternatives
  };
}