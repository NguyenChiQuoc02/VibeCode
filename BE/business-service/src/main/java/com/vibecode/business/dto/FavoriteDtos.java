package com.vibecode.business.dto;

import java.time.Instant;

public final class FavoriteDtos {

    private FavoriteDtos() {
    }

    /** Mục yêu thích kèm thông tin hiển thị của đối tượng được yêu thích. price chỉ có với tour. */
    public record FavoriteView(String type, String targetId, String name, String image, String subtitle, Long price, Instant createdAt) {
    }
}
