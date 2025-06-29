import { Client, Worker, Task, ValidationResult } from './types';

export class DataValidator {
  private clients: Client[];
  private workers: Worker[];
  private tasks: Task[];

  constructor(clients: Client[], workers: Worker[], tasks: Task[]) {
    this.clients = clients;
    this.workers = workers;
    this.tasks = tasks;
  }

  validateAll(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    results.push(...this.validateMissingColumns());
    results.push(...this.validateDuplicateIds());
    results.push(...this.validateMalformedData());
    results.push(...this.validateRangeValues());
    results.push(...this.validateJsonFields());
    results.push(...this.validateReferences());
    results.push(...this.validateWorkerCapacity());
    results.push(...this.validateSkillCoverage());
    results.push(...this.validatePhaseConstraints());
    results.push(...this.validateConcurrencyLimits());
    
    return results;
  }

  private validateMissingColumns(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Check required client fields
    this.clients.forEach(client => {
      if (!client.ClientID) {
        results.push({
          id: `missing-client-id-${Math.random()}`,
          type: 'error',
          message: 'Missing required ClientID',
          entityType: 'client',
          entityId: client.ClientID || 'unknown',
          field: 'ClientID'
        });
      }
    });

    return results;
  }

  private validateDuplicateIds(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Check duplicate ClientIDs
    const clientIds = new Set<string>();
    this.clients.forEach(client => {
      if (clientIds.has(client.ClientID)) {
        results.push({
          id: `duplicate-client-${client.ClientID}`,
          type: 'error',
          message: `Duplicate ClientID: ${client.ClientID}`,
          entityType: 'client',
          entityId: client.ClientID,
          field: 'ClientID'
        });
      }
      clientIds.add(client.ClientID);
    });

    // Check duplicate WorkerIDs
    const workerIds = new Set<string>();
    this.workers.forEach(worker => {
      if (workerIds.has(worker.WorkerID)) {
        results.push({
          id: `duplicate-worker-${worker.WorkerID}`,
          type: 'error',
          message: `Duplicate WorkerID: ${worker.WorkerID}`,
          entityType: 'worker',
          entityId: worker.WorkerID,
          field: 'WorkerID'
        });
      }
      workerIds.add(worker.WorkerID);
    });

    // Check duplicate TaskIDs
    const taskIds = new Set<string>();
    this.tasks.forEach(task => {
      if (taskIds.has(task.TaskID)) {
        results.push({
          id: `duplicate-task-${task.TaskID}`,
          type: 'error',
          message: `Duplicate TaskID: ${task.TaskID}`,
          entityType: 'task',
          entityId: task.TaskID,
          field: 'TaskID'
        });
      }
      taskIds.add(task.TaskID);
    });

    return results;
  }

  private validateMalformedData(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Validate AvailableSlots arrays
    this.workers.forEach(worker => {
      if (!Array.isArray(worker.AvailableSlots)) {
        results.push({
          id: `malformed-slots-${worker.WorkerID}`,
          type: 'error',
          message: 'AvailableSlots must be an array of numbers',
          entityType: 'worker',
          entityId: worker.WorkerID,
          field: 'AvailableSlots',
          suggestion: 'Convert to array format: [1, 2, 3]'
        });
      }
    });

    return results;
  }

  private validateRangeValues(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Validate PriorityLevel range (1-5)
    this.clients.forEach(client => {
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        results.push({
          id: `priority-range-${client.ClientID}`,
          type: 'error',
          message: `PriorityLevel must be between 1-5, got ${client.PriorityLevel}`,
          entityType: 'client',
          entityId: client.ClientID,
          field: 'PriorityLevel',
          suggestion: 'Set value between 1 and 5'
        });
      }
    });

    // Validate Duration >= 1
    this.tasks.forEach(task => {
      if (task.Duration < 1) {
        results.push({
          id: `duration-range-${task.TaskID}`,
          type: 'error',
          message: `Duration must be >= 1, got ${task.Duration}`,
          entityType: 'task',
          entityId: task.TaskID,
          field: 'Duration',
          suggestion: 'Set duration to at least 1 phase'
        });
      }
    });

