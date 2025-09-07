package com.medianet.evalpro.Dto;



import lombok.Data;
import java.util.List;

@Data
public class FormSchema {
    private String title;
    private List<FieldDef> fields;

    @Data
    public static class FieldDef {
        private String id;
        private String label;
        private String type;            // text | textarea | number | date | select | checkbox
        private Boolean required;
        private Integer min;
        private Integer max;
        private String placeholder;
        private List<String> options;   // pour select
    }
}

