package com.yazzer.foot5connect.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.Token;
import com.yazzer.foot5connect.models.TokenType;

public interface TokenRepository extends JpaRepository<Token, Long> {

    Optional<Token> findByToken(String token);

    Optional<Token> findByTokenAndType(String token, TokenType type);
    
}
