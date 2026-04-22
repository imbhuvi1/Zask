package com.zask.board.service.impl;

import com.zask.board.dto.*;
import com.zask.board.entity.*;
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
                .orElseThrow(() -> new RuntimeException("Board not found"));
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
    public Board updateBoard(int boardId, BoardRequest request) {
        Board board = getBoardById(boardId);
        if (request.getName() != null) board.setName(request.getName());
        if (request.getDescription() != null) board.setDescription(request.getDescription());
        if (request.getBackground() != null) board.setBackground(request.getBackground());
        if (request.getVisibility() != null) board.setVisibility(request.getVisibility());
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
    public BoardMember addMember(int boardId, BoardMemberRequest request) {
        getBoardById(boardId);
        if (boardMemberRepository.existsByBoardIdAndUserId(boardId, request.getUserId()))
            throw new RuntimeException("User is already a member");

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
    public void updateMemberRole(int boardId, int userId, String role) {
        BoardMember member = boardMemberRepository
                .findByBoardIdAndUserId(boardId, userId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        member.setRole(role);
        boardMemberRepository.save(member);
    }

    @Override
    public List<BoardMember> getMembers(int boardId) {
        return boardMemberRepository.findByBoardId(boardId);
    }
}