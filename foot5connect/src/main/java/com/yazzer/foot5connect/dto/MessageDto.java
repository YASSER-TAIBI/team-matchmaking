package com.yazzer.foot5connect.dto;

import com.yazzer.foot5connect.models.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class MessageDto {

    private Long id;

    private String content;

    private LocalDateTime sentAt;

    private Long userId;

    private Long invitationId;

    public static MessageDto fromEntity(Message message) {
        if (message == null) {
            return null;
            // TODO throw an exception
        }
        return MessageDto.builder()
                .id(message.getId())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .userId(message.getSender().getId())
                .invitationId(message.getInvitation().getId())
                .build();
    }

    public static Message toEntity(MessageDto messageDto) {
        if (messageDto == null) {
            return null;
            // TODO throw an exception
        }
        return Message.builder()
                .id(messageDto.getId())
                .content(messageDto.getContent())
                .sentAt(messageDto.getSentAt())
                .sender(
                        User.builder()
                                .id(messageDto.getUserId())
                                .build()
                )
                .invitation(
                        TeamInvitation.builder()
                                .id(messageDto.getInvitationId())
                                .build()
                )
                .build();
    }
}
