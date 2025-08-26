package com.medianet.evalpro.Repository;

import com.medianet.evalpro.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadFlagFalse(Long userId);

    @Modifying
    @Query("update Notification n set n.readFlag = true where n.id = :id and n.user.id = :userId")
    int markAsRead(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("update Notification n set n.readFlag = true where n.user.id = :userId")
    int markAllAsRead(@Param("userId") Long userId);
}
