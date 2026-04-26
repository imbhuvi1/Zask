# Angular Frontend for Zask - Task Management System

## Project Overview
Create a modern Angular frontend application for Zask, a Trello-like task management system with microservices architecture.

## Backend Architecture
The system uses the following microservices (all in development):
- **API Gateway**: `http://localhost:8080` - Routes all requests
- **Eureka Server**: `http://localhost:8761` - Service discovery
- **Auth Service**: `/api/v1/auth/**` - Authentication & authorization
- **Workspace Service**: `/api/v1/workspaces/**` - Workspace management
- **Board Service**: `/api/v1/boards/**` - Board operations
- **List Service**: `/api/v1/lists/**` - List management within boards
- **Card Service**: `/api/v1/cards/**` - Task card operations
- **Comment Service**: `/api/v1/comments/**` - Card comments
- **Label Service**: `/api/v1/labels/**` - Card labeling system
- **Notification Service**: `/api/v1/notifications/**` - Real-time notifications

## Frontend Requirements

### Core Features
1. **Authentication System**
   - Login/Register forms
   - JWT token management
   - Route guards for protected pages
   - User profile management

2. **Workspace Management**
   - Create/edit/delete workspaces
   - Workspace member management
   - Workspace dashboard

3. **Board Interface**
   - Kanban-style board view
   - Drag-and-drop functionality for cards
   - Board creation/editing
   - Board sharing and permissions

4. **List Management**
   - Create/edit/delete lists within boards
   - Reorder lists
   - List-specific settings

5. **Card Operations**
   - Create/edit/delete cards
   - Card details modal
   - Due dates and priorities
   - Card assignments
   - Drag-and-drop between lists

6. **Comments System**
   - Add/edit/delete comments on cards
   - Real-time comment updates
   - Comment threading

7. **Label System**
   - Create/manage labels
   - Apply/remove labels from cards
   - Color-coded label system

8. **Notifications**
   - Real-time notification system
   - Notification history
   - Notification preferences

### Technical Stack
- **Framework**: Angular 17+ with standalone components
- **Styling**: Angular Material + Custom CSS/SCSS
- **State Management**: NgRx (for complex state) or Angular services
- **HTTP Client**: Angular HttpClient with interceptors
- **Drag & Drop**: Angular CDK Drag Drop
- **Real-time**: WebSocket or Server-Sent Events
- **Forms**: Reactive Forms
- **Routing**: Angular Router with guards

### Project Structure
```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/
│   │   └── models/
│   ├── shared/
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/
│   │   ├── auth/
│   │   ├── workspace/
│   │   ├── board/
│   │   ├── card/
│   │   └── profile/
│   └── layout/
├── assets/
└── environments/
```

### API Integration
- Base URL: `http://localhost:8080`
- All requests go through API Gateway
- Implement JWT token interceptor
- Error handling for all HTTP requests
- Loading states for async operations

### UI/UX Requirements
- Responsive design (mobile-first)
- Modern, clean interface similar to Trello
- Smooth animations and transitions
- Accessibility compliance (WCAG 2.1)
- Dark/light theme support
- Intuitive drag-and-drop interactions

### Key Components to Implement
1. **AuthComponent** - Login/register forms
2. **DashboardComponent** - Main workspace overview
3. **BoardComponent** - Kanban board view
4. **CardComponent** - Individual task cards
5. **CardDetailComponent** - Card detail modal
6. **CommentComponent** - Comment system
7. **LabelComponent** - Label management
8. **NotificationComponent** - Notification center
9. **UserProfileComponent** - User settings

### Services to Create
1. **AuthService** - Authentication logic
2. **WorkspaceService** - Workspace operations
3. **BoardService** - Board management
4. **CardService** - Card operations
5. **CommentService** - Comment handling
6. **LabelService** - Label management
7. **NotificationService** - Real-time notifications
8. **WebSocketService** - Real-time communication

### Additional Features
- Offline support with service workers
- Progressive Web App (PWA) capabilities
- Export board data functionality
- Search and filter capabilities
- Keyboard shortcuts
- Activity timeline
- File attachments (if supported by backend)

### Development Guidelines
- Use TypeScript strict mode
- Implement proper error handling
- Add loading spinners for async operations
- Use OnPush change detection strategy
- Implement proper memory management
- Add comprehensive unit tests
- Follow Angular style guide
- Use environment variables for configuration

### Deployment Considerations
- Build for production with optimization
- Configure proxy for development
- Set up Docker containerization
- Implement CI/CD pipeline
- Configure CORS properly with backend

Generate a complete Angular application following these specifications, ensuring seamless integration with the existing microservices backend.