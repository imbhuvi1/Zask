package com.zask.board.service;

import com.zask.board.dto.*;
import com.zask.board.entity.*;
import java.util.List;

public interface BoardService {
    Board createBoard(BoardRequest request);
    Board getBoardById(int boardId);
    List<Board> getBoardsByWorkspace(int workspaceId);
    List<Board> getBoardsByMember(int userId);
    Board updateBoard(int boardId, BoardRequest request);
    void closeBoard(int boardId);
    void deleteBoard(int boardId);
    BoardMember addMember(int boardId, BoardMemberRequest request);
    void removeMember(int boardId, int userId);
    void updateMemberRole(int boardId, int userId, String role);
    List<BoardMember> getMembers(int boardId);
}