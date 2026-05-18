import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Activity } from '../models/activity.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activities`;

  getActivitiesByCard(cardId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiUrl}/card/${cardId}`);
  }

  logActivity(activity: Partial<Activity>): Observable<Activity> {
    return this.http.post<Activity>(this.apiUrl, activity);
  }
}
