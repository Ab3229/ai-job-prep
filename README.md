# 🚀 GenAI Job Preparation Platform

A production-ready **Full Stack Generative AI Job Preparation Platform** that helps users prepare for interviews using AI-powered resume analysis, job description analysis, skill-gap detection, interview question generation, and ATS-optimized resume generation.

## ✨ Features

* 🔐 User Authentication with JWT
* 📄 Resume Upload and Processing
* 🤖 AI-Powered Resume Analysis
* 💼 Job Description Analysis
* 🎯 Skill Gap Detection
* 🧠 AI-Generated Interview Questions
* 📊 Resume and Job Matching
* 📝 ATS-Optimized Resume Generation
* 👤 User Profile Management
* 🔒 Secure Backend APIs
* 📱 Responsive Frontend UI

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* REST APIs

### Generative AI

* Google Gemini AI
* AI-powered resume analysis
* Job description analysis
* Interview preparation
* Resume optimization

## 📁 Project Structure

```text
GENAI/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

⚠️ **Never commit your `.env` file to GitHub.**

Make sure `.env` is included in `.gitignore`.

## ▶️ Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

The backend will normally run on:

```text
http://localhost:5000
```

## 🔄 Application Workflow

```text
User
  ↓
Register / Login
  ↓
Upload Resume
  ↓
AI Resume Analysis
  ↓
Enter Job Description
  ↓
Job Analysis
  ↓
Skill Gap Detection
  ↓
Generate Interview Questions
  ↓
Prepare for Interview
  ↓
Generate ATS-Optimized Resume
```

## 🎯 Use Cases

This platform can help students and job seekers:

* Understand their resume strengths and weaknesses
* Identify missing skills for a target job
* Prepare personalized interview questions
* Improve their resume for ATS systems
* Compare their resume against job descriptions
* Build a structured interview preparation strategy

## 🔮 Future Improvements

* 🎤 AI-powered mock interviews
* 🗣️ Voice-based interview practice
* 📈 Interview performance analytics
* 🔗 LinkedIn profile analysis
* 📚 Personalized learning roadmap
* 📊 Advanced ATS scoring
* ☁️ Cloud-based resume storage
* 📧 Job application tracking

## 👨‍💻 Author

**Abhishek Agrawal**

Computer Science Engineering Student
MBM University, Jodhpur

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.

---

### 📜 License

This project is created for educational and portfolio purposes.
