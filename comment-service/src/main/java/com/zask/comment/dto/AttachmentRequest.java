package com.zask.comment.dto;

import lombok.Data;

@Data
public class AttachmentRequest {
    private int cardId;
    private int uploaderId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private long sizeKb;
}