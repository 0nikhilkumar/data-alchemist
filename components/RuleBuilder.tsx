'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AIEngine } from '@/lib/ai-engine';
import { useDataStore } from '@/lib/store';
import { Download, Plus, Settings, Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function RuleBuilder() {
  const { businessRules, addBusinessRule, removeBusinessRule, updateBusinessRule, clients, workers, tasks } = useDataStore();
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [isGeneratingRule, setIsGeneratingRule] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const generateRuleFromNaturalLanguage = async () => {
    if (!newRuleDescription.trim()) return;
    
    setIsGeneratingRule(true);
    try {
      const ruleConfig = await AIEngine.generateRuleFromNaturalLanguage(newRuleDescription);
      
      const newRule = {
        id: Date.now().toString(),
        ...ruleConfig,
        enabled: true,
        createdAt: new Date()
      };
      
      addBusinessRule(newRule);
      setNewRuleDescription('');
      toast.success('Rule generated successfully');
    } catch (error) {
      toast.error('Failed to generate rule');
    } finally {
      setIsGeneratingRule(false);
    }
  };

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const recs = await AIEngine.recommendBusinessRules(clients, workers, tasks);
      setRecommendations(recs);
      toast.success(`Found ${recs.length} rule recommendations`);
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const acceptRecommendation = (recommendation: any) => {
    const newRule = {
      id: Date.now().toString(),
      type: recommendation.type,
      name: recommendation.title,
      description: recommendation.description,
      config: recommendation.config,
      enabled: true,
      createdAt: new Date()
    };
    
    addBusinessRule(newRule);
    setRecommendations(recs => recs.filter(r => r !== recommendation));
    toast.success('Recommendation added as rule');
  };

  const exportRulesConfig = () => {
    const config = {
      rules: businessRules.filter(rule => rule.enabled),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Rules configuration exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Rules Builder</h2>
          <p className="text-gray-600">Create intelligent business rules using natural language</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={loadRecommendations}
            disabled={isLoadingRecommendations}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {isLoadingRecommendations ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            AI Recommendations
          </Button>
          <Button 
            onClick={exportRulesConfig}
            disabled={businessRules.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Rules
          </Button>
        </div>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-blue-600" />
            <span>Natural Language Rule Generator</span>
          </CardTitle>
          <CardDescription>
            Describe your business rule in plain English. Examples: "Tasks T1 and T2 should run together", "Limit worker group A to maximum 5 tasks per phase"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-description">Rule Description</Label>
              <Textarea
                id="rule-description"
                placeholder="Describe your business rule..."
                value={newRuleDescription}
                onChange={(e) => setNewRuleDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={generateRuleFromNaturalLanguage}
              disabled={!newRuleDescription.trim() || isGeneratingRule}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingRule ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Generate Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
            <CardDescription>
              Based on your data patterns, here are some suggested business rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{rec.type}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(rec.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <h4 className="font-medium text-amber-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-amber-800">{rec.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => acceptRecommendation(rec)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setRecommendations(recs => recs.filter(r => r !== rec))}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Business Rules ({businessRules.length})</CardTitle>
          <CardDescription>
            Manage your configured business rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          {businessRules.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No business rules configured yet</p>
              <p className="text-sm text-gray-400 mt-2">Use the natural language generator above to create your first rule</p>
            </div>
          ) : (
            <div className="space-y-4">
              {businessRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant="outline">{rule.type}</Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => updateBusinessRule(rule.id, { enabled })}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <div className="bg-gray-50 rounded-md p-3">
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {JSON.stringify(rule.config, null, 2)}
                        </pre>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {rule.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBusinessRule(rule.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}