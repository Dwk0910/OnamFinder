package org.neatore.onamfinder;

import java.time.ZoneOffset;

import java.util.List;
import java.util.UUID;

public class LostItemDto {
    public record CreateRequestDto(
            LostItem.Category category,
            String title,
            String foundLocation,
            String content,
            Long foundAt,
            List<String> features,
            String findMethod
    ) {}

    public record QueryResponseDto(
            UUID id,
            String title,
            String content,
            LostItem.Category category,
            List<String> features,
            String findMethod,
            Long foundAt,
            String foundLocation,
            List<String> images,
            LostItem.Status status,
            Long uploadAt
    ) {
        public static QueryResponseDto from(LostItem lostItem) {
            return new QueryResponseDto(
                    lostItem.getId(),
                    lostItem.getTitle(),
                    lostItem.getContent(),
                    lostItem.getCategory(),
                    lostItem.getFeatures(),
                    lostItem.getFindMethod(),
                    lostItem.getFoundAt().toEpochSecond(ZoneOffset.ofHours(9)),
                    lostItem.getFoundLocation(),
                    lostItem.getImages(),
                    lostItem.getStatus(),
                    lostItem.getUploadAt().toEpochSecond(ZoneOffset.ofHours(9))
            );
        }
    }
}
