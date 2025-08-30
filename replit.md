# Food Lab - Food Allergy and Intolerance Tracking App

## Overview

Food Lab is a comprehensive mobile-first web application designed to help users identify food allergies and intolerances through systematic logging and tracking. The app functions as a personal "food experiment lab" where users log their food intake and symptoms, then receive insights about potential correlations between specific foods and adverse reactions.

The application follows a scientific approach to food sensitivity detection, encouraging users to track their daily food consumption and any symptoms they experience. Through data analysis and pattern recognition, the app provides actionable insights to help users identify problematic foods and make informed dietary decisions.

## Recent Changes

### August 30, 2025
- **Enhanced symptom tracking**: Replaced generic common symptoms with personalized recent symptoms feature - shows user's 5 most recently logged symptoms as clickable quick-select options
- **Improved code organization**: Moved all symptom-related functionality from `food-database.ts` to dedicated `symptom-database.ts` file for better separation of concerns
- **Expanded food database**: Comprehensive 500+ food database includes specific varieties, brands, and user-requested items like cranberries
- **Database cleanup**: Removed singular/plural duplicates throughout food database for improved UX (cranberry→cranberries, walnut→walnuts, etc.)
- **Working features verified**: Frontend-backend integration confirmed working correctly for frequent foods display and symptom logging

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built as a modern React single-page application using TypeScript and Vite for development tooling. The architecture follows a component-based design with:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with a custom design system featuring lab-themed colors and components
- **Component Library**: Radix UI primitives with shadcn/ui components for consistent, accessible UI elements
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation

### Backend Architecture
The server follows a Node.js/Express.js REST API pattern with:

- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints following conventional HTTP methods
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development**: Hot reloading with Vite middleware integration in development mode

### Data Storage Solutions
The application uses a flexible storage abstraction pattern:

- **Database**: PostgreSQL as the primary database
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Database Provider**: Neon serverless PostgreSQL for cloud hosting
- **Development Storage**: In-memory storage implementation for development and testing
- **Schema**: Strongly typed database schema with Zod validation

### Database Schema Design
The data model centers around four main entities:

1. **Food Entries**: Records of consumed foods with timestamps and categorization
2. **Symptom Entries**: Logged symptoms with severity ratings and optional notes
3. **Correlations**: Calculated relationships between foods and symptoms with confidence scores
4. **User Stats**: Tracking metrics like streaks, achievement progress, and usage statistics

### Authentication and Authorization
Currently implements a simplified authentication model suitable for single-user scenarios. The architecture supports future expansion to multi-user authentication systems.

### API Structure
The REST API provides endpoints for:

- **Food Management**: CRUD operations for food entries, frequent foods lookup, and date-based filtering
- **Symptom Tracking**: Creating and retrieving symptom entries with severity tracking
- **Analytics**: Correlation analysis and timeline data aggregation
- **User Progress**: Statistics tracking and achievement system

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database connectivity
- **drizzle-orm** and **drizzle-kit**: Type-safe ORM with migration support
- **express**: Web application framework for the REST API
- **zod**: Schema validation library ensuring data integrity

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching solution
- **wouter**: Lightweight routing library for navigation
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for styling
- **date-fns**: Date manipulation and formatting utilities

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **@replit/vite-plugin-***: Replit-specific development enhancements
- **esbuild**: Fast JavaScript bundler for production builds

### UI and Design System
- **class-variance-authority** and **clsx**: Utility libraries for conditional CSS classes
- **tailwind-merge**: Intelligent Tailwind CSS class merging
- **lucide-react**: Comprehensive icon library with React components

The application leverages modern web development practices with a focus on type safety, developer experience, and maintainable code architecture. The modular design supports easy extension and modification of features while maintaining code quality and performance.