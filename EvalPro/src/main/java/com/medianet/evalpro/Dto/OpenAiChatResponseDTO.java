package com.medianet.evalpro.Dto;

import java.util.List;

public class OpenAiChatResponseDTO {

    public String id;
    public String object;
    public long created;
    public String model;
    public List<Choice> choices;
    public Usage usage;

    public static class Choice {
        public int index;
        public Message message;
        public String finish_reason;
    }

    public static class Message {
        public String role;     // "assistant"
        public String content;  // le texte renvoyé par le modèle
    }

    public static class Usage {
        public int prompt_tokens;
        public int completion_tokens;
        public int total_tokens;
    }
}
