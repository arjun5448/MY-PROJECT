package com.licreminder.repository;

import com.licreminder.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByUserIdOrderByNameAsc(Long userId);
    Optional<Client> findByIdAndUserId(Long id, Long userId);
    boolean existsByPolicyNumber(String policyNumber);
    boolean existsByPolicyNumberAndIdNot(String policyNumber, Long id);
}
