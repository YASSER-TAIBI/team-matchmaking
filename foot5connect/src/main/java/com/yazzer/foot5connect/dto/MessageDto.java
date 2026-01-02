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

    private Integer id;

    private String content;

    private LocalDateTime sentAt;

    private Integer userId;

    private Integer matchRequestId;

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
                .matchRequestId(message.getMatchRequest().getId())
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
                .matchRequest(
                        MatchRequest.builder()
                                .id(messageDto.getMatchRequestId())
                                .build()
                )
                .build();
    }
}
