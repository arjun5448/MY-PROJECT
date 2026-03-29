package com.licreminder.service;

import com.licreminder.dto.ClientRequest;
import com.licreminder.dto.ClientResponse;
import com.licreminder.entity.Client;
import com.licreminder.entity.User;
import com.licreminder.repository.ClientRepository;
import com.licreminder.repository.NotificationLogRepository;
import com.licreminder.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final UserRepository userRepository;

    public ClientService(
            ClientRepository clientRepository,
            NotificationLogRepository notificationLogRepository,
            UserRepository userRepository) {
        this.clientRepository = clientRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.userRepository = userRepository;
    }

    public List<ClientResponse> getClientsByUserId(Long userId, Long requesterId) {
        validateOwnership(userId, requesterId);
        return clientRepository.findByUserIdOrderByNameAsc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ClientResponse addClient(Long userId, Long requesterId, ClientRequest request) {
        User user = validateOwnership(userId, requesterId);

        if (clientRepository.existsByPolicyNumber(request.getPolicyNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Policy number already exists");
        }

        Client client = new Client();
        applyRequest(client, request);
        client.setUser(user);

        return mapToResponse(clientRepository.save(client));
    }

    public ClientResponse updateClient(Long clientId, Long requesterId, ClientRequest request) {
        Client client = getClientForUser(clientId, requesterId);

        if (clientRepository.existsByPolicyNumberAndIdNot(request.getPolicyNumber().trim(), clientId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Policy number already exists");
        }

        applyRequest(client, request);
        return mapToResponse(clientRepository.save(client));
    }

    @Transactional
    public void deleteClient(Long clientId, Long requesterId) {
        Client client = getClientForUser(clientId, requesterId);
        notificationLogRepository.deleteAllByClientId(clientId);
        clientRepository.delete(client);
    }

    public Client getOwnedClient(Long clientId, Long requesterId) {
        return getClientForUser(clientId, requesterId);
    }

    public ClientResponse markClientAsPaid(Long clientId, Long requesterId) {
        Client client = getClientForUser(clientId, requesterId);
        client.setLastPaidDate(LocalDate.now());
        return mapToResponse(clientRepository.save(client));
    }

    private User validateOwnership(Long userId, Long requesterId) {
        if (!userId.equals(requesterId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can access only your own data");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Client getClientForUser(Long clientId, Long requesterId) {
        ensureRequesterExists(requesterId);
        return clientRepository.findByIdAndUserId(clientId, requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found"));
    }

    private void ensureRequesterExists(Long requesterId) {
        if (!userRepository.existsById(requesterId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    private void applyRequest(Client client, ClientRequest request) {
        client.setName(request.getName().trim());
        client.setPhone(request.getPhone().trim());
        client.setPolicyNumber(request.getPolicyNumber().trim());
        client.setPremiumAmount(request.getPremiumAmount());
        client.setPremiumCycle(request.getPremiumCycle().trim().toUpperCase());
        client.setLastPaidDate(request.getLastPaidDate());
    }

    private ClientResponse mapToResponse(Client client) {
        ClientResponse response = new ClientResponse();
        response.setId(client.getId());
        response.setName(client.getName());
        response.setPhone(client.getPhone());
        response.setPolicyNumber(client.getPolicyNumber());
        response.setPremiumAmount(client.getPremiumAmount());
        response.setPremiumCycle(client.getPremiumCycle());
        response.setLastPaidDate(client.getLastPaidDate());
        response.setUserId(client.getUser().getId());
        return response;
    }
}
