import { create } from 'zustand';
import { Client, Worker, Task, ValidationResult, BusinessRule, PriorityWeights } from './types';

interface DataStore {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  validationResults: ValidationResult[];
  businessRules: BusinessRule[];
  priorityWeights: PriorityWeights;
  
  setClients: (clients: Client[]) => void;
  setWorkers: (workers: Worker[]) => void;
  setTasks: (tasks: Task[]) => void;
  setValidationResults: (results: ValidationResult[]) => void;
  addBusinessRule: (rule: BusinessRule) => void;
  removeBusinessRule: (id: string) => void;
  updateBusinessRule: (id: string, rule: Partial<BusinessRule>) => void;
  setPriorityWeights: (weights: PriorityWeights) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
}

export const useDataStore = create<DataStore>((set, get) => ({
  clients: [],
  workers: [],
  tasks: [],
  validationResults: [],
  businessRules: [],
  priorityWeights: {
    priorityLevel: 0.25,
    requestFulfillment: 0.25,
    fairDistribution: 0.2,
    workloadBalance: 0.15,
    skillMatch: 0.15,
  },

  setClients: (clients) => set({ clients }),
  setWorkers: (workers) => set({ workers }),
  setTasks: (tasks) => set({ tasks }),
  setValidationResults: (validationResults) => set({ validationResults }),
  
  addBusinessRule: (rule) => set((state) => ({
    businessRules: [...state.businessRules, rule]
  })),
  
  removeBusinessRule: (id) => set((state) => ({
    businessRules: state.businessRules.filter(rule => rule.id !== id)
  })),
  
  updateBusinessRule: (id, updatedRule) => set((state) => ({
    businessRules: state.businessRules.map(rule => 
      rule.id === id ? { ...rule, ...updatedRule } : rule
    )
  })),
  
  setPriorityWeights: (priorityWeights) => set({ priorityWeights }),
  
  updateClient: (id, updatedClient) => set((state) => ({
    clients: state.clients.map(client => 
      client.ClientID === id ? { ...client, ...updatedClient } : client
    )
  })),
  
  updateWorker: (id, updatedWorker) => set((state) => ({
    workers: state.workers.map(worker => 
      worker.WorkerID === id ? { ...worker, ...updatedWorker } : worker
    )
  })),
  
  updateTask: (id, updatedTask) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.TaskID === id ? { ...task, ...updatedTask } : task
    )
  })),
}));