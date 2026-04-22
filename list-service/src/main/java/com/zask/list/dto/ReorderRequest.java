package com.zask.list.dto;

import lombok.Data;
import java.util.List;

@Data
public class ReorderRequest {
    private List<Integer> listIds; // ordered list of IDs
}