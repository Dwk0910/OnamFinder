package org.neatore.onamfinder;

import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LostItemService {
    private final LostItemRepository lostItemRepository;

    public Page<LostItemDto.QueryResponseDto> getAllLostItems(Pageable pageable) {
        return lostItemRepository.findAll(pageable).map(LostItemDto.QueryResponseDto::from);
    }

    public @Nullable LostItem getLostItemById(String id) {
        return lostItemRepository.getReferenceById(UUID.fromString(id));
    }

    public void createLostItem(LostItemDto.CreateRequestDto lostItemDto) {
        this.lostItemRepository.save(new LostItem(
                lostItemDto,
                null
        ));
    }
}
