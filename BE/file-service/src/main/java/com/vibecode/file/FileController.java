package com.vibecode.file;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/** Nhận file từ FE và đẩy lên Cloudinary. Khóa API chỉ nằm ở server, FE nhận lại URL công khai. */
@RestController
@RequestMapping("/api/files")
public class FileController {

    private final CloudinaryStorage storage;

    public FileController(CloudinaryStorage storage) {
        this.storage = storage;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(storage.upload(file));
    }

    @ExceptionHandler(UploadException.class)
    public ResponseEntity<Map<String, String>> handle(UploadException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> tooLarge() {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of("message", "File vượt quá dung lượng cho phép (tối đa 100MB)"));
    }
}
