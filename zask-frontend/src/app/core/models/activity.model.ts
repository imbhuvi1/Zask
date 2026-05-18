export interface Activity {
  activityId: number;
  cardId: number;
  actorId: number;
  actorName: string;
  action: string; // ASSIGNMENT, STATUS_CHANGE, DUE_DATE_CHANGE, MOVE, TITLE_CHANGE, DESCRIPTION_CHANGE, ARCHIVE, UNARCHIVE
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}
