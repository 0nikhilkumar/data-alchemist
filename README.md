# Data Alchemist 🧪✨

**AI-Powered Resource Allocation Platform**

Transform messy spreadsheets into intelligent resource allocation configurations with AI-powered data processing, validation, and rule generation.

![Data Alchemist](https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## 🌟 Overview

Data Alchemist is a sophisticated web application that helps organizations optimize their resource allocation by transforming raw spreadsheet data into production-ready configurations. Using advanced AI capabilities, it automates data cleaning, validation, and business rule generation for optimal task-worker assignments.

## ✨ Key Features

### 🤖 AI-Powered Data Processing
- **Intelligent Column Mapping**: Automatically detects and maps CSV/XLSX columns to expected data structures
- **Natural Language Search**: Query your data using plain English (e.g., "Workers with JavaScript skills")
- **Smart Data Transformation**: Converts various data formats into standardized structures

### 🔍 Advanced Data Validation
- **Multi-Layer Validation**: Comprehensive checks for data integrity, business rules, and constraints
- **AI Error Detection**: Identifies patterns and anomalies in your data
- **Intelligent Corrections**: Suggests and applies data fixes automatically
- **Real-time Quality Metrics**: Live feedback on data quality improvements

### 📋 Business Rules Engine
- **Natural Language Rule Creation**: Describe rules in plain English, AI converts to technical constraints
- **Pattern Recognition**: AI analyzes your data to recommend optimal business rules
- **Flexible Rule Management**: Enable/disable rules without deletion
- **Export-Ready Configurations**: Generate JSON configurations for production systems

### ⚖️ Priority & Weight Configuration
- **Preset Optimization Strategies**: Choose from predefined allocation approaches
- **Custom Weight Tuning**: Fine-tune allocation criteria with interactive sliders
- **Visual Weight Distribution**: See how your priorities affect allocation decisions
- **Mathematical Validation**: Automatic normalization ensures valid configurations

### 📊 Production-Ready Export
- **Clean Data Export**: Download validated CSV files ready for production
- **Configuration Packages**: Export business rules and priority settings
- **Validation Reports**: Comprehensive data quality documentation
- **Timestamped Versions**: Maintain audit trails and version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0nikhilkumar/data-alchemist.git
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Sample Data
The project includes sample CSV files in the `samples/` directory:
- `clients.csv` - Client information with priorities and task requests
- `workers.csv` - Worker skills, availability, and capacity
- `tasks.csv` - Task requirements, duration, and constraints

## 📖 Usage Guide

### Step 1: Upload Your Data
1. Navigate to the **Upload Data** tab
2. Drag and drop your CSV/XLSX files:
   - **Clients Data**: Client information and priorities
   - **Workers Data**: Worker skills and availability
   - **Tasks Data**: Task requirements and constraints
3. Watch AI automatically map columns and validate structure
4. Review any upload errors and proceed when all files are processed

### Step 2: Explore and Edit Data
1. Go to **View & Edit** tab
2. Use natural language search to filter data:
   - "Workers with JavaScript skills"
   - "High priority clients"
   - "Tasks with duration more than 2 phases"
3. Edit data inline by clicking on any cell
4. Save changes and observe real-time updates

### Step 3: Validate Data Quality
1. Navigate to **Validation** tab
2. Click **Run Validation** to perform comprehensive checks
3. Review validation results in different categories:
   - **Errors**: Critical issues that must be fixed
   - **Warnings**: Potential problems to consider
   - **Info**: Helpful insights about your data
4. Use **AI Corrections** to get intelligent fix suggestions
5. Apply or dismiss corrections as needed

### Step 4: Configure Business Rules
1. Go to **Business Rules** tab
2. Create rules using natural language:
   - "Tasks T001 and T003 should run together"
   - "Limit frontend workers to maximum 2 tasks per phase"
3. Click **AI Recommendations** for system-suggested rules
4. Enable/disable rules using toggles
5. Export rule configurations for production use

### Step 5: Set Optimization Priorities
1. Navigate to **Priorities** tab
2. Choose from preset strategies:
   - **Maximize Fulfillment**: Focus on satisfying client requests
   - **Fair Distribution**: Ensure balanced workloads
   - **Skill Optimization**: Maximize skill-task matching
3. Or create custom weights using sliders
4. Observe visual weight distribution
5. Reset to defaults if needed

### Step 6: Export Production Configurations
1. Go to **Export** tab
2. Review export summary and data statistics
3. Select which files to export:
   - Cleaned data files (CSV)
   - Business rules configuration (JSON)
   - Priority weights configuration (JSON)
   - Validation reports (JSON)
4. Click **Export All** to download files
5. Use exported configurations in your production systems

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 13+ with React 18
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui component library
- **State Management**: Zustand for global state
- **File Processing**: Papa Parse (CSV) + SheetJS (XLSX)
- **Icons**: Lucide React
- **Animations**: Custom CSS animations with Tailwind

### Key Components
- **DataUpload**: Handles file upload and AI column mapping
- **DataViewer**: Interactive data exploration with natural language search
- **ValidationPanel**: Comprehensive data validation and AI corrections
- **RuleBuilder**: Natural language business rule creation
- **PrioritySettings**: Optimization strategy configuration
- **ExportPanel**: Production-ready file export

### AI Engine Features
- Natural language query processing
- Intelligent column mapping
- Pattern recognition for business rules
- Data quality analysis and corrections
- Semantic search capabilities

## 🎯 Use Cases

### Project Management
- Optimize team assignments based on skills and availability
- Balance workloads across project phases
- Ensure high-priority clients get appropriate attention

### Resource Planning
- Allocate workers to tasks efficiently
- Manage capacity constraints across time periods
- Implement business rules for operational requirements

### Operations Management
- Transform manual allocation processes into automated systems
- Maintain data quality standards
- Generate audit trails for allocation decisions

### Data Engineering
- Clean and validate resource allocation data
- Prepare datasets for downstream processing
- Generate configuration files for allocation algorithms

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Customization
- Modify validation rules in `lib/validators.ts`
- Extend AI engine capabilities in `lib/ai-engine.ts`
- Add new file processors in `lib/file-processor.ts`
- Customize UI themes in `app/globals.css`

## 📁 Project Structure

```
data-alchemist/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and animations
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main application page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── DataUpload.tsx    # File upload component
│   ├── DataViewer.tsx    # Data exploration component
│   ├── ValidationPanel.tsx # Data validation component
│   ├── RuleBuilder.tsx   # Business rules component
│   ├── PrioritySettings.tsx # Priority configuration
│   ├── ExportPanel.tsx   # Export functionality
│   └── Header.tsx        # Application header
├── lib/                  # Core libraries
│   ├── ai-engine.ts      # AI processing logic
│   ├── file-processor.ts # File parsing and mapping
│   ├── validators.ts     # Data validation rules
│   ├── store.ts          # Global state management
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Utility functions
├── samples/              # Sample data files
│   ├── clients.csv
│   ├── workers.csv
│   └── tasks.csv
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:
1. Check the [Testing Guide](TESTING.md) for detailed usage instructions
2. Review sample data files for expected formats
3. Open an issue for bugs or feature requests

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Transform your data. Optimize your resources. Achieve your goals.** ✨