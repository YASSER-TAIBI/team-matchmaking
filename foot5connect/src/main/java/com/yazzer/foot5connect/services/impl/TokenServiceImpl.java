package com.yazzer.foot5connect.services.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.yazzer.foot5connect.models.Token;
import com.yazzer.foot5connect.models.TokenType;
import com.yazzer.foot5connect.repositories.TokenRepository;
import com.yazzer.foot5connect.services.TokenService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {
    
    private final TokenRepository tokenRepository;
    
    @Override
    public Optional<Token> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    @Override
    public Optional<Token> findByTokenAndType(String token, TokenType type) {
        return tokenRepository.findByTokenAndType(token, type);
    }

    @Override
    public Token saveToken(Token token) {
       return tokenRepository.save(token);
    }

   
}
