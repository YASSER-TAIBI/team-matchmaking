package com.yazzer.foot5connect.services;

import java.util.Optional;

import com.yazzer.foot5connect.models.Token;
import com.yazzer.foot5connect.models.TokenType;

public interface TokenService {
    
    Optional<Token> findByToken(String token);

    Optional<Token> findByTokenAndType(String token, TokenType type);
    
    Token saveToken(Token token);
}
