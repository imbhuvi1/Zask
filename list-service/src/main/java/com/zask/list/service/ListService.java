package com.zask.list.service;

import com.zask.list.dto.*;
import com.zask.list.entity.TaskList;
import java.util.List;

public interface ListService {
    TaskList createList(ListRequest request);
    TaskList getListById(int listId);
    List<TaskList> getListsByBoard(int boardId);
    TaskList updateList(int listId, ListRequest request);
    void reorderLists(int boardId, ReorderRequest request);
    void archiveList(int listId);
    void unarchiveList(int listId);
    void deleteList(int listId);
    void moveList(int listId, int targetBoardId);
    List<TaskList> getArchivedLists(int boardId);
}