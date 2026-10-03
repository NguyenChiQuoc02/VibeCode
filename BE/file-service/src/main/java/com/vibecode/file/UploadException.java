package com.vibecode.file;

import org.springframework.http.HttpStatus;

public class UploadException extends RuntimeException {
    private final HttpStatus status;

    public UploadException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
