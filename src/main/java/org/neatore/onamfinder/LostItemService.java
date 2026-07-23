package org.neatore.onamfinder;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LostItemService {
    private final LostItemRepository lostItemRepository;

    public List<LostItem> getAllLostItems() {
        return lostItemRepository.findAll();
    }
}
