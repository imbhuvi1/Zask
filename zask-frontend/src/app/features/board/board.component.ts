import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BoardService } from '../../core/services/board.service';
import { ListService } from '../../core/services/list.service';
import { CardService } from '../../core/services/card.service';
import { Board } from '../../core/models/board.model';
import { TaskList } from '../../core/models/list.model';
import { Card } from '../../core/models/card.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DragDropModule, FormsModule, 
    MatToolbarModule, MatIconModule, MatButtonModule, 
    MatCardModule, MatInputModule, MatProgressSpinnerModule
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private listService = inject(ListService);
  private cardService = inject(CardService);

  boardId: number | null = null;
  board = signal<Board | null>(null);
  
  // Data structure: a list of objects containing the list data and its array of cards
  boardLists = signal<{ list: TaskList, cards: Card[] }[]>([]);
  isLoading = signal(true);

  // New item states
  newListTitle = '';
  newCardTitles: { [listId: number]: string } = {};

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.boardId = +id;
      this.loadBoardData();
    }
  }

  loadBoardData() {
    if (!this.boardId) return;
    this.isLoading.set(true);

    this.boardService.getBoardById(this.boardId).subscribe(board => {
      this.board.set(board);
      
      // Load Lists
      this.listService.getListsByBoard(board.boardId).subscribe(lists => {
        // Sort lists by position
        lists.sort((a, b) => a.position - b.position);
        
        // Load Cards
        this.cardService.getCardsByBoard(board.boardId).subscribe(cards => {
          
          const structuredLists = lists.map(list => {
            const listCards = cards
              .filter(c => c.listId === list.listId)
              .sort((a, b) => a.position - b.position);
            return { list, cards: listCards };
          });

          this.boardLists.set(structuredLists);
          this.isLoading.set(false);
        });
      });
    });
  }

  dropList(event: CdkDragDrop<{ list: TaskList, cards: Card[] }[]>) {
    moveItemInArray(this.boardLists(), event.previousIndex, event.currentIndex);
    
    // Call backend to update list positions
    const listIds = this.boardLists().map(l => l.list.listId);
    if(this.boardId) {
      this.listService.reorderLists(this.boardId, listIds).subscribe();
    }
  }

  dropCard(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Call backend to reorder cards within same list
      const listId = Number(event.container.id.replace('list-', ''));
      const cardIds = event.container.data.map(c => c.cardId);
      this.cardService.reorderCards(listId, cardIds).subscribe();
      
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const card = event.container.data[event.currentIndex];
      const targetListId = Number(event.container.id.replace('list-', ''));
      
      // Call backend to move card to new list
      this.cardService.moveCard(card.cardId, targetListId, event.currentIndex).subscribe();
    }
  }

  addList() {
    if (!this.newListTitle.trim() || !this.boardId) return;

    const list: Partial<TaskList> = {
      boardId: this.boardId,
      name: this.newListTitle.trim(),
      position: this.boardLists().length
    };

    this.listService.createList(list).subscribe(newList => {
      this.boardLists.update(lists => [...lists, { list: newList, cards: [] }]);
      this.newListTitle = '';
    });
  }

  addCard(listId: number) {
    const title = this.newCardTitles[listId]?.trim();
    if (!title || !this.boardId) return;

    const listGroup = this.boardLists().find(l => l.list.listId === listId);
    const position = listGroup ? listGroup.cards.length : 0;

    const card: Partial<Card> = {
      boardId: this.boardId,
      listId: listId,
      title: title,
      position: position,
      priority: 'MEDIUM',
      status: 'TO_DO'
    };

    this.cardService.createCard(card).subscribe(newCard => {
      this.boardLists.update(lists => {
        const targetList = lists.find(l => l.list.listId === listId);
        if (targetList) {
          targetList.cards.push(newCard);
        }
        return [...lists]; // Trigger change detection
      });
      this.newCardTitles[listId] = ''; // Reset input
    });
  }
}
