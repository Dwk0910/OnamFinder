package org.neatore.onamfinder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LostItemRepository extends JpaRepository<LostItem, UUID> {

}
