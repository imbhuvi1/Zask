package com.zask.list.service.impl;

import com.zask.list.dto.*;
import com.zask.list.entity.TaskList;
import com.zask.list.repository.ListRepository;
import com.zask.list.service.ListService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ListServiceImpl implements ListService {

    @Autowired
    private ListRepository listRepository;

    @Override
    public TaskList createList(ListRequest request) {
        // Get max position for this board
        int position = listRepository
                .findTopByBoardIdOrderByPositionDesc(request.getBoardId())
                .map(l -> l.getPosition() + 1)
                .orElse(0);

        TaskList taskList = TaskList.builder()
                .boardId(request.getBoardId())
                .name(request.getName())
                .color(request.getColor())
                .position(position)
                .build();

        return listRepository.save(taskList);
    }

    @Override
    public TaskList getListById(int listId) {
        return listRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
    }

    @Override
    public List<TaskList> getListsByBoard(int boardId) {
        return listRepository.findByBoardIdOrderByPosition(boardId);
    }

    @Override
    public TaskList updateList(int listId, ListRequest request) {
        TaskList taskList = getListById(listId);
        if (request.getName() != null) taskList.setName(request.getName());
        if (request.getColor() != null) taskList.setColor(request.getColor());
        return listRepository.save(taskList);
    }

    @Override
    @Transactional
    public void reorderLists(int boardId, ReorderRequest request) {
        List<Integer> listIds = request.getListIds();
        for (int i = 0; i < listIds.size(); i++) {
            TaskList taskList = getListById(listIds.get(i));
            taskList.setPosition(i);
            listRepository.save(taskList);
        }
    }

    @Override
    public void archiveList(int listId) {
        TaskList taskList = getListById(listId);
        taskList.setArchived(true);
        listRepository.save(taskList);
    }

    @Override
    public void unarchiveList(int listId) {
        TaskList taskList = getListById(listId);
        taskList.setArchived(false);
        listRepository.save(taskList);
    }

    @Override
    @Transactional
    public void deleteList(int listId) {
        getListById(listId);
        listRepository.deleteById(listId);
    }

    @Override
    public void moveList(int listId, int targetBoardId) {
        TaskList taskList = getListById(listId);
        taskList.setBoardId(targetBoardId);

        // Set position at end of target board
        int position = listRepository
                .findTopByBoardIdOrderByPositionDesc(targetBoardId)
                .map(l -> l.getPosition() + 1)
                .orElse(0);
        taskList.setPosition(position);
        listRepository.save(taskList);
    }

    @Override
    public List<TaskList> getArchivedLists(int boardId) {
        return listRepository.findByBoardIdAndIsArchived(boardId, true);
    }
}