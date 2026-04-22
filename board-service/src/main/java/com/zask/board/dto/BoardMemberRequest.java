package com.zask.board.dto;

import lombok.Data;

@Data
public class BoardMemberRequest {
    private int userId;
    private String role;
}