import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../../core/services/export.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-[#172b4d] mb-1">Platform Control Center</h1>
        <p class="text-gray-500">Global health and performance monitoring for Zask.</p>
      </div>
      <div class="flex items-center gap-3">
        <button mat-stroked-button class="!border-gray-300 !bg-white" (click)="exportPlatformReport()">
          <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">cloud_download</mat-icon> Platform Export
        </button>
        <button mat-flat-button color="primary" routerLink="/admin/broadcast">
          <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">campaign</mat-icon> New Broadcast
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div *ngFor="let stat of kpis" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
        <div class="flex items-center justify-between mb-4">
          <div [class]="'w-10 h-10 rounded-xl flex items-center justify-center ' + stat.bg">
            <mat-icon [class]="stat.textClass" class="!text-[20px] !w-5 !h-5">{{ stat.icon }}</mat-icon>
          </div>
          <span class="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+{{ stat.trend }}%</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ stat.label }}</span>
          <span class="text-2xl font-bold text-[#172b4d] mt-1">{{ stat.value() }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- SLA Monitoring (Overdue Cards) -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div class="flex items-center gap-2">
            <mat-icon class="text-red-500">priority_high</mat-icon>
            <h3 class="text-lg font-bold text-[#172b4d]">SLA Violations (Overdue Cards)</h3>
          </div>
          <button mat-button color="primary" class="!text-xs" routerLink="/admin/overdue">View All</button>
        </div>
        <div class="flex-1 p-0 overflow-y-auto max-h-[400px]">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Card Title</th>
                <th class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignee</th>
                <th class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Overdue By</th>
                <th class="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr *ngFor="let card of overdueCards()" class="hover:bg-red-50/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="text-sm font-bold text-[#172b4d]">{{ card.title }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-gray-200 text-[10px] flex items-center justify-center font-bold">U</div>
                    <span class="text-xs text-gray-600">User #{{ card.assigneeId }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-xs font-bold text-red-600">
                  {{ getOverdueDays(card.dueDate) }} days
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">HIGH</span>
                </td>
              </tr>
              <tr *ngIf="overdueCards().length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-gray-400 italic">No SLA violations detected.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Audit Logs -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div class="flex items-center gap-2">
            <mat-icon class="text-blue-500">history</mat-icon>
            <h3 class="text-lg font-bold text-[#172b4d]">Audit Trail</h3>
          </div>
        </div>
        <div class="p-6 space-y-6">
          <div *ngFor="let log of auditLogs().slice(0, 5)" class="flex gap-4 relative">
            <div class="absolute left-[13px] top-[30px] bottom-[-20px] w-0.5 bg-gray-100"></div>
            <div class="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center shrink-0 z-10 border-2 border-white">
              <mat-icon class="!text-[14px] !w-3.5 !h-3.5 text-blue-600">bolt</mat-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-[#172b4d]">{{ log.action }}</span>
              <span class="text-[11px] text-gray-500 mt-1">{{ log.details }}</span>
              <span class="text-[10px] text-gray-400 mt-1 uppercase font-bold">{{ log.timestamp | date:'short' }}</span>
            </div>
          </div>
          <button mat-stroked-button class="w-full !border-gray-200 !text-xs !py-1" routerLink="/admin/audit">View Full Audit Log</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private exportService = inject(ExportService);

  totalUsers = signal<number>(0);
  totalWorkspaces = signal<number>(0);
  totalCards = signal<number>(0);
  activeTeams = signal<number>(0);
  
  overdueCards = signal<any[]>([]);
  auditLogs = signal<any[]>([]);

  kpis = [
    { label: 'Total Users', value: this.totalUsers, icon: 'group', bg: 'bg-blue-100', textClass: 'text-blue-600', trend: 8 },
    { label: 'Workspaces', value: this.totalWorkspaces, icon: 'corporate_fare', bg: 'bg-purple-100', textClass: 'text-purple-600', trend: 12 },
    { label: 'Cards Created', value: this.totalCards, icon: 'list_alt', bg: 'bg-amber-100', textClass: 'text-amber-600', trend: 24 },
    { label: 'Active Teams', value: this.activeTeams, icon: 'diversity_3', bg: 'bg-green-100', textClass: 'text-green-600', trend: 5 }
  ];

  ngOnInit() {
    this.adminService.getAllUsers().subscribe(res => this.totalUsers.set(res.length));
    this.adminService.getAllWorkspaces().subscribe(res => {
      this.totalWorkspaces.set(res.length);
      this.activeTeams.set(res.length); // Assuming each workspace is a team for now
    });
    
    this.adminService.getOverdueCards().subscribe(res => {
        this.overdueCards.set(res);
        this.totalCards.set(res.length + 150); // Mocking total cards for analytics
    });

    this.adminService.getAuditLogs().subscribe(res => this.auditLogs.set(res));
  }

  getOverdueDays(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  exportPlatformReport() {
    // Generate a report from current KPIs and overdue cards
    const reportData = [
      { Metric: 'Total Users', Value: this.totalUsers() },
      { Metric: 'Total Workspaces', Value: this.totalWorkspaces() },
      { Metric: 'Total Cards', Value: this.totalCards() },
      { Metric: 'Active Teams', Value: this.activeTeams() },
      { Metric: 'SLA Violations', Value: this.overdueCards().length }
    ];

    this.exportService.exportToCsv(reportData, 'Zask_Platform_Report');
  }
}
