package com.licreminder.controller;

import com.licreminder.dto.ApiResponse;
import com.licreminder.dto.ClientRequest;
import com.licreminder.dto.ClientResponse;
import com.licreminder.dto.ReminderResponse;
import com.licreminder.service.ClientService;
import com.licreminder.service.ReminderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;
    private final ReminderService reminderService;

    public ClientController(ClientService clientService, ReminderService reminderService) {
        this.clientService = clientService;
        this.reminderService = reminderService;
    }

    @GetMapping("/{userId}")
    public List<ClientResponse> getClientsByUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long requesterId) {
        return clientService.getClientsByUserId(userId, requesterId);
    }

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ClientResponse addClient(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long requesterId,
            @Valid @RequestBody ClientRequest request) {
        return clientService.addClient(userId, requesterId, request);
    }

    @PutMapping("/{id}")
    public ClientResponse updateClient(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long requesterId,
            @Valid @RequestBody ClientRequest request) {
        return clientService.updateClient(id, requesterId, request);
    }

    @DeleteMapping("/{id}")
    public ApiResponse deleteClient(@PathVariable Long id, @RequestHeader("X-User-Id") Long requesterId) {
        clientService.deleteClient(id, requesterId);
        return new ApiResponse("Client deleted successfully");
    }

    @PostMapping("/{id}/reminder")
    public ReminderResponse sendReminder(@PathVariable Long id, @RequestHeader("X-User-Id") Long requesterId) {
        return reminderService.sendManualReminder(id, requesterId);
    }

    @PutMapping("/{id}/mark-paid")
    public ClientResponse markPaid(@PathVariable Long id, @RequestHeader("X-User-Id") Long requesterId) {
        return clientService.markClientAsPaid(id, requesterId);
    }
}
