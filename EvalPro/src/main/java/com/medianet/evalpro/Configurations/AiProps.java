package com.medianet.evalpro.Configurations;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component                               // makes it a Spring bean
@ConfigurationProperties(prefix = "ai")  // binds ai.* from application.properties
public class AiProps {
    @NotBlank
    private String baseUrl;
    @NotBlank
    private String apiKey;
    @NotBlank
    private String model;
}

