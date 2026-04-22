package com.zask.label.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "card_labels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardLabel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int cardId;

    private int labelId;
}