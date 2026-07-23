package org.neatore.onamfinder;

import org.json.JSONObject;

import org.springframework.data.annotation.CreatedDate;

import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GenerationType;

import lombok.Getter;

import java.time.LocalDateTime;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
public class LostItem {
    public enum Category {
        ELECTRONICS("전자기기"),
        WALLET("지갑·카드"),
        VALUEABLES("귀중품"),
        CLOTHING("의류·잡화"),
        BAGS("가방·소지품"),
        DOCUMENTS("도서·서류"),
        FOODS("식품"),
        OTHERS("기타");

        @Getter
        private final String displayName;

        Category(String displayName) {
            this.displayName = displayName;
        }

        public static Category fromDisplayName(String displayName) {
            for (Category category : Category.values()) {
                if (category.displayName.equals(displayName)) return category;
            }
            throw new IllegalArgumentException("Unknown category: " + displayName);
        }
    }

    public JSONObject toJson() {
        JSONObject json = new JSONObject();
        json.put("id", this.id);
        json.put("title", this.title);
        json.put("description", this.description);
        json.put("content", this.content);
        json.put("category", this.category.getDisplayName());
        json.put("uploadAt", this.uploadAt);
        json.put("foundAt", this.foundAt);
        json.put("foundLocation", this.foundLocation);
        json.put("findMethod", this.findMethod);
        json.put("images", this.images);
        json.put("features", this.features);
        json.put("status", this.status.name());
        return json;
    }

    public enum Status {
        FINDING, COMPLETED, EXPIRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;
    private String description;
    private String content;

    @Enumerated(EnumType.STRING)
    private Category category;

    @CreatedDate
    private LocalDateTime uploadAt;

    private LocalDateTime foundAt;
    private String foundLocation;
    private String findMethod;
    private String uploaderPwd;
    private List<String> images;
    private List<String> features;
    private Status status;
}
