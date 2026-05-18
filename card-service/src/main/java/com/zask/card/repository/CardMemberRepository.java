package com.zask.card.repository;

import com.zask.card.entity.CardMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardMemberRepository extends JpaRepository<CardMember, Integer> {
    List<CardMember> findByCardId(int cardId);
    List<CardMember> findByUserId(int userId);
    void deleteByCardIdAndUserId(int cardId, int userId);
    boolean existsByCardIdAndUserId(int cardId, int userId);
}
