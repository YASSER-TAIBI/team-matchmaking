package com.yazzer.foot5connect.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.User;

import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
}
