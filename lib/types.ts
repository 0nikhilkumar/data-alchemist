export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: number;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[];
  MaxConcurrent: number;
}

export interface ValidationResult {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  entityType: 'client' | 'worker' | 'task';
  entityId: string;
  field?: string;
  suggestion?: string;
}

export interface BusinessRule {
  id: string;
  type: 'coRun' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'patternMatch' | 'precedence' | 'custom';
  name: string;
  description: string;
  config: any;
  enabled: boolean;
  createdAt: Date;
}

export interface PriorityWeights {
  priorityLevel: number;
  requestFulfillment: number;
  fairDistribution: number;
  workloadBalance: number;
  skillMatch: number;
}

export interface FileUploadResult {
  data: any[];
  headers: string[];
  mappedHeaders: Record<string, string>;
  errors: string[];
}