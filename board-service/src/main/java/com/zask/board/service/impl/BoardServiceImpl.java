package com.zask.board.service.impl;

import com.zask.board.dto.*;
import com.zask.board.entity.*;
import com.zask.board.exception.ResourceNotFoundException;
import com.zask.board.exception.ValidationException;
import com.zask.board.repository.*;
import com.zask.board.service.BoardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BoardServiceImpl implements BoardService {

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private BoardMemberRepository boardMemberRepository;

    @Override
    public Board createBoard(BoardRequest request) {
        Board board = Board.builder()
                .workspaceId(request.getWorkspaceId())
                .name(request.getName())
                .description(request.getDescription())
                .background(request.getBackground())
                .visibility(request.getVisibility())
                .createdById(request.getCreatedById())
                .build();
        Board saved = boardRepository.save(board);

        // Auto add creator as ADMIN member
        BoardMember member = BoardMember.builder()
                .boardId(saved.getBoardId())
                .userId(request.getCreatedById())
                .role("ADMIN")
                .build();
        boardMemberRepository.save(member);

        return saved;
    }

    @Override
    public Board getBoardById(int boardId) {
        return boardRepository.findById(boardId)
                .orElseThrow(() -> new ResourceNotFoundException("Board not found"));
    }

    @Override
    public List<Board> getBoardsByWorkspace(int workspaceId) {
        return boardRepository.findByWorkspaceId(workspaceId);
    }

    @Override
    public List<Board> getBoardsByMember(int userId) {
        List<BoardMember> memberships = boardMemberRepository.findByUserId(userId);
        return memberships.stream()
                .map(m -> boardRepository.findById(m.getBoardId()).orElse(null))
                .filter(b -> b != null)
                .collect(Collectors.toList());
    }

    @Override
    public List<Board> getPublicBoards() {
        return boardRepository.findByVisibility("PUBLIC");
    }

    @Override
    public Board updateBoard(int boardId, BoardRequest request) {
        Board board = getBoardById(boardId);
        if (request.getName() != null) board.setName(request.getName());
        if (request.getDescription() != null) board.setDescription(request.getDescription());
        if (request.getBackground() != null) board.setBackground(request.getBackground());
        if (request.getVisibility() != null) board.setVisibility(request.getVisibility());
        if (request.getIsClosed() != null) board.setClosed(request.getIsClosed());
        if (request.getIsStarred() != null) board.setStarred(request.getIsStarred());
        return boardRepository.save(board);
    }

    @Override
    public void closeBoard(int boardId) {
        Board board = getBoardById(boardId);
        board.setClosed(true);
        boardRepository.save(board);
    }

    @Override
    @Transactional
    public void deleteBoard(int boardId) {
        getBoardById(boardId);
        boardMemberRepository.findByBoardId(boardId)
                .forEach(m -> boardMemberRepository.delete(m));
        boardRepository.deleteById(boardId);
    }

    @Override
    @Transactional
    public void deleteBoardsByWorkspace(int workspaceId) {
        List<Board> boards = boardRepository.findByWorkspaceId(workspaceId);
        for (Board board : boards) {
            deleteBoard(board.getBoardId());
        }
    }

    @Override
    public BoardMember addMember(int boardId, BoardMemberRequest request) {
        getBoardById(boardId);
        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, request.getUserId()))
            throw new ValidationException("User is already a member");

        BoardMember member = BoardMember.builder()
                .boardId(boardId)
                .userId(request.getUserId())
                .role(request.getRole() != null ? request.getRole() : "MEMBER")
                .build();
        return boardMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void removeMember(int boardId, int userId) {
        boardMemberRepository.deleteByBoardIdAndUserId(boardId, userId);
    }

    @Override
    @Transactional
    public void removeMemberFromWorkspaceBoards(int workspaceId, int userId) {
        List<Board> boards = boardRepository.findByWorkspaceId(workspaceId);
        List<Integer> boardIds = boards.stream().map(Board::getBoardId).collect(Collectors.toList());
        if (!boardIds.isEmpty()) {
            boardMemberRepository.deleteByBoardIdInAndUserId(boardIds, userId);
        }
    }

    @Override
    public void updateMemberRole(int boardId, int userId, String role) {
        BoardMember member = boardMemberRepository
                .findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        member.setRole(role);
        boardMemberRepository.save(member);
    }

    @Override
    public List<BoardMember> getMembers(int boardId) {
        return boardMemberRepository.findByBoardId(boardId);
    }

    @Override
    public List<Board> searchBoards(String name) {
        return boardRepository.findByNameContainingIgnoreCase(name);
    }
}