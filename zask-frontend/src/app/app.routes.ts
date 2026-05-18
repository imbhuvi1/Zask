import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    canActivate: [() => import('./core/guards/guest.guard').then(m => m.guestGuard)],
    pathMatch: 'full'
  },
  { 
    path: 'boards/public', 
    loadComponent: () => import('./features/board/public-boards/public-boards.component').then(m => m.PublicBoardsComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [() => import('./core/guards/guest.guard').then(m => m.guestGuard)]
  },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [() => import('./core/guards/guest.guard').then(m => m.guestGuard)]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [() => import('./core/guards/guest.guard').then(m => m.guestGuard)]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [() => import('./core/guards/guest.guard').then(m => m.guestGuard)]
  },
  {
    path: '',
    loadComponent: () => import('./core/components/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
        loadComponent: () => import('./features/workspace/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'user/:id',
        canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
        loadComponent: () => import('./features/profile/user-profile-view/user-profile-view.component').then(m => m.UserProfileViewComponent)
      },
      {
        path: 'workspace/:id',
        canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
        loadComponent: () => import('./features/workspace/workspace-detail.component').then(m => m.WorkspaceDetailComponent)
      },
      {
        path: 'board/:id',
        loadComponent: () => import('./features/board/board.component').then(m => m.BoardComponent)
      },
      {
        path: 'board/:id/members',
        loadComponent: () => import('./features/board/board-members/board-members.component').then(m => m.BoardMembersComponent)
      },
      {
        path: 'notifications',
        canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  {
    path: 'w/:id',
    loadComponent: () => import('./features/workspace/workspace-settings-layout/workspace-settings-layout.component').then(m => m.WorkspaceSettingsLayoutComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard)],
    children: [
      {
        path: 'boards',
        loadComponent: () => import('./features/workspace/workspace-detail.component').then(m => m.WorkspaceDetailComponent)
      },
      {
        path: 'members',
        loadComponent: () => import('./features/workspace/workspace-members/workspace-members.component').then(m => m.WorkspaceMembersComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/workspace/workspace-settings/workspace-settings.component').then(m => m.WorkspaceSettingsComponent)
      }
    ]
  },
  {
    path: 'join/workspace/:id',
    loadComponent: () => import('./features/join/join-page.component').then(m => m.JoinPageComponent)
  },
  {
    path: 'join/board/:id',
    loadComponent: () => import('./features/join/join-page.component').then(m => m.JoinPageComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [() => import('./core/guards/auth.guard').then(m => m.authGuard), () => import('./core/guards/admin.guard').then(m => m.adminGuard)],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'workspaces',
        loadComponent: () => import('./features/admin/admin-workspaces/admin-workspaces.component').then(m => m.AdminWorkspacesComponent)
      },
      {
        path: 'broadcast',
        loadComponent: () => import('./features/admin/admin-broadcast/admin-broadcast.component').then(m => m.AdminBroadcastComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/admin/admin-audit/admin-audit.component').then(m => m.AdminAuditComponent)
      },
      {
        path: 'overdue',
        loadComponent: () => import('./features/admin/admin-overdue/admin-overdue.component').then(m => m.AdminOverdueComponent)
      }
    ]
  }
];
