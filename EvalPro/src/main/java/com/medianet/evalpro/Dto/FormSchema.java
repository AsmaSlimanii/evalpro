package com.medianet.evalpro.Dto;

import java.util.List;

public class FormSchema {
    private String title;
    private List<Field> fields;

    public FormSchema() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<Field> getFields() { return fields; }
    public void setFields(List<Field> fields) { this.fields = fields; }

    /** Classe interne pour chaque champ */
    public static class Field {
        private String name;
        private String type;
        private String label;
        private boolean required;
        private List<String> options;   // null si non applicable
        private Object value;           // valeur pré-remplie

        public Field() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public boolean isRequired() { return required; }
        public void setRequired(boolean required) { this.required = required; }

        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }

        public Object getValue() { return value; }
        public void setValue(Object value) { this.value = value; }
    }
}
