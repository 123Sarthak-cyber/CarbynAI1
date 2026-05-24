AI Maintenance Copilot for Hands-Free Industrial Assistance

An AI-powered multimodal maintenance assistant designed for industrial technicians and field workers.
The system combines computer vision, retrieval-augmented generation (RAG), voice interaction, and real-time reasoning to help workers diagnose equipment issues and receive step-by-step repair guidance without interrupting their workflow.

Built as part of the Carbyn AI Take-Home Assignment.

Live Demo

🚀 Deployed Application:
AI Maintenance Copilot Live Demo

Problem Statement

Industrial technicians often work in high-pressure environments where:

Manuals are difficult to search quickly
Expert support may not be immediately available
Workers need hands-free assistance
Diagnosing faults requires both visual understanding and technical reasoning

This project aims to simulate an AI co-pilot for maintenance technicians using multimodal AI.

The assistant can:

Understand machine images and equipment panels
Accept voice/text queries
Retrieve relevant troubleshooting knowledge
Provide grounded step-by-step repair instructions
Respond conversationally in real time
Features
Multimodal Interaction

Supports:

📷 Image Upload / Vision Understanding
🎤 Voice Input
💬 Text Queries
Computer Vision Understanding

The assistant can analyze:

Industrial equipment
Circuit breakers
Electrical panels
Error codes
Mechanical assemblies
Wiring setups

It identifies relevant components and provides contextual troubleshooting guidance.

Retrieval-Augmented Generation (RAG)

The system retrieves relevant information from:

SOP documents
Equipment manuals
Troubleshooting guides
Technical PDFs

This enables:

Grounded responses
Reduced hallucinations
Context-aware troubleshooting
Step-by-Step Repair Guidance

Instead of generic chatbot responses, the assistant generates:

Diagnostic workflows
Safety procedures
Sequential repair instructions
Troubleshooting checklists

Example:

“Check input voltage → inspect breaker state → test continuity → isolate overload source.”

Real-Time AI Assistant Workflow
User Input (Voice/Image/Text)
            ↓
 Vision + Speech Processing
            ↓
    Context Understanding
            ↓
   Knowledge Retrieval (RAG)
            ↓
     LLM Reasoning Engine
            ↓
 Step-by-Step Guidance Output
System Architecture
 ┌─────────────────────────────┐
 │        Frontend UI          │
 │  Streamlit / Web Interface  │
 └──────────────┬──────────────┘
                │
                ▼
 ┌─────────────────────────────┐
 │        FastAPI Backend      │
 │ REST APIs + Session Logic   │
 └──────────────┬──────────────┘
                │
      ┌─────────┴─────────┐
      ▼                   ▼

┌──────────────┐   ┌─────────────────┐
│ Vision Model │   │ Voice Pipeline  │
│ Image Reason │   │ STT / TTS       │
└──────┬───────┘   └────────┬────────┘
       │                    │
       └────────┬───────────┘
                ▼

      ┌─────────────────────┐
      │   RAG Knowledge DB  │
      │ PDFs + Embeddings   │
      └─────────┬───────────┘
                ▼

      ┌─────────────────────┐
      │   LLM Reasoning     │
      │ Troubleshooting AI  │
      └─────────┬───────────┘
                ▼

      ┌─────────────────────┐
      │ Step-by-Step Output │
      └─────────────────────┘
Tech Stack
Layer	Technology
Frontend	Streamlit / Web UI
Backend	FastAPI
Vision AI	Gemini Vision / OpenAI Vision
LLM	GPT-4o / Gemini
RAG	FAISS / ChromaDB
Embeddings	Sentence Transformers
Speech-to-Text	Whisper
Text-to-Speech	gTTS / TTS Engine
Deployment	Google Cloud Run
Language	Python
Why RAG Instead of Fine-Tuning?

Industrial manuals and SOPs change frequently.

Using RAG allows:

Real-time document updates
Lower operational cost
Faster iteration
Grounded technical responses
Better maintainability

This architecture also reduces hallucination risk compared to pure LLM prompting.

Key Engineering Decisions
Modular Architecture

The system is separated into:

UI Layer
API Layer
AI Reasoning Layer
Retrieval Layer
Voice Layer

This makes the platform extensible and production-friendly.

Low-Latency Design

The assistant prioritizes:

Fast retrieval
Lightweight inference
Efficient document chunking
Minimal response delay

This is important for real-time technician workflows.

Safety-Oriented Responses

The assistant emphasizes:

Diagnostic verification
Sequential troubleshooting
Clear procedural instructions
Reduced ambiguity in repair steps
Example Use Cases
Electrical Panel Diagnosis

User uploads an image of a faulty breaker and asks:

“Why is this breaker tripping?”

The assistant:

Identifies the component
Retrieves relevant troubleshooting data
Suggests diagnostic checks
Provides repair guidance
Wiring Inspection

User shows a wiring setup and asks:

“Is this connected correctly?”

The assistant analyzes:

Wiring arrangement
Safety concerns
Potential faults
Recommended fixes
Error Code Troubleshooting

User uploads a machine panel with an error code.

The assistant:

Detects the code
Searches manuals
Explains the issue
Suggests corrective action
Challenges Faced
Handling noisy industrial image inputs
Balancing latency vs reasoning quality
Reducing hallucinations in technical workflows
Structuring retrieved context effectively
Maintaining conversational flow during troubleshooting
Future Improvements
Real-time video stream support
Edge deployment on smart glasses
Offline inference capability
Object detection for component localization
Multi-agent troubleshooting workflows
Predictive maintenance analytics
WebSocket-based live interaction
Industrial IoT integration
Repository Structure
├── frontend/
├── backend/
├── rag/
├── vision/
├── voice/
├── data/
├── embeddings/
├── utils/
├── requirements.txt
├── README.md
└── app.py
Installation
Clone the Repository
git clone https://github.com/yourusername/ai-maintenance-copilot.git
cd ai-maintenance-copilot
Create Virtual Environment
python -m venv venv
source venv/bin/activate

Windows:

venv\Scripts\activate
Install Dependencies
pip install -r requirements.txt
Run the Backend
uvicorn app:app --reload
Launch the Frontend
streamlit run frontend.py
Demo Workflow
Upload equipment image
Ask question via voice or text
Assistant analyzes the situation
Relevant manuals are retrieved
AI generates grounded troubleshooting guidance
Technician receives actionable repair steps
Evaluation Alignment

This project focuses on:

End-to-end working system
Real multimodal interaction
Practical industrial use-case
Modular architecture
Retrieval-grounded reasoning
Production-oriented deployment
Author

Sarthak Mazumder
Mechanical Engineering, IIT Kharagpur

License

MIT License
