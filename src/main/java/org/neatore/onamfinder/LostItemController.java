package org.neatore.onamfinder;

import lombok.RequiredArgsConstructor;
import org.json.JSONArray;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/lostitems")
public class LostItemController {
    private final LostItemService lostItemService;

    @GetMapping
    public ResponseEntity<String> getLostItems(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Integer limit,
        @RequestParam(required = false) Integer offset,
        @RequestParam(required = false) String sort // This value only can be "fountAt" (default) or "title" 업로드 날짜 순 / 이름순
    ) {
        JSONArray result = new JSONArray();
        this.lostItemService.getAllLostItems().forEach(item -> result.put(item.toJson()));
        return ResponseEntity.ok(result.toString());
    }
}
