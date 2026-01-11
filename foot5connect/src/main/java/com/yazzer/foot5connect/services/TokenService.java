package com.yazzer.foot5connect.services;

import java.util.Optional;

import com.yazzer.foot5connect.models.Token;

public interface TokenService {
    
    Optional<Token> findByToken(String token);
    
    Token saveToken(Token token);
}
