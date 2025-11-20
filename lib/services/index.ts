/**
 * Services Index - Centralized Export
 * Export all services from a single location
 */

// Domain services
export { leadsService, LeadsService } from './leads.service';
export type {
  Lead,
  LeadWithStage,
  LeadFilters,
  LeadsResponse,
  LeadActivity,
  LeadNote,
  LeadTimeline
} from './leads.service';

export { tasksService, TasksService } from './tasks.service';
export type { 
  Task, 
  TaskInsert, 
  TaskUpdate, 
  TaskWithRelations, 
  TaskFilters, 
  TasksResponse 
} from './tasks.service';

export { usersService, UsersService } from './users.service';
export type { 
  User, 
  UserInsert, 
  UserUpdate, 
  UserWithRole, 
  UserFilters 
} from './users.service';

export { dashboardService, DashboardService } from './dashboard.service';
export type { 
  DashboardSummary,
  ChartData,
  PerformanceMetrics,
  TeamStats,
  ActivityData,
  RevenueData,
  PredictionData
} from './dashboard.service';

export { propertiesService, PropertiesService } from './properties.service';
export type { 
  Property, 
  PropertyInsert, 
  PropertyUpdate, 
  PropertyWithDetails, 
  PropertyFilters, 
  PropertiesResponse,
  PropertyAnalytics
} from './properties.service';

// Additional services can be added here as they are created:
// export { calendarService } from './calendar.service';
// export { whatsappService } from './whatsapp.service';
// export { reportsService } from './reports.service';
// export { settingsService } from './settings.service';