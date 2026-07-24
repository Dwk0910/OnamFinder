package org.neatore.onamfinder;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lostitems")
public class LostItemController {
    private final LostItemService lostItemService;

    public record PageResponse<T>(
            List<T> content,
            Integer page,
            Integer size,
            Long totalElements,
            Integer totalPages
    ) {
        public static <T> PageResponse<T> from(Page<T> page) {
            return new PageResponse<>(
                    page.getContent(),
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements(),
                    page.getTotalPages()
            );
        }
    }

    @GetMapping
    public ResponseEntity<PageResponse<LostItemDto.QueryResponseDto>> getLostItems(Pageable pageable) {
        Page<LostItemDto.QueryResponseDto> page = this.lostItemService.getAllLostItems(pageable);
        return ResponseEntity.ok(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getLostItemById(@PathVariable String id) {
        LostItem item = this.lostItemService.getLostItemById(id);
        if (item == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(item.toJson().toString());
    }

    @PostMapping
    public ResponseEntity<Void> createLostItem(@ModelAttribute LostItemDto.CreateRequestDto lostItemDto) {
        lostItemService.createLostItem(lostItemDto);
        return ResponseEntity.ok().build();
    }
}
