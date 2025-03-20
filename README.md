# Form Management System

A React-TypeScript application for managing forms, allowing administrators to create, assign, and track form questions, and users to complete assigned questions and view their submissions.

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## Features

- **Admin Panel:**
  - Create, edit, and delete forms with different question types (text, multiple_choice, checkbox)
  - Categorize questions for better organization
  - Assign forms to users
  - View form submission progress
  - Export reports in PDF, Excel, or CSV formats
- **User Panel:**
  - View assigned forms
  - Fill out and submit forms
  - View completed submissions

## Technology Stack

- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS
- **Form Handling:** Formik + Yup for validation
- **Routing:** React Router
