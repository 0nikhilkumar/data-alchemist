# Data Alchemist - Complete Testing Guide

## Website Purpose
Data Alchemist is an AI-powered platform that transforms messy spreadsheet data into intelligent resource allocation configurations. It helps organizations clean, validate, and configure business rules for optimal task-worker assignments.

## Prerequisites
- Have the sample CSV files ready (clients.csv, workers.csv, tasks.csv from the samples folder)
- Understand that this simulates a real-world scenario where you have:
  - **Clients** requesting specific tasks with different priorities
  - **Workers** with various skills and availability
  - **Tasks** requiring specific skills and having duration/phase constraints

---

## Step 1: Upload Data Files

### What to Test:
1. **Navigate to Upload Data tab** (should be active by default)
2. **Upload each sample file:**
   - Drag & drop `samples/clients.csv` to the "Clients Data" card
   - Drag & drop `samples/workers.csv` to the "Workers Data" card  
   - Drag & drop `samples/tasks.csv` to the "Tasks Data" card

### What to Observe:
- Progress bars showing file processing
- Success indicators (green checkmarks) for each file
- Error messages if files have issues
- "All Files Uploaded Successfully!" message appears
- "Continue to Data View" button becomes available

### What This Demonstrates:
- AI-powered column mapping (automatically detects ClientID, WorkerID, etc.)
- File format flexibility (CSV/XLSX support)
- Real-time validation during upload
- Intelligent data transformation (arrays, JSON parsing)

---

## Step 2: View & Edit Data

### What to Test:
1. **Click "Continue to Data View"** or navigate to "View & Edit" tab
2. **Test AI-Powered Search:**
   - Try: "Workers with JavaScript skills"
   - Try: "Tasks with duration more than 2 phases"
   - Try: "High priority clients"
   - Try: "Workers available in phase 1"

3. **Test Data Editing:**
   - Click on any cell to edit inline
   - Try editing a worker's skills (comma-separated)
   - Try changing a client's priority level
   - Save changes and observe updates

### What to Observe:
- Natural language search returns filtered results
- Data displays in organized tables with badges for arrays
- Inline editing works smoothly
- Search results update the record counts in tabs
- Clear search button removes filters

### What This Demonstrates:
- AI understands natural language queries
- Real-time data manipulation capabilities
- Intelligent data type handling (arrays, numbers, strings)
- User-friendly data exploration

---

## Step 3: Data Validation

### What to Test:
1. **Navigate to "Validation" tab**
2. **Run Initial Validation:**
   - Click "Run Validation" button
   - Observe the validation summary cards
   - Check different issue categories (Errors, Warnings, Info)

3. **Test AI Corrections:**
   - Click "AI Corrections" button
   - Review suggested corrections in the "AI Suggestions" tab
   - Apply some corrections by clicking "Apply"
   - Dismiss some corrections by clicking "Ignore"

4. **Create Test Errors:**
   - Go back to "View & Edit" tab
   - Edit a client's priority to "10" (invalid range)
   - Edit a worker's skills to empty
   - Return to validation and run again

### What to Observe:
- Comprehensive validation covering multiple data quality aspects
- AI generates intelligent correction suggestions
- Applied corrections automatically update the data
- Re-validation shows improved data quality
- Different issue types (errors block progress, warnings are advisory)

### What This Demonstrates:
- Multi-layered data validation (syntax, semantics, business rules)
- AI-powered error detection and correction
- Data quality improvement workflow
- Preparation for downstream processing

---

## Step 4: Business Rules Configuration

### What to Test:
1. **Navigate to "Business Rules" tab**
2. **Test Natural Language Rule Generation:**
   - Enter: "Tasks T001 and T003 should run together"
   - Click "Generate Rule"
   - Enter: "Limit frontend workers to maximum 2 tasks per phase"
   - Generate another rule

3. **Test AI Recommendations:**
   - Click "AI Recommendations" button
   - Review system-generated suggestions
   - Accept some recommendations
   - Dismiss others

4. **Test Rule Management:**
   - Toggle rules on/off using switches
   - Review rule configurations (JSON format)
   - Delete a rule using the trash icon
   - Export rules configuration

### What to Observe:
- Natural language converts to structured rule configurations
- AI analyzes data patterns to suggest relevant rules
- Rules can be enabled/disabled without deletion
- JSON configurations show the technical implementation
- Export creates downloadable rule files

### What This Demonstrates:
- AI transforms business language into technical constraints
- Pattern recognition identifies optimization opportunities
- Flexible rule management for different scenarios
- Integration-ready rule configurations

---

## Step 5: Priority & Weights Configuration

### What to Test:
1. **Navigate to "Priorities" tab**
2. **Test Preset Configurations:**
   - Click on "Maximize Fulfillment" preset
   - Observe weight changes in the visualization
   - Try "Fair Distribution" preset
   - Try "Skill Optimization" preset

3. **Test Custom Weight Adjustment:**
   - Manually adjust "Priority Level Weight" slider
   - Observe automatic normalization (weights sum to 100%)
   - Adjust multiple weights and see real-time updates
   - Reset to default weights

4. **Analyze Weight Distribution:**
   - Review the visual weight bars
   - Understand how different strategies affect allocation priorities

### What to Observe:
- Preset strategies reflect different business priorities
- Sliders provide fine-grained control
- Automatic normalization ensures valid configurations
- Visual feedback shows weight distribution clearly
- Different strategies suit different organizational needs

### What This Demonstrates:
- Configurable optimization strategies
- Balance between simplicity (presets) and flexibility (custom)
- Mathematical constraints handled automatically
- Visual representation aids decision-making

---

## Step 6: Export Configuration

### What to Test:
1. **Navigate to "Export" tab**
2. **Review Export Summary:**
   - Check data statistics (clients, workers, tasks counts)
   - Review active rules count
   - Observe export readiness indicators

3. **Configure Export Options:**
   - Select/deselect different file types
   - Observe file count updates
   - Review file naming conventions (with timestamps)

4. **Perform Export:**
   - Click "Export All" button
   - Check downloaded files
   - Open CSV files to see cleaned data
   - Open JSON files to see configurations

### What to Observe:
- Export summary provides project overview
- Flexible export options for different use cases
- Timestamped files for version control
- Clean, production-ready data formats
- Structured configuration files

### What This Demonstrates:
- End-to-end data transformation pipeline
- Production deployment readiness
- Integration with external systems
- Audit trail and version management

---

## Advanced Testing Scenarios

### Test Error Handling:
1. Upload invalid files (wrong format, corrupted data)
2. Create circular references in task dependencies
3. Set impossible constraints (more load than capacity)
4. Test with empty datasets

### Test Edge Cases:
1. Very large datasets (if available)
2. Special characters in names/descriptions
3. Extreme priority values
4. Complex skill combinations

### Test Integration Scenarios:
1. Export and re-import configurations
2. Test with different data structures
3. Validate exported files in external tools

---

## Understanding the Business Value

After completing all tests, you should understand:

1. **Data Quality Improvement**: Raw spreadsheets → Clean, validated datasets
2. **Business Rule Translation**: Natural language → Technical constraints
3. **Optimization Configuration**: Business priorities → Mathematical weights
4. **Production Readiness**: Messy data → Deployment-ready configurations

## Real-World Applications

This system would be used by:
- **Project Managers**: Optimizing team assignments
- **Resource Planners**: Balancing workloads across teams
- **Operations Teams**: Implementing business constraints
- **Data Engineers**: Preparing data for allocation algorithms

The exported configurations feed into scheduling systems, project management tools, or custom resource allocation engines to make optimal task-worker assignments automatically.