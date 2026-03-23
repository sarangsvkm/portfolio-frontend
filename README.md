# Portfolio Frontend

A professional portfolio frontend built with React, TypeScript, Vite, and Tailwind CSS, paired with a Spring Boot backend. The application includes a public-facing portfolio experience and an admin CMS for managing profile content, experience, education, skills, and projects.

## Overview

This project is designed as a portfolio management interface with two primary surfaces:

- Public portfolio pages for showcasing professional information
- Admin CMS pages for updating portfolio content through backend APIs

The frontend is integrated with a backend API collection that exposes:

- authentication endpoints
- profile and asset management
- full resume retrieval
- standalone content endpoints for experience, education, skills, and projects
- contact reporting and system configuration

## Features

- Public portfolio landing page with profile, skills, projects, experience, and education sections
- Admin dashboard with section-based content management
- Separate editors for:
  - Profile
  - Experience
  - Education
  - Skills
  - Projects
- Styled centered success/error popup dialogs for admin actions
- Profile asset handling for image, banner, and resume URLs
- API-ready service layer using Axios
- Vite proxy configuration for local backend development

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- React Router
- Axios
- Framer Motion
- Lucide React

## Project Structure

```text
src/
  layouts/
    PublicLayout.tsx
    AdminLayout.tsx
  pages/
    public/
      Home.tsx
    admin/
      Dashboard.tsx
      Login.tsx
      ProfileEditor.tsx
      ExperienceEditor.tsx
      EducationEditor.tsx
      SkillsEditor.tsx
      ProjectsEditor.tsx
  services/
    api.ts
    authService.ts
    resumeService.ts
    contactService.ts
    configService.ts
  types/
    index.ts
  utils/
    resume.ts
  hooks/
    useStatusDialog.tsx
```

## Routing

The application is split into public and admin routes:

- `/` : Public portfolio
- `/admin/login` : Admin authentication
- `/admin` : Admin dashboard
- `/admin/profile` : Profile editor
- `/admin/experience` : Experience editor
- `/admin/education` : Education editor
- `/admin/skills` : Skills editor
- `/admin/projects` : Projects editor

## API Integration

The frontend is aligned with the included Postman collection:

- `src/portfolio-api-postman-collection.json`

Primary API groups:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/profile`
- `PUT /api/profile/{id}`
- `POST /api/profile/image/{id}`
- `GET /api/resume`
- `GET /api/experience`
- `GET /api/education`
- `GET /api/skills`
- `GET /api/projects`
- `GET /api/contact/report`
- `GET /api/config`

Current implementation uses:

- `GET /api/resume` for public portfolio rendering
- section-based APIs for admin management of experience, education, skills, and projects
- profile APIs for profile and asset updates

## Environment Configuration

Create or update `.env` with:

```env
VITE_API_BASE_URL=/portfolioApi
```

This works with the Vite development proxy configured in `vite.config.ts`:

- `/portfolioApi` -> `http://localhost:8080`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Start the backend

Run the Spring Boot backend separately on:

```text
http://localhost:8080
```

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Runs TypeScript build checks and creates a production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint for the project.

## Admin Workflow

1. Log in through `/admin/login`
2. Open the relevant content editor
3. Update the form fields
4. Save changes through the connected backend endpoint
5. Use the live preview action from the admin layout to verify the public portfolio

## Current Notes

- Public content gracefully falls back to local sample data when the backend is unavailable
- Admin save actions rely on valid backend credentials
- Section editors are implemented with separate service methods for each content type
- Styled modal dialogs are used for save and error feedback instead of browser alerts

## Known Considerations

- Full production build may depend on the local Windows/Tailwind native module environment
- If backend endpoints reject save requests, verify:
  - backend credentials
  - expected POST/PUT request body shape
  - proxy configuration
  - CORS or authentication rules on the backend

## Repository

GitHub repository:

```text
https://github.com/sarangsvkm/portfolio-frontend
```

## License

This project is intended for personal portfolio and professional demonstration use unless otherwise specified.
