# CodeMentor AI — Project Flow & Architecture

This document outlines the operational flow and system architecture of the **CodeMentor AI** platform.

## 🚀 Application Flow Infographic

![CodeMentor AI Flow Diagram](https://raw.githubusercontent.com/braintubein-sketch/CodeMentor-AI/main/assets/flow_diagram.png)

---

## 🛠️ Detailed Process Logic

The following diagram breaks down the technical stages of the application, from initial access to data persistence.

```mermaid
graph TD
    %% Node Definitions
    Start([User Launches App]) --> Auth{Auth Status}
    
    Auth -- Guest --> Dash[Workspace Dashboard]
    Auth -- Logged In --> Dash
    
    Dash --> Input[Input Code / Query]
    Input --> API[Request Sent to Backend]
    
    subgraph Backend [Server Processing]
        API --> Logic{Request Logic}
        Logic --> Gemini[Gemini AI Analysis]
        Gemini --> Response[Generate Response]
    end
    
    Response --> Display[Display Results]
    
    Display --> Actions{User Actions}
    Actions --> Edit[Edit/Refine]
    Actions --> Save[Save to History]
    Actions --> Export[Copy/Download]
    
    Save --> DB[(PostgreSQL Database)]
    DB --> End([Process Completed])
    
    Edit --> Input
    Export --> End
    
    %% Styling
    classDef primary fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff
    classDef secondary fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
    classDef database fill:#f59e0b,stroke:#fff,stroke-width:2px,color:#fff
    
    class Start,Dash,Gemini primary
    class Display,Response secondary
    class DB database
```

---

## 🛠️ System Architecture & Data Flow

This diagram illustrates the technical stack and how data securely moves between components.

```mermaid
graph LR
    %% System Flow
    User((User)) <--> FE[Frontend: Next.js/Vercel]
    FE <--> BE[Backend: Node.js/Render]
    
    subgraph Services [Cloud Ecosystem]
        BE <--> AI[AI: Google Gemini API]
        BE <--> DB[(DB: Neon PostgreSQL)]
    end
    
    %% Details
    FE -- "JWT Auth" --> BE
    BE -- "Prisma Client" --> DB
    BE -- "REST/JSON" --> AI
    
    %% Styling
    style FE fill:#000,stroke:#fff,stroke-width:2px,color:#fff
    style BE fill:#333,stroke:#6366f1,stroke-width:2px,color:#fff
    style AI fill:#6366f1,stroke:#fff,stroke-width:2px,color:#fff
    style DB fill:#10b981,stroke:#fff,stroke-width:2px,color:#fff
```

### 🔐 Technical Stack Overview

*   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion.
*   **Backend**: Node.js, Express.js.
*   **AI Model**: Google Gemini Pro & Groq (Llama 3).
*   **ORM/Database**: Prisma ORM with Neon PostgreSQL.
*   **Deployment**: Vercel (Frontend) and Render (Backend).