    return results;
  }

  private validateJsonFields(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    this.clients.forEach(client => {
      if (client.AttributesJSON) {
        try {
          JSON.parse(client.AttributesJSON);
        } catch (e) {
          results.push({
            id: `json-error-${client.ClientID}`,
            type: 'error',
            message: 'Invalid JSON in AttributesJSON field',
            entityType: 'client',
            entityId: client.ClientID,
            field: 'AttributesJSON',
            suggestion: 'Fix JSON syntax or clear field'
          });
        }
      }
    });

    return results;
  }

  private validateReferences(): ValidationResult[] {
    const results: ValidationResult[] = [];
    const taskIds = new Set(this.tasks.map(t => t.TaskID));
    
    // Validate RequestedTaskIDs exist
    this.clients.forEach(client => {
      client.RequestedTaskIDs.forEach(taskId => {
        if (!taskIds.has(taskId)) {
          results.push({
            id: `missing-task-ref-${client.ClientID}-${taskId}`,
            type: 'error',
            message: `Referenced TaskID '${taskId}' not found in tasks`,
            entityType: 'client',
            entityId: client.ClientID,
            field: 'RequestedTaskIDs',
            suggestion: `Remove '${taskId}' or add corresponding task`
          });
        }
      });
    });

    return results;
  }

  private validateWorkerCapacity(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    this.workers.forEach(worker => {
      if (worker.AvailableSlots.length < worker.MaxLoadPerPhase) {
        results.push({
          id: `capacity-mismatch-${worker.WorkerID}`,
          type: 'warning',
          message: `MaxLoadPerPhase (${worker.MaxLoadPerPhase}) exceeds available slots (${worker.AvailableSlots.length})`,
          entityType: 'worker',
          entityId: worker.WorkerID,
          field: 'MaxLoadPerPhase',
          suggestion: `Reduce MaxLoadPerPhase to ${worker.AvailableSlots.length} or add more slots`
        });
      }
    });

    return results;
  }

  private validateSkillCoverage(): ValidationResult[] {
    const results: ValidationResult[] = [];
    const allWorkerSkills = new Set<string>();
    
    this.workers.forEach(worker => {
      worker.Skills.forEach(skill => allWorkerSkills.add(skill));
    });

    this.tasks.forEach(task => {
      task.RequiredSkills.forEach(skill => {
        if (!allWorkerSkills.has(skill)) {
          results.push({
            id: `skill-coverage-${task.TaskID}-${skill}`,
            type: 'error',
            message: `Required skill '${skill}' not available in any worker`,
            entityType: 'task',
            entityId: task.TaskID,
            field: 'RequiredSkills',
            suggestion: `Add worker with '${skill}' skill or remove from task requirements`
          });
        }
      });
    });

    return results;
  }

  private validatePhaseConstraints(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Phase-slot saturation check
    const phaseLoads = new Map<number, number>();
    
    this.tasks.forEach(task => {
      task.PreferredPhases.forEach(phase => {
        const currentLoad = phaseLoads.get(phase) || 0;
        phaseLoads.set(phase, currentLoad + task.Duration);
      });
    });

    const phaseCapacities = new Map<number, number>();
    this.workers.forEach(worker => {
      worker.AvailableSlots.forEach(phase => {
        const currentCapacity = phaseCapacities.get(phase) || 0;
        phaseCapacities.set(phase, currentCapacity + worker.MaxLoadPerPhase);
      });
    });

    phaseLoads.forEach((load, phase) => {
      const capacity = phaseCapacities.get(phase) || 0;
      if (load > capacity) {
        results.push({
          id: `phase-saturation-${phase}`,
          type: 'warning',
          message: `Phase ${phase} overloaded: ${load} duration units vs ${capacity} capacity`,
          entityType: 'task',
          entityId: 'multiple',
          suggestion: `Redistribute tasks or increase worker capacity for phase ${phase}`
        });
      }
    });

    return results;
  }

  private validateConcurrencyLimits(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    this.tasks.forEach(task => {
      // Count qualified workers
      const qualifiedWorkers = this.workers.filter(worker => 
        task.RequiredSkills.every(skill => worker.Skills.includes(skill))
      );

      if (task.MaxConcurrent > qualifiedWorkers.length) {
        results.push({
          id: `concurrency-limit-${task.TaskID}`,
          type: 'warning',
          message: `MaxConcurrent (${task.MaxConcurrent}) exceeds qualified workers (${qualifiedWorkers.length})`,
          entityType: 'task',
          entityId: task.TaskID,
          field: 'MaxConcurrent',
          suggestion: `Reduce MaxConcurrent to ${qualifiedWorkers.length} or train more workers`
        });
      }
    });

    return results;
  }
}