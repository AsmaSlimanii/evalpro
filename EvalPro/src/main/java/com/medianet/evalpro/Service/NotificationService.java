package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.Notification;
import com.medianet.evalpro.Entity.Step;

import java.util.List;

public interface NotificationService {

    void notifyStepComment(Dossier dossier, Step step, String title, String message, String link);
    void notifyStatus(Dossier dossier, Notification.Type type, String message);
}
