package com.medianet.evalpro.Dto;

import java.util.List;

public record PageDto<T>(List<T> items, long total) {}
