import { Component, inject, OnInit, signal } from '@angular/core';
import { ExportService } from '../../../core/services/export.service';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  template: `
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-[#172b4d]">System Audit Logs</h1>
        <button mat-stroked-button class="!border-gray-300" (click)="exportAuditLogs()">
          <mat-icon class="!text-[18px] !w-[18px] !h-[18px]">file_download</mat-icon> Export CSV
        </button>
      </div>
      <p class="text-gray-500">Immutable record of all administrative and significant platform actions.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table mat-table [dataSource]="logs()" class="w-full">
        <!-- Timestamp Column -->
        <ng-container matColumnDef="timestamp">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Timestamp </th>
          <td mat-cell *matCellDef="let log" class="!text-sm !text-gray-500"> {{ log.timestamp | date:'medium' }} </td>
        </ng-container>

        <!-- Performed By Column -->
        <ng-container matColumnDef="actor">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Performed By </th>
          <td mat-cell *matCellDef="let log"> 
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-blue-100 text-[#0052cc] text-[10px] flex items-center justify-center font-bold">
                {{ (log.performedByName || 'U').substring(0, 1) }}
              </div>
              <span class="text-xs font-bold text-[#172b4d]">{{ log.performedByName || 'System' }}</span>
              <span class="text-[10px] text-gray-400">#{{ log.performedBy }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Action Column -->
        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Action </th>
          <td mat-cell *matCellDef="let log"> 
             <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-tight bg-gray-100 text-gray-700">
               {{ log.action }}
             </span>
          </td>
        </ng-container>

        <!-- Details Column -->
        <ng-container matColumnDef="details">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Activity Details </th>
          <td mat-cell *matCellDef="let log" class="!text-xs text-gray-600"> {{ log.details }} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-transparent"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50/50"></tr>
      </table>

      <div *ngIf="logs().length === 0" class="p-16 text-center">
        <mat-icon class="!w-12 !h-12 !text-[48px] text-gray-200 mb-4">history_toggle_off</mat-icon>
        <p class="text-gray-400 italic">No audit logs recorded yet.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .mat-column-timestamp { width: 200px; }
    .mat-column-actor { width: 180px; }
    .mat-column-action { width: 150px; }
  `]
})
export class AdminAuditComponent implements OnInit {
  private adminService = inject(AdminService);
  private exportService = inject(ExportService);
  logs = signal<any[]>([]);
  displayedColumns = ['timestamp', 'actor', 'action', 'details'];

  ngOnInit() {
    this.adminService.getAuditLogs().subscribe(res => this.logs.set(res));
  }

  exportAuditLogs() {
    this.exportService.exportToCsv(this.logs(), 'Zask_Audit_Logs');
  }
}
