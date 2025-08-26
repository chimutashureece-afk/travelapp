# Olori Animate

A cross-platform desktop application for AI-powered animation generation using Stable Diffusion, AnimateDiff, and ControlNet.

## 🎬 Features

- **AI-Powered Animation**: Generate high-quality animations from text prompts
- **Multiple AI Models**: Support for Stable Video Diffusion, AnimateDiff, and more
- **Real-time Preview**: Live preview of animations as they generate
- **Project Management**: Organize and manage your animation projects
- **Cross-Platform**: Runs on Windows, macOS, and Linux
- **Modern UI**: Beautiful, responsive interface built with React and TailwindCSS

## 🏗️ Architecture

```
olori-animate/
├── frontend/          # React + TypeScript UI
├── backend/           # Node.js + Express API
├── ai_engine/         # Python AI processing
├── assets/            # Static assets
├── exports/           # Generated animations
├── main.js           # Electron main process
└── preload.js        # Electron security layer
```

## 🚀 Tech Stack

### Frontend
- **Electron** - Desktop app framework
- **React** - UI library with TypeScript
- **TailwindCSS** - Utility-first CSS framework
- **WebSockets** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **WebSocket Server** - Real-time updates

### AI Engine
- **Python 3.8+** - AI processing
- **PyTorch** - Deep learning framework
- **Diffusers** - Hugging Face diffusion models
- **Transformers** - NLP models
- **ControlNet** - Additional model control

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ with pip
- **Git** for version control
- **4GB+ RAM** (8GB+ recommended)
- **NVIDIA GPU** (optional, but recommended for faster generation)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd olori-animate
```

### 2. Install Dependencies
```bash
# Install main dependencies
npm install

# This will automatically install frontend and backend dependencies
```

### 3. Set Up Python Environment
```bash
# Create virtual environment (recommended)
python3 -m venv ai_env
source ai_env/bin/activate  # On Windows: ai_env\Scripts\activate

# Install Python dependencies
cd ai_engine
pip install -r requirements.txt
cd ..
```

### 4. Configure Environment
```bash
# Copy environment template
cp .env.example .env
cp backend/.env.example backend/.env

# Edit .env files as needed
```

## 🎮 Usage

### Development Mode
```bash
# Start all services in development mode
npm run dev

# Or start services individually:
npm run dev:frontend    # React dev server (port 3000)
npm run dev:backend     # Express API server (port 3001)
```

### Production Build
```bash
# Build all components
npm run build

# Create distributable packages
npm run dist              # All platforms
npm run dist:win         # Windows only
npm run dist:mac         # macOS only  
npm run dist:linux       # Linux only
```

### Individual Services
```bash
# Frontend only
cd frontend && npm start

# Backend only
cd backend && npm run dev

# Python AI engine test
cd ai_engine && python3 bridge.py
```

## 🎨 User Interface

### Main Features
- **Prompt Input**: Describe your animation in natural language
- **Style Selection**: Choose from various artistic styles
- **Quality Settings**: Adjust resolution, duration, and quality
- **Real-time Preview**: Watch your animation generate live
- **Project Gallery**: Browse and manage your creations

### Keyboard Shortcuts
- `Ctrl+N` - New project
- `Ctrl+S` - Save project
- `Ctrl+E` - Export animation
- `F11` - Toggle fullscreen

## 🤖 AI Models

### Stable Video Diffusion
- High-quality video generation from images
- Best for: Photorealistic animations

### AnimateDiff
- Animate static images with smooth motion
- Best for: Character animations, object movement

### Text-to-Video
- Generate videos directly from text prompts
- Best for: Creative storytelling, concept art

### ControlNet (Coming Soon)
- Additional control over generation process
- Best for: Precise animation control

## 📁 Project Structure

```
olori-animate/
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utilities
│   │   └── App.tsx       # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── types/        # TypeScript types
│   │   └── server.ts     # Main server file
│   ├── package.json
│   └── tsconfig.json
├── ai_engine/
│   ├── generators/       # AI model wrappers
│   ├── utils/           # Python utilities
│   ├── models/          # Downloaded models
│   ├── bridge.py        # Node.js communication
│   └── requirements.txt
├── assets/              # Icons, images
├── exports/             # Generated videos
├── main.js             # Electron main process
├── preload.js          # Electron preload script
└── package.json        # Main package.json
```

## 🔧 Configuration

### Environment Variables

#### Main Application
- `NODE_ENV` - development/production
- `AI_ENGINE_PATH` - Path to Python AI engine
- `PYTHON_EXECUTABLE` - Python executable path

#### AI Engine
- `CUDA_VISIBLE_DEVICES` - GPU device selection
- `HUGGINGFACE_TOKEN` - For private model access
- `AI_MODELS_PATH` - Model storage location

### GPU Configuration
For NVIDIA GPU acceleration, install CUDA-compatible PyTorch:
```bash
# Example for CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## 🔒 Security

- **Isolated Processes**: Frontend, backend, and AI engine run separately
- **Context Isolation**: Electron security best practices
- **Input Validation**: All user inputs are validated
- **CORS Protection**: Configured for local development

## 🚨 Troubleshooting

### Common Issues

**Python not found**
```bash
# Make sure Python 3.8+ is installed and accessible
python3 --version

# Update PYTHON_EXECUTABLE in .env if needed
```

**GPU not detected**
```bash
# Check CUDA installation
nvidia-smi

# Verify PyTorch GPU support
python3 -c "import torch; print(torch.cuda.is_available())"
```

**Port conflicts**
```bash
# Change ports in .env files
PORT=3001          # Backend
FRONTEND_PORT=3000 # Frontend
```

**Model download fails**
```bash
# Check internet connection and disk space
# Models can be 2-8GB each
```

### Log Files
- Application logs: `logs/app.log`
- AI engine logs: `ai_engine/logs/ai_engine.log`
- Electron logs: Check console in development mode

## 📈 Performance Optimization

### Hardware Requirements
- **Minimum**: 4GB RAM, 10GB storage
- **Recommended**: 16GB RAM, NVIDIA RTX 3060+, 50GB storage
- **Optimal**: 32GB RAM, NVIDIA RTX 4080+, 100GB SSD

### Tips
- Use GPU acceleration when available
- Close other GPU-intensive applications
- Monitor memory usage during generation
- Clean up old exports to save disk space

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup
```bash
# Install development dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Run tests
npm test
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Stability AI for Stable Diffusion models
- Hugging Face for the Diffusers library
- The AnimateDiff team for animation capabilities
- The open-source AI community

## 📞 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Updates**: Follow releases for new features

---

**Built with ❤️ by the Olori Team**
