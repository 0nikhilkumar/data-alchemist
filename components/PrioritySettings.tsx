'use client';

import { useState } from 'react';
import { Sliders, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/lib/store';
import { toast } from 'sonner';

const PRIORITY_PRESETS = {
  'maximize-fulfillment': {
    name: 'Maximize Fulfillment',
    description: 'Focus on satisfying as many client requests as possible',
    weights: {
      priorityLevel: 0.15,
      requestFulfillment: 0.40,
      fairDistribution: 0.15,
      workloadBalance: 0.15,
      skillMatch: 0.15,
    }
  },
  'fair-distribution': {
    name: 'Fair Distribution',
    description: 'Ensure balanced workload across all workers',
    weights: {
      priorityLevel: 0.20,
      requestFulfillment: 0.20,
      fairDistribution: 0.35,
      workloadBalance: 0.15,
      skillMatch: 0.10,
    }
  },
  'skill-optimization': {
    name: 'Skill Optimization',
    description: 'Maximize skill-task matching for optimal performance',
    weights: {
      priorityLevel: 0.15,
      requestFulfillment: 0.20,
      fairDistribution: 0.15,
      workloadBalance: 0.15,
      skillMatch: 0.35,
    }
  },
  'priority-driven': {
    name: 'Priority Driven',
    description: 'Heavily weight client priority levels',
    weights: {
      priorityLevel: 0.40,
      requestFulfillment: 0.25,
      fairDistribution: 0.15,
      workloadBalance: 0.10,
      skillMatch: 0.10,
    }
  },
  'balanced': {
    name: 'Balanced Approach',
    description: 'Equal consideration of all factors',
    weights: {
      priorityLevel: 0.20,
      requestFulfillment: 0.20,
      fairDistribution: 0.20,
      workloadBalance: 0.20,
      skillMatch: 0.20,
    }
  }
};

export function PrioritySettings() {
  const { priorityWeights, setPriorityWeights } = useDataStore();
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handleWeightChange = (key: keyof typeof priorityWeights, value: number[]) => {
    const newWeights = { ...priorityWeights, [key]: value[0] / 100 };
    
    const total = Object.values(newWeights).reduce((sum, weight) => sum + weight, 0);
    const normalizedWeights = Object.entries(newWeights).reduce((acc, [k, v]) => {
      acc[k as keyof typeof priorityWeights] = v / total;
      return acc;
    }, {} as typeof priorityWeights);
    
    setPriorityWeights(normalizedWeights);
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRIORITY_PRESETS[presetKey as keyof typeof PRIORITY_PRESETS];
    if (preset) {
      setPriorityWeights(preset.weights);
      setSelectedPreset(presetKey);
      toast.success(`Applied ${preset.name} preset`);
    }
  };

  const resetToDefault = () => {
    const defaultWeights = {
      priorityLevel: 0.25,
      requestFulfillment: 0.25,
      fairDistribution: 0.2,
      workloadBalance: 0.15,
      skillMatch: 0.15,
    };
    setPriorityWeights(defaultWeights);
    setSelectedPreset('');
    toast.success('Reset to default weights');
  };

  const getWeightPercentage = (weight: number) => Math.round(weight * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Priority & Weights Configuration</h2>
          <p className="text-gray-600">Configure how the system should balance different allocation criteria</p>
        </div>
        <Button onClick={resetToDefault} variant="outline">
          Reset to Default
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Preset Configurations</span>
          </CardTitle>
          <CardDescription>
            Choose from predefined optimization strategies or create custom weights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PRIORITY_PRESETS).map(([key, preset]) => (
              <div 
                key={key}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPreset === key 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => applyPreset(key)}
              >
                <h4 className="font-medium mb-2">{preset.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{preset.description}</p>
                <div className="space-y-1">
                  {Object.entries(preset.weights).map(([weightKey, value]) => (
                    <div key={weightKey} className="flex justify-between text-xs">
                      <span className="capitalize">{weightKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(value * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-emerald-600" />
            <span>Custom Weight Configuration</span>
          </CardTitle>
          <CardDescription>
            Fine-tune individual criteria weights. Weights are automatically normalized to sum to 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="priority-level">Priority Level Weight</Label>
                <Badge variant="outline">{getWeightPercentage(priorityWeights.priorityLevel)}%</Badge>
              </div>
              <Slider
                id="priority-level"
                min={0}
                max={100}
                step={1}
                value={[getWeightPercentage(priorityWeights.priorityLevel)]}
                onValueChange={(value) => handleWeightChange('priorityLevel', value)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                How much client priority levels should influence allocation decisions
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="request-fulfillment">Request Fulfillment Weight</Label>
                <Badge variant="outline">{getWeightPercentage(priorityWeights.requestFulfillment)}%</Badge>
              </div>
              <Slider
                id="request-fulfillment"
                min={0}
                max={100}
                step={1}
                value={[getWeightPercentage(priorityWeights.requestFulfillment)]}
                onValueChange={(value) => handleWeightChange('requestFulfillment', value)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Importance of satisfying client-requested task assignments
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="fair-distribution">Fair Distribution Weight</Label>
                <Badge variant="outline">{getWeightPercentage(priorityWeights.fairDistribution)}%</Badge>
              </div>
              <Slider
                id="fair-distribution"
                min={0}
                max={100}
                step={1}
                value={[getWeightPercentage(priorityWeights.fairDistribution)]}
                onValueChange={(value) => handleWeightChange('fairDistribution', value)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Ensuring equitable task distribution across all workers
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="workload-balance">Workload Balance Weight</Label>
                <Badge variant="outline">{getWeightPercentage(priorityWeights.workloadBalance)}%</Badge>
              </div>
              <Slider
                id="workload-balance"
                min={0}
                max={100}
                step={1}
                value={[getWeightPercentage(priorityWeights.workloadBalance)]}
                onValueChange={(value) => handleWeightChange('workloadBalance', value)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Preventing worker overload and maintaining reasonable workloads
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <Label htmlFor="skill-match">Skill Match Weight</Label>
                <Badge variant="outline">{getWeightPercentage(priorityWeights.skillMatch)}%</Badge>
              </div>
              <Slider
                id="skill-match"
                min={0}
                max={100}
                step={1}
                value={[getWeightPercentage(priorityWeights.skillMatch)]}
                onValueChange={(value) => handleWeightChange('skillMatch', value)}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2">
                Matching tasks with workers who have the best relevant skills
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <span>Weight Distribution Visualization</span>
          </CardTitle>
          <CardDescription>
            Visual representation of your current weight configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(priorityWeights).map(([key, weight]) => (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span>{getWeightPercentage(weight)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getWeightPercentage(weight)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}