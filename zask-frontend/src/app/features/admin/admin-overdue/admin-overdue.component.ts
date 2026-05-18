import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-admin-overdue',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  template: `
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <h1 class="text-2xl font-bold text-[#172b4d]">SLA & Deadlines Monitor</h1>
        <div class="flex items-center gap-3">
           <span class="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
             {{ cards().length }} Cards At Risk
           </span>
        </div>
      </div>
      <p class="text-gray-500">Cross-platform view of all overdue tasks requiring administrative attention.</p>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table mat-table [dataSource]="cards()" class="w-full">
        <!-- Card Title -->
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Task Description </th>
          <td mat-cell *matCellDef="let card"> 
            <div class="flex flex-col py-3">
              <span class="text-sm font-bold text-[#172b4d]">{{ card.title }}</span>
              <span class="text-[10px] text-gray-400">Board #{{ card.boardId }} • List #{{ card.listId }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Assignee -->
        <ng-container matColumnDef="assignee">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Responsible </th>
          <td mat-cell *matCellDef="let card"> 
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">U</div>
              <span class="text-xs text-gray-600">User #{{ card.assigneeId }}</span>
            </div>
          </td>
        </ng-container>

        <!-- Due Date -->
        <ng-container matColumnDef="dueDate">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Deadline </th>
          <td mat-cell *matCellDef="let card" class="!text-sm text-red-600 font-semibold"> 
             {{ card.dueDate | date:'mediumDate' }}
          </td>
        </ng-container>

        <!-- Overdue By -->
        <ng-container matColumnDef="delay">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Delay </th>
          <td mat-cell *matCellDef="let card"> 
             <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
               {{ getOverdueDays(card.dueDate) }} DAYS OVERDUE
             </span>
          </td>
        </ng-container>

        <!-- Priority -->
        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef class="!text-[11px] !font-bold !text-gray-400 !uppercase !tracking-widest !py-4"> Priority </th>
          <td mat-cell *matCellDef="let card"> 
             <span class="flex items-center gap-1 text-[10px] font-bold" [class.text-red-600]="card.priority === 'HIGH'">
               <mat-icon class="!text-[14px] !w-3.5 !h-3.5">priority_high</mat-icon>
               {{ card.priority || 'MEDIUM' }}
             </span>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-transparent"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-red-50/20 transition-colors border-l-4 border-l-transparent hover:border-l-red-500"></tr>
      </table>

      <div *ngIf="cards().length === 0" class="p-16 text-center">
        <mat-icon class="!w-12 !h-12 !text-[48px] text-green-100 mb-4">task_alt</mat-icon>
        <p class="text-gray-400 italic">All tasks are currently within SLA limits.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminOverdueComponent implements OnInit {
  private adminService = inject(AdminService);
  cards = signal<any[]>([]);
  displayedColumns = ['title', 'assignee', 'dueDate', 'delay', 'priority'];

  ngOnInit() {
    this.adminService.getOverdueCards().subscribe(res => this.cards.set(res));
  }

  getOverdueDays(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = now.getTime() - due.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }
}
