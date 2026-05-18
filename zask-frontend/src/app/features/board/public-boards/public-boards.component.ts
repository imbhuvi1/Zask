import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BoardService } from '../../../core/services/board.service';
import { Board } from '../../../core/models/board.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-public-boards',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './public-boards.component.html'
})
export class PublicBoardsComponent implements OnInit {
  private boardService = inject(BoardService);
  
  publicBoards$: Observable<Board[]> | undefined;

  ngOnInit(): void {
    this.publicBoards$ = this.boardService.getPublicBoards();
  }
}
