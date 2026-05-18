package com.zask.list.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ListRequest {
    private int boardId;

    @NotBlank(message = "List name cannot be blank")
    @Size(max = 100, message = "List name cannot exceed 100 characters")
    private String name;

    private String color;
}