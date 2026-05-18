package com.zask.label.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LabelRequest {
    private int boardId;

    @NotBlank(message = "Label name cannot be blank")
    @Size(max = 100, message = "Label name cannot exceed 100 characters")
    private String name;

    private String color;
}