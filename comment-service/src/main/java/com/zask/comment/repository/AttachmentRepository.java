package com.zask.comment.repository;

import com.zask.comment.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Integer> {
    List<Attachment> findByCardId(int cardId);
    void deleteByAttachmentId(int attachmentId);
}