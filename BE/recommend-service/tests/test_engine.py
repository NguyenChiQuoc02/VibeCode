from datetime import date, timedelta

import pytest

from app.engine import Model, TourInfo

TODAY = date(2026, 10, 4)
FUTURE = (TODAY + timedelta(days=30)).isoformat()


def tour(id, places=(), price=1_000_000, days=3, status="OPEN", booked=0, seats=20, rating=0.0, reviews=0, start=FUTURE):
    return TourInfo.from_api(
        {
            "id": id,
            "name": f"Tour {id}",
            "price": price,
            "durationDays": days,
            "startDate": start,
            "status": status,
            "maxParticipants": seats,
            "bookedSeats": booked,
            "avgRating": rating,
            "reviewCount": reviews,
            "destinationIds": list(places),
            "landmarkIds": [],
        }
    )


def booking(email, tour_id, status="REGISTERED", review=False):
    return {"userEmail": email, "tourId": tour_id, "status": status, "hasReview": review}


def ids(recs):
    return [r.tour.id for r in recs]


def test_similar_cung_diem_den_xep_truoc_khi_chua_co_du_lieu_dang_ky():
    tours = [tour("a", {"hue", "danang"}), tour("b", {"hue"}), tour("c", {"sapa"}, price=9_000_000)]
    m = Model(tours, [], today=TODAY)
    recs = m.similar("a", 5)
    assert ids(recs)[0] == "b"
    assert "Cùng điểm đến" in recs[0].reasons


def test_similar_khong_tra_chinh_no_va_bo_tour_khong_the_dat():
    tours = [
        tour("a", {"x"}),
        tour("closed", {"x"}, status="CLOSED"),
        tour("past", {"x"}, start=(TODAY - timedelta(days=1)).isoformat()),
        tour("full", {"x"}, booked=20, seats=20),
        tour("ok", {"x"}),
    ]
    assert ids(Model(tours, [], today=TODAY).similar("a", 10)) == ["ok"]


def test_similar_tour_khong_ton_tai_nem_keyerror():
    with pytest.raises(KeyError):
        Model([tour("a")], [], today=TODAY).similar("zzz", 3)


def test_loc_cong_tac_khach_dat_a_cung_dat_c():
    # a và b cùng nội dung, nhưng nhiều khách đặt cả a lẫn c nên c phải được đẩy lên.
    tours = [tour("a", {"p"}), tour("b", {"p"}), tour("c", {"q"}, price=8_000_000, days=9)]
    bookings = [booking(f"u{i}@x.com", t) for i in range(5) for t in ("a", "c")]
    recs = Model(tours, bookings, cf_weight=0.9, today=TODAY).similar("a", 2)
    assert ids(recs)[0] == "c"
    assert "Khách đặt tour này cũng đặt" in recs[0].reasons


def test_dang_ky_da_huy_khong_tinh():
    tours = [tour("a"), tour("b")]
    m = Model(tours, [booking("u@x.com", "a", "CANCELLED")], today=TODAY)
    assert m.history == {}


def test_for_user_goi_y_theo_lich_su_va_bo_tour_da_dat():
    tours = [tour("a", {"p"}), tour("b", {"p"}), tour("c", {"zzz"}, price=9_000_000, days=10)]
    m = Model(tours, [booking("An@X.com", "a")], today=TODAY)
    recs = m.for_user("an@x.com", 5)  # không phân biệt hoa thường
    assert "a" not in ids(recs)
    assert ids(recs)[0] == "b"
    assert recs[0].reasons == ["Vì bạn đã đặt Tour a"]


def test_for_user_moi_chua_co_lich_su_nhan_tour_pho_bien():
    tours = [tour("a", booked=1), tour("hot", booked=15, rating=4.8, reviews=20)]
    recs = Model(tours, [], today=TODAY).for_user("moi@x.com", 5)
    assert ids(recs)[0] == "hot"
    assert "Đang được quan tâm" in recs[0].reasons


def test_popular_lam_muot_diem_danh_gia_it():
    # 1 đánh giá 5 sao không được vượt tour 50 đánh giá 4.7 sao cùng lượt đặt.
    tours = [tour("lucky", booked=5, rating=5.0, reviews=1), tour("solid", booked=5, rating=4.7, reviews=50)]
    assert ids(Model(tours, [], today=TODAY).popular(2))[0] == "solid"


def test_du_lieu_rong_khong_loi():
    m = Model([], [], today=TODAY)
    assert m.popular(5) == []
    assert m.for_user("a@x.com", 5) == []


def test_dia_ly_tour_gan_nhau_xep_truoc_khi_khong_co_diem_den_chung():
    # Hai tour khác điểm đến nhưng gần nhau (Huế - Đà Nẵng) phải hơn tour ở xa (Cà Mau), dù giá giống nhau.
    tours = [tour("hue", {"p_hue"}), tour("danang", {"p_dn"}), tour("camau", {"p_cm"})]
    geo = {"p_hue": (16.46, 107.59), "p_dn": (16.05, 108.20), "p_cm": (9.18, 105.15)}
    recs = Model(tours, [], geo=geo, today=TODAY).similar("hue", 2)
    assert ids(recs) == ["danang", "camau"]
    assert "Gần khu vực này" in recs[0].reasons


def test_tin_hieu_hanh_vi_dua_vao_goi_y_nhung_khong_loai_tour_chi_xem():
    tours = [tour("a", {"p"}), tour("b", {"p"}), tour("c", {"zzz"}, price=9_000_000, days=10)]
    signals = [{"email": "An@x.com", "tourId": "a", "type": "FAVORITE_TOUR", "count": 1}, {"email": "an@x.com", "tourId": "b", "type": "VIEW_TOUR", "count": 5}]
    m = Model(tours, [], signals=signals, today=TODAY)
    recs = m.for_user("an@x.com", 5)
    assert "b" in ids(recs)  # chỉ xem, chưa đặt nên vẫn được gợi ý
    assert recs[0].reasons == ["Vì bạn đã quan tâm Tour a"]


def test_tin_hieu_bi_chan_tren_va_bo_qua_loai_la():
    tours = [tour("a")]
    signals = [{"email": "u@x.com", "tourId": "a", "type": "VIEW_TOUR", "count": 1000}, {"email": "u@x.com", "tourId": "a", "type": "XYZ", "count": 9}]
    m = Model(tours, [], signals=signals, today=TODAY)
    assert m.history["u@x.com"]["a"] == pytest.approx(0.9)  # 3 lượt xem tối đa x 0.3


def test_dia_diem_lan_can_sap_theo_khoang_cach_va_loai_chinh_no():
    from app.places import Place, PlaceIndex

    idx = PlaceIndex(
        [
            Place("hue", "destination", "Huế", None, None, 16.46, 107.59),
            Place("lang_co", "destination", "Lăng Cô", None, None, 16.23, 108.06),
            Place("hoian", "landmark", "Hội An", None, None, 15.88, 108.33),
            Place("hanoi", "destination", "Hà Nội", None, None, 21.03, 105.85),
        ]
    )
    near = idx.nearby(16.46, 107.59, limit=5, radius_km=150, exclude_id="hue")
    assert [p.id for p, _ in near] == ["lang_co", "hoian"]
    assert near[0][1] < near[1][1]
