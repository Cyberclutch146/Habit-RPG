# ⚡ HABIT TRACKER RPG

### *A Real-Life Progression Engine*

![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge\&logo=react)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange?style=for-the-badge\&logo=firebase)
![Status](https://img.shields.io/badge/Status-In%20Development-purple?style=for-the-badge)
![Build](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge\&logo=vite)
![Style](https://img.shields.io/badge/UI-TailwindCSS-38B2AC?style=for-the-badge\&logo=tailwind-css)

---

## 🧠 What This Actually Is

Most habit trackers log actions.
This system builds **identity through progression**.

Habit Tracker RPG converts:

```
Action → XP  
Consistency → Multipliers  
Discipline → Levels  
Execution → Boss Wins
```

This is not productivity.
This is **behavior engineering**.

---

## ⚔️ Core Systems

### 🧩 Quest Engine

Every habit is a structured quest with deterministic rewards.

```ts
type Quest = {
  id: string
  title: string
  xp: number
  frequency: "daily" | "weekly"
  streak: number
  lastCompleted: timestamp
}
```

---

### ⚡ XP Curve (Non-Linear Progression)

```ts
XP Required = 50 * level^1.5
```

* Early game → fast feedback loop
* Mid game → resistance
* Late game → discipline barrier

---

### 🔥 Streak Multiplier

```ts
XP Gain = Base XP × (1 + streak * 0.1)
```

Break streak → multiplier resets.

> System enforces consistency over bursts.

---

### 🐉 Weekly Boss System

Boss = Aggregated constraint system.

Example:

* 5 workouts
* 70k weekly steps
* Diet adherence

**Win:** XP spike + progression boost
**Fail:** No bonus, no dopamine

---

## 🏗️ Architecture

```
Frontend  → React + Vite + Tailwind
State     → Zustand
Backend   → Firebase Auth + Firestore
Logic     → Client-side deterministic systems
```

### Data Flow

```
User Action → Quest Completion → XP Engine → Level Update → UI Sync
```

---

## 📂 Project Structure

```
src/
├── components/     # UI primitives (cards, HUD, progress bars)
├── features/       # Domain modules (quests, xp, bosses)
├── services/       # Firebase + business logic abstraction
├── store/          # Zustand global state
├── utils/          # Pure logic functions
└── App.tsx
```

---

## ⚙️ Setup

```bash
git clone https://github.com/Cyberclutch146/habit-tracker-rpg.git
cd habit-tracker-rpg
npm install
npm run dev
```

---

## 🔐 Environment Variables

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 📊 System Philosophy

* Systems > Motivation
* Consistency > Intensity
* Identity > Goals

You are not tracking habits.
You are **building a character**.

---

## 🚧 Current Status

```
✔ UI Prototype
✔ System Design
⬜ Quest Creation Flow
⬜ XP Engine Integration
⬜ Boss Mechanics
⬜ Real-time Sync
```

---

## 🔮 Expansion Layer

* AI-driven difficulty scaling
* Guilds + social accountability
* Wearable integration (steps, health)
* Anti-cheat validation layer
* Native mobile build

---

## 🧬 Why This Exists

Because discipline without feedback dies.

This system ensures:

* visible growth
* measurable effort
* addictive consistency loop

---

## 👤 Author

**Swagata Ganguly**

* GitHub → https://github.com/Cyberclutch146
* LinkedIn → https://www.linkedin.com/in/swagata-ganguly-453aa6327

---

## 🧩 Final Line

> You don’t rise to your goals.
> You fall to your systems.

**This is the system.**
