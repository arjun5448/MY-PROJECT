package com.licreminder.repository;

import com.licreminder.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    boolean existsByClientIdAndNotificationTypeAndNotificationDate(Long clientId, String notificationType, LocalDate notificationDate);

    @Modifying
    @Transactional
    @Query("delete from NotificationLog notificationLog where notificationLog.client.id = :clientId")
    void deleteAllByClientId(@Param("clientId") Long clientId);
}
