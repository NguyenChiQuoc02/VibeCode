"use client";

import NextLink from "next/link";
import { Box, Button, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { AUTO } from "@/components/cars/theme";
import { Car } from "@/lib/api";
import { carImage, formatCarPrice } from "@/lib/carFormat";

/** Thẻ xe: ảnh, nhãn "Bán chạy" cho xe nổi bật, tên, phân khúc, giá và nút chi tiết. */
export default function CarCard({ car }: { car: Car }) {
  const sub = [car.bodyType, car.year].filter(Boolean).join(" · ");
  return (
    <Box
      component={NextLink}
      href={`/cars/${car.id}`}
      sx={{ display: "block", bgcolor: "#fff", borderRadius: `${AUTO.radius}px`, overflow: "hidden", textDecoration: "none", color: "inherit", border: `1px solid ${AUTO.line}`, boxShadow: AUTO.shadow, transition: "transform .25s, box-shadow .25s", "&:hover": { transform: "translateY(-4px)", boxShadow: AUTO.shadowHover }, "&:hover img": { transform: "scale(1.05)" } }}
    >
      <Box sx={{ position: "relative", height: 170, overflow: "hidden", bgcolor: "#EEF0F3", display: "grid", placeItems: "center" }}>
        {car.urlImage ? (
          <Box component="img" src={carImage(car, 600)} alt={car.name} loading="lazy" referrerPolicy="no-referrer" sx={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }} />
        ) : (
          <DirectionsCarIcon sx={{ fontSize: 56, color: "#C5CAD3" }} />
        )}
        {car.featured && <Box sx={{ position: "absolute", top: 10, left: 10, px: 1, py: 0.25, borderRadius: 1, fontSize: 10.5, fontWeight: 700, color: "#fff", bgcolor: AUTO.red }}>Bán chạy</Box>}
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.35, color: AUTO.ink, height: 39, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{car.name}</Typography>
        <Typography sx={{ fontSize: 12, color: AUTO.muted, mt: 0.25, minHeight: 18 }}>{sub}</Typography>
        <Typography sx={{ fontSize: 12.5, mt: 1.25, color: AUTO.ink }}>
          <Box component="span" sx={{ color: AUTO.muted, fontSize: 11 }}>
            {car.priceEstimated ? "Ước tính " : "Từ "}
          </Box>
          <Box component="span" sx={{ fontWeight: 700 }}>{formatCarPrice(car.price)}</Box>
        </Typography>
        <Button size="small" variant="contained" endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />} sx={{ mt: 1.5, borderRadius: 5, bgcolor: AUTO.ink, boxShadow: "none", px: 2, fontSize: 12, "&:hover": { bgcolor: AUTO.red, boxShadow: "none" } }}>
          Chi tiết
        </Button>
      </Box>
    </Box>
  );
}
