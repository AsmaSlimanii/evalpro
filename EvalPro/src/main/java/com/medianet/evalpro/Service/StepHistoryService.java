package com.medianet.evalpro.Service;

import com.medianet.evalpro.Entity.Dossier;
import com.medianet.evalpro.Entity.Step;
import com.medianet.evalpro.Entity.StepHistory;
import com.medianet.evalpro.Entity.User;

public interface StepHistoryService {
    void log(Dossier dossier, Step step, User actor,
             StepHistory.StepHistoryAction action, String description, boolean visibleToClient);

}
