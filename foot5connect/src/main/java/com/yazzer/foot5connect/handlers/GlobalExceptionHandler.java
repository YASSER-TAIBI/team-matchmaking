package com.yazzer.foot5connect.handlers;

import com.yazzer.foot5connect.exceptions.ObjectValidationException;
import com.yazzer.foot5connect.exceptions.OperationNonPermittedException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ObjectValidationException.class)
    public ResponseEntity<ExceptionRepresentation> handleException(ObjectValidationException exeption) {
        ExceptionRepresentation representation = ExceptionRepresentation.builder()
                .errorMessage("Object not valid exception has occured")
                .errorSource(exeption.getViolationSource())
                .validationErrors(exeption.getViolations())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(representation);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ExceptionRepresentation> handleException(EntityNotFoundException exeption) {
        ExceptionRepresentation representation = ExceptionRepresentation.builder()
                .errorMessage(exeption.getMessage())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(representation);
    }

    @ExceptionHandler(OperationNonPermittedException.class)
    public ResponseEntity<ExceptionRepresentation> handleException(OperationNonPermittedException exeption) {
        ExceptionRepresentation representation = ExceptionRepresentation.builder()
                .errorMessage(exeption.getErrorMsg())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(representation);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ExceptionRepresentation> handleException() {
        ExceptionRepresentation representation = ExceptionRepresentation.builder()
                .errorMessage("A user already exists with the provided email")
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(representation);
    }

    @ExceptionHandler(DisabledException.class) // l’authentification est rejetée parce que le compte est désactivé
    public ResponseEntity<ExceptionRepresentation> handleDisabledException() {
        ExceptionRepresentation representation = ExceptionRepresentation.builder()
                .errorMessage("You cannot access your account because it is not yet activated")
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(representation);
    }

    @ExceptionHandler(BadCredentialsException.class) // l’authentification est rejetée parce que les informations d’identification ne sont pas valides
    public ResponseEntity<ExceptionRepresentation> handleBadCredentialsException() {
        ExceptionRepresentation representation = ExceptionRepresentation.builder()
                .errorMessage("Votre adresse e-mail et/ou votre mot de passe est incorrect.")
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(representation);
    }
}
