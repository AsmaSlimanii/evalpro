package com.medianet.evalpro.Dto;

import com.medianet.evalpro.Entity.Dossier;

public record AdminStatusUpdateDto(
        Dossier.Status status,
        String message
) {}
