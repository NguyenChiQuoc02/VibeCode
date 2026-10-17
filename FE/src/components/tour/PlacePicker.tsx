"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Box, Chip, CircularProgress, TextField, Typography } from "@mui/material";
import { PlaceRef } from "@/lib/api";

interface Props {
  label: string;
  value: PlaceRef[];
  onChange: (value: PlaceRef[]) => void;
  /** Tìm địa điểm theo từ khóa (gọi API, chỉ trả vài chục kết quả đầu). */
  search: (q: string) => Promise<PlaceRef[]>;
}

/** Ô chọn nhiều địa điểm, tìm trên server theo từ khóa (dữ liệu có hàng nghìn bản ghi nên không tải hết). */
export default function PlacePicker({ label, value, onChange, search }: Props) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<PlaceRef[]>([]);
  const [loading, setLoading] = useState(false);

  // Tìm sau khi ngừng gõ 300ms.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      search(input.trim())
        .then((r) => !cancelled && setOptions(r))
        .catch(() => !cancelled && setOptions([]))
        .finally(() => !cancelled && setLoading(false));
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return (
    <Autocomplete
      multiple
      value={value}
      options={options}
      loading={loading}
      filterOptions={(x) => x}
      filterSelectedOptions
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={(o) => o.name}
      onChange={(_, v) => onChange(v)}
      inputValue={input}
      onInputChange={(_, v, reason) => reason !== "reset" && setInput(v)}
      noOptionsText="Không tìm thấy"
      loadingText="Đang tìm..."
      renderTags={(tags, getTagProps) => tags.map((t, i) => <Chip {...getTagProps({ index: i })} key={t.id} size="small" label={t.name} />)}
      renderOption={(props, o) => (
        <Box component="li" {...props} key={o.id} sx={{ display: "block !important" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {o.name}
          </Typography>
          {o.address && (
            <Typography variant="caption" color="text.secondary">
              {o.address}
            </Typography>
          )}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Gõ tên để tìm..."
          InputProps={{ ...params.InputProps, endAdornment: (<>{loading ? <CircularProgress size={16} /> : null}{params.InputProps.endAdornment}</>) }}
        />
      )}
    />
  );
}
