package com.medianet.evalpro.Configurations;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component                               // makes it a Spring bean
@ConfigurationProperties(prefix = "ai")  // binds ai.* from application.properties
public class AiProps {
    private String baseUrl;
    private String apiKey;
    private String model;
}

