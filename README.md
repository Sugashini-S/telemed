# 🏥 TN Govt. Clinic Booker — Telemedicine Appointment System

> Bringing healthcare closer to villages across Tamil Nadu

[![Live Demo](https://img.shields.io/badge/Live%20Demo-telemed--rose.vercel.app-green?style=for-the-badge)](https://telemed-rose.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

---

## 🌍 Problem Statement

Rural communities in Tamil Nadu face a critical healthcare gap — **limited access to qualified doctors**, long travel distances to clinics, and language barriers that make digital health tools unusable for most villagers.

Patients in remote areas often skip medical consultations entirely because:
- The nearest specialist is hours away
- No easy way to know which doctor is available
- Existing telemedicine platforms are in English only

---

## 💡 Our Solution

**TN Govt Clinic Booker** is a telemedicine appointment booking platform built specifically for Tamil Nadu's rural population. It connects patients with PHC (Primary Health Centre) doctors and specialists through a simple, bilingual interface.

---

## ✨ Features

### 👤 For Patients
- Register and login securely
- Browse doctors by specialization
- Book telemedicine appointments instantly
- View upcoming and past appointments on personal dashboard
- Full **Tamil language support** (தமிழ்) for rural accessibility

### 👨‍⚕️ For Doctors
- Doctor registration with specialization profile
- Manage availability and time slots
- View patient appointment requests
- Approval system to ensure only verified doctors are listed

### 🔐 For Admins
- Dedicated admin panel at `/admin`
- Dashboard with live stats — total patients, doctors, appointments
- Approve or reject doctor registrations
- Manage all patients and doctors (edit, delete)
- Visual appointment calendar
- Appointments per week bar chart
- Export patient/doctor data as CSV
- Activity log tracking all system events
- Specialization-wise doctor breakdown

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel |
| Charts | Recharts |

---

## 🗄️ Database Schema

```
users           — id, name, email, phone, role (patient/doctor/admin)
doctors         — id, user_id, specialization, is_approved
appointments    — id, patient_id, doctor_id, slot_id, status
time_slots      — id, doctor_id, date, start_time, end_time, is_booked
```

---

## 🚀 Getting Started Locally

```bash
# Clone the repo
git clone https://github.com/Sugashini-S/telemed.git
cd telemed

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 👩‍💻 Team

Built with ❤️ for **INNOVATE-TN Hackathon** by **Sugashini S**

---

## 📸 Screenshots

> _Add screenshots of your home page, booking flow, and admin panel here_

---

## 📄 License

MIT License — feel free to use and build on this project.