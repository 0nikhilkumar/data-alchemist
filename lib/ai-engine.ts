export class AIEngine {
  static async processNaturalLanguageQuery(query: string, data: any[]): Promise<any[]> {
    if (!query.trim() || data.length === 0) {
      return data;
    }

    const lowercaseQuery = query.toLowerCase().trim();
    let filteredData = [...data];

    // Apply filters in order of specificity - skills first for precision
    filteredData = this.applySkillFilters(lowercaseQuery, filteredData);
    
    // Only apply other filters if skill filter didn't find specific matches
    if (filteredData.length === data.length) {
      filteredData = this.applyPriorityFilters(lowercaseQuery, filteredData);
      filteredData = this.applyDurationFilters(lowercaseQuery, filteredData);
      filteredData = this.applyPhaseFilters(lowercaseQuery, filteredData);
      filteredData = this.applyCategoryFilters(lowercaseQuery, filteredData);
      filteredData = this.applyGroupFilters(lowercaseQuery, filteredData);
      filteredData = this.applyNameFilters(lowercaseQuery, filteredData);
      filteredData = this.applyQualificationFilters(lowercaseQuery, filteredData);
      filteredData = this.applyLoadFilters(lowercaseQuery, filteredData);
      filteredData = this.applyConcurrencyFilters(lowercaseQuery, filteredData);
    }
    
    // If no specific filters matched, apply general search
    if (filteredData.length === data.length) {
      filteredData = this.applyGeneralSearch(lowercaseQuery, filteredData);
    }

    return filteredData;
  }

  private static applySkillFilters(query: string, data: any[]): any[] {
    // Define exact skill mappings to prevent false matches
    const exactSkillMappings: Record<string, string[]> = {
      'javascript': ['javascript', 'js'],
      'js': ['javascript', 'js'],
      'java': ['java'],
      'python': ['python'],
      'react': ['react', 'reactjs', 'react.js'],
      'angular': ['angular', 'angularjs'],
      'vue': ['vue', 'vue.js', 'vuejs'],
      'node': ['node', 'node.js', 'nodejs'],
      'typescript': ['typescript', 'ts'],
      'css': ['css', 'css3'],
      'html': ['html', 'html5'],
      'sql': ['sql'],
      'postgresql': ['postgresql', 'postgres'],
      'mysql': ['mysql'],
      'mongodb': ['mongodb', 'mongo'],
      'php': ['php'],
      'laravel': ['laravel'],
      'django': ['django'],
      'flask': ['flask'],
      'spring': ['spring'],
      'express': ['express', 'expressjs'],
      'aws': ['aws', 'amazon web services'],
      'docker': ['docker'],
      'kubernetes': ['kubernetes', 'k8s'],
      'ai': ['ai', 'artificial intelligence'],
      'ml': ['ml', 'machine learning'],
      'tensorflow': ['tensorflow'],
      'ux': ['ux', 'user experience'],
      'ui': ['ui', 'user interface'],
      'figma': ['figma'],
      'testing': ['testing'],
      'qa': ['qa', 'quality assurance'],
      'selenium': ['selenium'],
      'devops': ['devops'],
      'git': ['git'],
      'go': ['go', 'golang'],
      'rust': ['rust'],
      'c#': ['c#', 'csharp'],
      '.net': ['.net', 'dotnet'],
      'ruby': ['ruby'],
      'rails': ['rails', 'ruby on rails'],
      'data science': ['data science', 'data analysis'],
      'r': ['r'],
      'statistics': ['statistics', 'stats']
    };

    // Extract skills from query with better precision
    let skillsToFind: string[] = [];

    // Check for direct skill mentions
    Object.keys(exactSkillMappings).forEach(skill => {
      // Use word boundaries to ensure exact matches
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (skillRegex.test(query)) {
        skillsToFind.push(skill);
      }
    });

    // Check for skill patterns like "with JavaScript", "knows Python", etc.
    const skillPatterns = [
      /(?:with|knows?|having|expert in|skilled in)\s+([a-zA-Z#\.]+)/gi,
      /([a-zA-Z#\.]+)\s+skill[s]?/gi,
      /([a-zA-Z#\.]+)\s+developer[s]?/gi,
      /([a-zA-Z#\.]+)\s+experience/gi
    ];

    skillPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(query)) !== null) {
        const extractedSkill = match[1].toLowerCase().trim();
        if (exactSkillMappings[extractedSkill]) {
          skillsToFind.push(extractedSkill);
        }
      }
    });

    // Remove duplicates
    skillsToFind = [...new Set(skillsToFind)];

    if (skillsToFind.length > 0) {
      return data.filter(item => {
        const itemSkills = item.Skills || item.RequiredSkills || [];
        if (!Array.isArray(itemSkills)) return false;
        
        const itemSkillsLower = itemSkills.map((skill: string) => skill.toLowerCase().trim());
        
        return skillsToFind.some(searchSkill => {
          const allowedVariations = exactSkillMappings[searchSkill] || [searchSkill];
          
          return itemSkillsLower.some((itemSkill: string) => {
            // Exact match check
            return allowedVariations.some(variation => 
              itemSkill === variation || 
              itemSkill.includes(variation) ||
              variation.includes(itemSkill)
            );
          });
        });
      });
    }

    return data;
  }

  private static applyPriorityFilters(query: string, data: any[]): any[] {
    // High priority patterns
    if (query.includes('high priority') || query.includes('highest priority')) {
      return data.filter(item => item.PriorityLevel && item.PriorityLevel >= 4);
    }
    
    // Low priority patterns
    if (query.includes('low priority') || query.includes('lowest priority')) {
      return data.filter(item => item.PriorityLevel && item.PriorityLevel <= 2);
    }
    
    // Medium priority patterns
    if (query.includes('medium priority') || query.includes('mid priority')) {
      return data.filter(item => item.PriorityLevel && item.PriorityLevel === 3);
    }
    
    // Specific priority level
    const priorityMatch = query.match(/priority\s+(?:level\s+)?(\d+)/);
    if (priorityMatch) {
      const level = parseInt(priorityMatch[1]);
      return data.filter(item => item.PriorityLevel && item.PriorityLevel === level);
    }
    
    // Priority comparisons
    const priorityAboveMatch = query.match(/priority\s+(?:above|over|greater than|more than|\>)\s+(\d+)/);
    if (priorityAboveMatch) {
      const level = parseInt(priorityAboveMatch[1]);
      return data.filter(item => item.PriorityLevel && item.PriorityLevel > level);
    }
    
    const priorityBelowMatch = query.match(/priority\s+(?:below|under|less than|\<)\s+(\d+)/);
    if (priorityBelowMatch) {
      const level = parseInt(priorityBelowMatch[1]);
      return data.filter(item => item.PriorityLevel && item.PriorityLevel < level);
    }

    return data;
  }

  private static applyDurationFilters(query: string, data: any[]): any[] {
    // Duration more than
    const moreThanMatch = query.match(/duration\s+(?:more than|greater than|above|over|\>)\s+(\d+)/);
    if (moreThanMatch) {
      const threshold = parseInt(moreThanMatch[1]);
      return data.filter(item => item.Duration && parseInt(item.Duration) > threshold);
    }

    // Duration less than
    const lessThanMatch = query.match(/duration\s+(?:less than|below|under|\<)\s+(\d+)/);
    if (lessThanMatch) {
      const threshold = parseInt(lessThanMatch[1]);
      return data.filter(item => item.Duration && parseInt(item.Duration) < threshold);
    }

    // Exact duration
    const exactMatch = query.match(/duration\s+(?:of\s+)?(\d+)/);
    if (exactMatch) {
      const duration = parseInt(exactMatch[1]);
      return data.filter(item => item.Duration && parseInt(item.Duration) === duration);
    }

    // Alternative patterns
    const phaseMatch = query.match(/(\d+)\s+phase[s]?/);
    if (phaseMatch) {
      const phases = parseInt(phaseMatch[1]);
      return data.filter(item => item.Duration && parseInt(item.Duration) === phases);
    }

    return data;
  }

  private static applyPhaseFilters(query: string, data: any[]): any[] {
    // Phase availability
    const phaseMatch = query.match(/(?:phase|available in phase|work in phase)\s+(\d+)/);
    if (phaseMatch) {
      const phaseNum = parseInt(phaseMatch[1]);
      
      return data.filter(item => {
        // Check AvailableSlots for workers
        if (item.AvailableSlots && Array.isArray(item.AvailableSlots)) {
          return item.AvailableSlots.includes(phaseNum);
        }
        // Check PreferredPhases for tasks
        if (item.PreferredPhases && Array.isArray(item.PreferredPhases)) {
          return item.PreferredPhases.includes(phaseNum);
        }
        return false;
      });
    }

    return data;
  }

  private static applyCategoryFilters(query: string, data: any[]): any[] {
    const categories = ['web', 'backend', 'frontend', 'mobile', 'ai', 'ml', 'database', 
                      'design', 'testing', 'qa', 'devops', 'analytics', 'security'];
    
    const mentionedCategory = categories.find(cat => {
      const categoryRegex = new RegExp(`\\b${cat}\\b`, 'i');
      return categoryRegex.test(query);
    });
    
    if (mentionedCategory) {
      return data.filter(item => 
        item.Category && item.Category.toLowerCase().includes(mentionedCategory)
      );
    }

    // Pattern matching for category
    const categoryMatch = query.match(/category\s+(?:is\s+)?['""]?([a-zA-Z\s]+)['""]?/);
    if (categoryMatch) {
      const category = categoryMatch[1].trim().toLowerCase();
      return data.filter(item => 
        item.Category && item.Category.toLowerCase().includes(category)
      );
    }

    return data;
  }

  private static applyGroupFilters(query: string, data: any[]): any[] {
    const groups = ['frontend', 'backend', 'ai', 'design', 'qa', 'devops', 'mobile', 
                   'analytics', 'management', 'enterprise', 'standard', 'basic'];
    
    const mentionedGroup = groups.find(group => {
      const groupRegex = new RegExp(`\\b${group}\\b`, 'i');
      return groupRegex.test(query);
    });
    
    if (mentionedGroup) {
      return data.filter(item => 
        (item.WorkerGroup && item.WorkerGroup.toLowerCase().includes(mentionedGroup)) ||
        (item.GroupTag && item.GroupTag.toLowerCase().includes(mentionedGroup))
      );
    }

    return data;
  }

  private static applyNameFilters(query: string, data: any[]): any[] {
    // Extract names from query
    const nameMatch = query.match(/name\s+(?:contains?|includes?|has|is)\s+['""]?([a-zA-Z\s]+)['""]?/);
    if (nameMatch) {
      const name = nameMatch[1].trim().toLowerCase();
      return data.filter(item => 
        (item.ClientName && item.ClientName.toLowerCase().includes(name)) ||
        (item.WorkerName && item.WorkerName.toLowerCase().includes(name)) ||
        (item.TaskName && item.TaskName.toLowerCase().includes(name))
      );
    }

    return data;
  }

  private static applyQualificationFilters(query: string, data: any[]): any[] {
    const qualMatch = query.match(/qualification\s+(?:level\s+)?(?:above|over|greater than|\>)\s+(\d+)/);
    if (qualMatch) {
      const level = parseInt(qualMatch[1]);
      return data.filter(item => item.QualificationLevel && item.QualificationLevel > level);
    }

    const qualBelowMatch = query.match(/qualification\s+(?:level\s+)?(?:below|under|less than|\<)\s+(\d+)/);
    if (qualBelowMatch) {
      const level = parseInt(qualBelowMatch[1]);
      return data.filter(item => item.QualificationLevel && item.QualificationLevel < level);
    }

    const qualExactMatch = query.match(/qualification\s+(?:level\s+)?(\d+)/);
    if (qualExactMatch) {
      const level = parseInt(qualExactMatch[1]);
      return data.filter(item => item.QualificationLevel && item.QualificationLevel === level);
    }

    return data;
  }

  private static applyLoadFilters(query: string, data: any[]): any[] {
    const loadMatch = query.match(/(?:load|capacity)\s+(?:more than|above|over|\>)\s+(\d+)/);
    if (loadMatch) {
      const threshold = parseInt(loadMatch[1]);
      return data.filter(item => item.MaxLoadPerPhase && item.MaxLoadPerPhase > threshold);
    }

    const loadBelowMatch = query.match(/(?:load|capacity)\s+(?:less than|below|under|\<)\s+(\d+)/);
    if (loadBelowMatch) {
      const threshold = parseInt(loadBelowMatch[1]);
      return data.filter(item => item.MaxLoadPerPhase && item.MaxLoadPerPhase < threshold);
    }

    return data;
  }

  private static applyConcurrencyFilters(query: string, data: any[]): any[] {
    const concurrentMatch = query.match(/(?:concurrent|parallel)\s+(?:more than|above|over|\>)\s+(\d+)/);
    if (concurrentMatch) {
      const threshold = parseInt(concurrentMatch[1]);
      return data.filter(item => item.MaxConcurrent && item.MaxConcurrent > threshold);
    }

    return data;
  }

  private static applyGeneralSearch(query: string, data: any[]): any[] {
    // Split query into meaningful words, excluding common stop words
    const stopWords = ['the', 'and', 'or', 'with', 'has', 'have', 'are', 'is', 'more', 'than', 'less', 'all', 'any', 'who', 'what', 'where', 'when', 'how'];
    const searchWords = query.split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !stopWords.includes(word.toLowerCase()))
      .map(word => word.toLowerCase());

    if (searchWords.length === 0) return data;

    return data.filter(item => {
      // Create searchable text from all relevant fields
      const searchableFields = [];
      
      // Add specific fields based on item type
      if (item.ClientName) searchableFields.push(item.ClientName.toLowerCase());
      if (item.WorkerName) searchableFields.push(item.WorkerName.toLowerCase());
      if (item.TaskName) searchableFields.push(item.TaskName.toLowerCase());
      if (item.Category) searchableFields.push(item.Category.toLowerCase());
      if (item.WorkerGroup) searchableFields.push(item.WorkerGroup.toLowerCase());
      if (item.GroupTag) searchableFields.push(item.GroupTag.toLowerCase());
      
      // Add array fields
      if (item.Skills && Array.isArray(item.Skills)) {
        item.Skills.forEach((skill: string) => searchableFields.push(skill.toLowerCase()));
      }
      if (item.RequiredSkills && Array.isArray(item.RequiredSkills)) {
        item.RequiredSkills.forEach((skill: string) => searchableFields.push(skill.toLowerCase()));
      }

      const searchableText = searchableFields.join(' ');

      // Check if any search word has an exact match
      return searchWords.some(word => 
        searchableFields.some(field => field.includes(word)) ||
        searchableText.includes(word)
      );
    });
  }

  static async generateRuleFromNaturalLanguage(description: string): Promise<any> {
    const lowercaseDesc = description.toLowerCase();
    
    // Enhanced co-run detection
    if (lowercaseDesc.includes('co-run') || lowercaseDesc.includes('together') || 
        lowercaseDesc.includes('same time') || lowercaseDesc.includes('simultaneously')) {
      const taskMatch = description.match(/task[s]?\s+([A-Z0-9,\s]+)/i);
      if (taskMatch) {
        const tasks = taskMatch[1].split(/[,\s]+/).map(t => t.trim()).filter(t => t.length > 0);
        return {
          type: 'coRun',
          name: 'Co-run Tasks',
          description: description,
          config: { tasks }
        };
      }
    }

    // Enhanced load limit detection
    if (lowercaseDesc.includes('load limit') || lowercaseDesc.includes('max load') || 
        lowercaseDesc.includes('maximum') || lowercaseDesc.includes('limit')) {
      const loadMatch = description.match(/(?:maximum|max|limit)\s+(?:of\s+)?(\d+)/i);
      const groupMatch = description.match(/(?:worker\s+)?group\s+([A-Za-z0-9]+)/i);
      
      if (loadMatch) {
        return {
          type: 'loadLimit',
          name: 'Load Limit Rule',
          description: description,
          config: { 
            maxLoad: parseInt(loadMatch[1]),
            group: groupMatch ? groupMatch[1] : 'all'
          }
        };
      }
    }

    // Enhanced phase window detection
    if (lowercaseDesc.includes('phase') && (lowercaseDesc.includes('window') || 
        lowercaseDesc.includes('only') || lowercaseDesc.includes('restrict'))) {
      const phaseRangeMatch = description.match(/phase[s]?\s+(\d+)(?:\s*[-–]\s*(\d+))?/i);
      const phaseListMatch = description.match(/phase[s]?\s+\[([0-9,\s]+)\]/i);
      
      let phases = [];
      if (phaseRangeMatch) {
        const start = parseInt(phaseRangeMatch[1]);
        const end = phaseRangeMatch[2] ? parseInt(phaseRangeMatch[2]) : start;
        phases = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      } else if (phaseListMatch) {
        phases = phaseListMatch[1].split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      }
      
      return {
        type: 'phaseWindow',
        name: 'Phase Window Rule',
        description: description,
        config: { phases }
      };
    }

    return {
      type: 'custom',
      name: 'Custom Rule',
      description: description,
      config: { rawDescription: description }
    };
  }

  static async suggestDataCorrections(data: any[], validationResults: any[]): Promise<any[]> {
    const suggestions = [];

    // Create a map of entities for quick lookup
    const entityMap = new Map();
    data.forEach(item => {
      const id = item.ClientID || item.WorkerID || item.TaskID;
      if (id) {
        entityMap.set(id, item);
      }
    });

    validationResults.forEach(result => {
      if (result.type === 'error') {
        const entity = entityMap.get(result.entityId);
        const currentValue = entity ? entity[result.field] : 'unknown';

        switch (result.field) {
          case 'PriorityLevel':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'invalid',
              suggestedValue: 3,
              reason: 'Set to medium priority (3) as a safe default value',
              confidence: 0.8
            });
            break;
          
          case 'Duration':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'invalid',
              suggestedValue: 1,
              reason: 'Set minimum duration of 1 phase to ensure task can be scheduled',
              confidence: 0.9
            });
            break;

          case 'AvailableSlots':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'invalid format',
              suggestedValue: [1, 2, 3],
              reason: 'Convert to array format with common phases 1, 2, and 3',
              confidence: 0.7
            });
            break;

          case 'Skills':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'empty or invalid',
              suggestedValue: ['General'],
              reason: 'Add general skill as placeholder to enable task assignment',
              confidence: 0.6
            });
            break;

          case 'RequiredSkills':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'empty or invalid',
              suggestedValue: ['General'],
              reason: 'Add general skill requirement to enable worker matching',
              confidence: 0.6
            });
            break;

          case 'MaxLoadPerPhase':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'invalid',
              suggestedValue: 2,
              reason: 'Set reasonable load limit of 2 tasks per phase',
              confidence: 0.8
            });
            break;

          case 'MaxConcurrent':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'invalid',
              suggestedValue: 1,
              reason: 'Set minimum concurrent limit to allow task execution',
              confidence: 0.8
            });
            break;

          case 'PreferredPhases':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'empty or invalid',
              suggestedValue: [1, 2],
              reason: 'Set default preferred phases to enable scheduling',
              confidence: 0.7
            });
            break;

          case 'QualificationLevel':
            suggestions.push({
              entityId: result.entityId,
              field: result.field,
              currentValue: currentValue || 'invalid',
              suggestedValue: 3,
              reason: 'Set medium qualification level (3) as default',
              confidence: 0.8
            });
            break;
        }
      }
    });

    return suggestions;
  }

  static async recommendBusinessRules(clients: any[], workers: any[], tasks: any[]): Promise<any[]> {
    const recommendations = [];

    // Analyze task patterns for co-run suggestions
    const taskCategories = new Map<string, string[]>();
    tasks.forEach(task => {
      const category = task.Category || 'uncategorized';
      if (!taskCategories.has(category)) {
        taskCategories.set(category, []);
      }
      taskCategories.get(category)?.push(task.TaskID);
    });

    taskCategories.forEach((taskIds, category) => {
      if (taskIds.length > 1) {
        recommendations.push({
          type: 'coRun',
          title: `Co-run ${category} tasks`,
          description: `Tasks ${taskIds.slice(0, 3).join(', ')}${taskIds.length > 3 ? '...' : ''} belong to the same category and might benefit from running together`,
          config: { tasks: taskIds },
          confidence: 0.6
        });
      }
    });

    // Analyze worker overload patterns
    const overloadedWorkers = workers.filter(worker => 
      worker.MaxLoadPerPhase && worker.AvailableSlots && 
      worker.MaxLoadPerPhase > worker.AvailableSlots.length
    );

    if (overloadedWorkers.length > 0) {
      recommendations.push({
        type: 'loadLimit',
        title: 'Reduce worker overload',
        description: `${overloadedWorkers.length} workers have load limits exceeding their available slots`,
        config: { maxLoad: Math.min(...overloadedWorkers.map(w => w.AvailableSlots?.length || 1)) },
        confidence: 0.8
      });
    }

    // Analyze skill coverage gaps
    const allRequiredSkills = new Set<string>();
    const allWorkerSkills = new Set<string>();
    
    tasks.forEach(task => {
      if (task.RequiredSkills) {
        task.RequiredSkills.forEach((skill: string) => allRequiredSkills.add(skill));
      }
    });
    
    workers.forEach(worker => {
      if (worker.Skills) {
        worker.Skills.forEach((skill: string) => allWorkerSkills.add(skill));
      }
    });

    const missingSkills = Array.from(allRequiredSkills).filter(skill => 
      !Array.from(allWorkerSkills).some(workerSkill => 
        workerSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(workerSkill.toLowerCase())
      )
    );

    if (missingSkills.length > 0) {
      recommendations.push({
        type: 'skillGap',
        title: 'Address skill coverage gaps',
        description: `Skills ${missingSkills.slice(0, 3).join(', ')} are required by tasks but not available in workers`,
        config: { missingSkills },
        confidence: 0.9
      });
    }

    return recommendations;
  }
}