package com.yazzer.foot5connect.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.yazzer.foot5connect.models.Role;

public interface RoleRepository extends JpaRepository<Role, Long>{

    Optional<Role> findByName(String roleName);
    
}
