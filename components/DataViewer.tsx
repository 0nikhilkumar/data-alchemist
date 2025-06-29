'use client';

import { useState } from 'react';
import { Search, Edit3, Save, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/lib/store';
import { AIEngine } from '@/lib/ai-engine';
import { toast } from 'sonner';

export function DataViewer() {
  const { clients, workers, tasks, updateClient, updateWorker, updateTask } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState<any>({});
  const [editingCell, setEditingCell] = useState<{ type: string, id: string, field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleNaturalLanguageSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const filteredClients = await AIEngine.processNaturalLanguageQuery(searchQuery, clients);
      const filteredWorkers = await AIEngine.processNaturalLanguageQuery(searchQuery, workers);
      const filteredTasks = await AIEngine.processNaturalLanguageQuery(searchQuery, tasks);
      
      setFilteredData({
        clients: filteredClients,
        workers: filteredWorkers,
        tasks: filteredTasks
      });
      
      toast.success(`Found ${filteredClients.length + filteredWorkers.length + filteredTasks.length} matching records`);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredData({});
  };

  const startEdit = (type: string, id: string, field: string, currentValue: any) => {
    setEditingCell({ type, id, field });
    setEditValue(Array.isArray(currentValue) ? currentValue.join(', ') : currentValue?.toString() || '');
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const { type, id, field } = editingCell;
    let processedValue: any = editValue;
    
    if (['RequestedTaskIDs', 'Skills', 'RequiredSkills'].includes(field)) {
      processedValue = editValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
    } else if (['AvailableSlots', 'PreferredPhases'].includes(field)) {
      processedValue = editValue.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    } else if (['PriorityLevel', 'Duration', 'MaxLoadPerPhase', 'MaxConcurrent', 'QualificationLevel'].includes(field)) {
      processedValue = parseInt(editValue) || 0;
    }
    
    switch (type) {
      case 'clients':
        updateClient(id, { [field]: processedValue });
        break;
      case 'workers':
        updateWorker(id, { [field]: processedValue });
        break;  
      case 'tasks':
        updateTask(id, { [field]: processedValue });
        break;
    }
    
    setEditingCell(null);
    toast.success('Data updated successfully');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const displayData = {
    clients: filteredData.clients || clients,
    workers: filteredData.workers || workers,
    tasks: filteredData.tasks || tasks
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>AI-Powered Data Search</span>
          </CardTitle>
          <CardDescription>
            Use natural language to search your data. Try: "All tasks with duration more than 2 phases" or "Workers with JavaScript skills"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Search using natural language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleNaturalLanguageSearch}
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            {filteredData.clients && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">
            Clients ({displayData.clients.length})
          </TabsTrigger>
          <TabsTrigger value="workers">
            Workers ({displayData.workers.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({displayData.tasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients">
          <DataTable
            data={displayData.clients}
            type="clients"
            onEdit={startEdit}
            editingCell={editingCell}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        </TabsContent>

        <TabsContent value="workers">
          <DataTable
            data={displayData.workers}
            type="workers"
            onEdit={startEdit}
            editingCell={editingCell}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <DataTable
            data={displayData.tasks}
            type="tasks"
            onEdit={startEdit}
            editingCell={editingCell}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onSave={saveEdit}
            onCancel={cancelEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface DataTableProps {
  data: any[];
  type: string;
  onEdit: (type: string, id: string, field: string, currentValue: any) => void;
  editingCell: { type: string, id: string, field: string } | null;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function DataTable({ data, type, onEdit, editingCell, editValue, onEditValueChange, onSave, onCancel }: DataTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                {headers.map((header) => (
                  <th key={header} className="text-left p-3 font-medium text-gray-700">
                    {header}
                  </th>
                ))}
                <th className="text-left p-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={row[headers[0]] || index} className="border-b hover:bg-gray-50">
                  {headers.map((header) => (
                    <td key={header} className="p-3">
                      <EditableCell
                        value={row[header]}
                        isEditing={editingCell?.type === type && editingCell?.id === row[headers[0]] && editingCell?.field === header}
                        editValue={editValue}
                        onEditValueChange={onEditValueChange}
                        onStartEdit={() => onEdit(type, row[headers[0]], header, row[header])}
                        onSave={onSave}
                        onCancel={onCancel}
                      />
                    </td>
                  ))}
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(type, row[headers[0]], headers[1], row[headers[1]])}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface EditableCellProps {
  value: any;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditableCell({ value, isEditing, editValue, onEditValueChange, onStartEdit, onSave, onCancel }: EditableCellProps) {
  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          className="h-8"
          onKeyPress={(e) => e.key === 'Enter' && onSave()}
        />
        <Button size="sm" onClick={onSave}>
          <Save className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const displayValue = Array.isArray(value) ? (
    <div className="flex flex-wrap gap-1">
      {value.map((item, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {item}
        </Badge>
      ))}
    </div>
  ) : (
    <span 
      className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
      onClick={onStartEdit}
    >
      {value?.toString() || '-'}
    </span>
  );

  return displayValue;
}