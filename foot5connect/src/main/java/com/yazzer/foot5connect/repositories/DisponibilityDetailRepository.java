package com.yazzer.foot5connect.repositories;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.yazzer.foot5connect.models.DisponibilityDetail;

public interface DisponibilityDetailRepository extends JpaRepository<DisponibilityDetail, Long> {

    boolean existsByUser_IdAndAvailableDateAndStartTimeAndEndTime(Long userId, LocalDate availableDate, LocalTime startTime, LocalTime endTime);

    @Query("""
            select d
            from DisponibilityDetail d
            join fetch d.user u
            where u.availabilityStatus = 'DISPONIBLE'
              and d.createdDate = (
                select max(d2.createdDate)
                from DisponibilityDetail d2
                where d2.user = u
              )
            """)
    List<DisponibilityDetail> findLatestDisponibilityForAvailableUsers();

    @Query("""
            select d
            from DisponibilityDetail d
            join fetch d.user u
            where u.availabilityStatus = 'DISPONIBLE'
              and u.country = :country
              and u.city = :city
              and d.createdDate = (
                select max(d2.createdDate)
                from DisponibilityDetail d2
                where d2.user = u
              )
            """)
    List<DisponibilityDetail> findLatestDisponibilityForAvailableUsersInLocation(
            @Param("country") String country,
            @Param("city") String city
    );
}
