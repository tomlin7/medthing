<div align="center">
  <img src="https://github.com/user-attachments/assets/01cc5ec8-06f7-4d55-8f65-c4a547e007c6" width=200/>
  <h1>MedThing</h1>
  <h3>Modern Healthcare Management Platform </h3>
</div><br>

MedThing is a comprehensive healthcare management platform designed to streamline patient care, medical reporting, and health analytics. Built with modern web technologies, it offers an intuitive interface for healthcare professionals to manage patient data and generate AI-powered medical reports.

## Features

- **📊 Patient Dashboard** - Comprehensive view of patient data with health trends
- **📝 AI-Generated Reports** - Intelligent medical reports based on patient data
- **💊 Medication Management** - Track prescriptions, dosages, and schedules
- **📅 Appointment Scheduling** - Organize and manage patient consultations
- **📈 Health Metrics** - Monitor vital signs and health trends over time
- **🔒 Secure Authentication** - Protect sensitive medical data

## Quick Start

### Prerequisites

- Node.js 16+ (for frontend)
- Go 1.18+ (for backend)
- SQLite 3.x (for database)

### Frontend Setup

```bash
bun install 
bun run dev
```

### Backend Setup

```bash
cd server
# Configure environment (copy example .env file)
cp .env.example .env
go run main.go
```

## 🔧 Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Shadcn/UI
- **Backend:** Go, Fiber, GORM
- **Database:** SQLite
- **AI:** Google Gemini API for report generation
- **Authentication:** JWT with refresh tokens

## AI-Powered Features

MedThing leverages artificial intelligence to:

- Generate comprehensive medical reports
- Analyze health trends and patterns
- Provide treatment recommendations
- Identify potential medication interactions

## Contributing

Contributions are welcome! Check out our [Contributing Guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons provided by [Lucide Icons](https://lucide.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI capabilities powered by [Google Gemini API](https://ai.google.dev/)
