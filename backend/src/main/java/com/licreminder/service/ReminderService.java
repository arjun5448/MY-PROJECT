package com.licreminder.service;

import com.licreminder.dto.ReminderResponse;
import com.licreminder.entity.Client;
import com.licreminder.entity.NotificationLog;
import com.licreminder.repository.ClientRepository;
import com.licreminder.repository.NotificationLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

@Service
public class ReminderService {

    private static final String TYPE_MANUAL = "MANUAL";
    private static final String TYPE_AUTO_DUE = "AUTO_DUE";
    private static final String TYPE_AUTO_OVERDUE = "AUTO_OVERDUE";

    private final ClientService clientService;
    private final ClientRepository clientRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${notification.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${notification.sms.account-sid:}")
    private String accountSid;

    @Value("${notification.sms.auth-token:}")
    private String authToken;

    @Value("${notification.sms.from-number:}")
    private String fromNumber;

    @Value("${notification.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${notification.email.to:}")
    private String emailTo;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public ReminderService(
            ClientService clientService,
            ClientRepository clientRepository,
            NotificationLogRepository notificationLogRepository,
            JavaMailSender mailSender) {
        this.clientService = clientService;
        this.clientRepository = clientRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.mailSender = mailSender;
    }

    public ReminderResponse sendManualReminder(Long clientId, Long requesterId) {
        Client client = clientService.getOwnedClient(clientId, requesterId);
        return sendReminder(client, TYPE_MANUAL, buildReminderMessage(client));
    }

    @Scheduled(cron = "${notification.sms.schedule:0 0 9 * * *}", zone = "${app.timezone:Asia/Calcutta}")
    public void sendAutomaticReminders() {
        if (!isSmsConfigured() && !isEmailConfigured()) {
            return;
        }

        List<Client> clients = clientRepository.findAll();
        LocalDate today = LocalDate.now();

        for (Client client : clients) {
            PremiumSnapshot premiumSnapshot = getPremiumSnapshot(client);

            if ("due".equals(premiumSnapshot.status())
                    && shouldSendAutomaticReminder(client.getId(), TYPE_AUTO_DUE, today)) {
                sendReminder(client, TYPE_AUTO_DUE, buildReminderMessage(client));
            }

            if ("overdue".equals(premiumSnapshot.status())
                    && shouldSendAutomaticReminder(client.getId(), TYPE_AUTO_OVERDUE, today)) {
                sendReminder(client, TYPE_AUTO_OVERDUE, buildOverdueMessage(client, premiumSnapshot.nextDueDate()));
            }
        }
    }

    private boolean shouldSendAutomaticReminder(Long clientId, String notificationType, LocalDate today) {
        return !notificationLogRepository.existsByClientIdAndNotificationTypeAndNotificationDate(
                clientId,
                notificationType,
                today
        );
    }

    private ReminderResponse sendReminder(Client client, String notificationType, String message) {
        LocalDateTime sentAt = LocalDateTime.now();
        String responseMessage = "Reminder logged. Configure email or SMS to send notifications.";
        String deliveryStatus = "CONFIG_REQUIRED";

        if (isSmsConfigured()) {
            sendSms(client.getPhone(), message);
            responseMessage = "Reminder sent successfully by SMS";
            deliveryStatus = "SENT_SMS";
        } else if (isEmailConfigured()) {
            sendEmail(client, message);
            responseMessage = "Reminder sent successfully by email";
            deliveryStatus = "SENT_EMAIL";
        }

        NotificationLog log = new NotificationLog();
        log.setClient(client);
        log.setPhone(client.getPhone());
        log.setNotificationType(notificationType);
        log.setDeliveryStatus(deliveryStatus);
        log.setMessageBody(message);
        log.setNotificationDate(sentAt.toLocalDate());
        log.setSentAt(sentAt);
        notificationLogRepository.save(log);

        ReminderResponse response = new ReminderResponse();
        response.setClientId(client.getId());
        response.setClientName(client.getName());
        response.setPhone(client.getPhone());
        response.setNotificationType(notificationType);
        response.setDeliveryStatus(log.getDeliveryStatus());
        response.setMessage(responseMessage);
        response.setSentAt(sentAt);
        return response;
    }

    private boolean isSmsConfigured() {
        return smsEnabled
                && !accountSid.isBlank()
                && !authToken.isBlank()
                && !fromNumber.isBlank();
    }

    private boolean isEmailConfigured() {
        return emailEnabled
                && !emailTo.isBlank()
                && !mailFrom.isBlank();
    }

    private void sendSms(String toPhoneNumber, String messageBody) {
        String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set(HttpHeaders.AUTHORIZATION, buildBasicAuthHeader());

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("To", toPhoneNumber);
        body.add("From", fromNumber);
        body.add("Body", messageBody);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("SMS delivery failed");
        }
    }

    private void sendEmail(Client client, String messageBody) {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(emailTo);
        mailMessage.setFrom(mailFrom);
        mailMessage.setSubject("LIC Reminder - " + client.getName() + " - " + client.getPolicyNumber());
        mailMessage.setText(messageBody + System.lineSeparator() + System.lineSeparator()
                + "Client phone: " + client.getPhone());
        mailSender.send(mailMessage);
    }

    private String buildBasicAuthHeader() {
        String credentials = accountSid + ":" + authToken;
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    private String buildReminderMessage(Client client) {
        PremiumSnapshot premiumSnapshot = getPremiumSnapshot(client);
        return "LIC Reminder: Dear " + client.getName()
                + ", your policy " + client.getPolicyNumber()
                + " has a premium of Rs. " + formatAmount(client.getPremiumAmount())
                + " due on " + premiumSnapshot.nextDueDate()
                + ". Please pay on time to keep the policy active.";
    }

    private String buildOverdueMessage(Client client, LocalDate nextDueDate) {
        return "LIC Reminder: Dear " + client.getName()
                + ", your policy " + client.getPolicyNumber()
                + " premium of Rs. " + formatAmount(client.getPremiumAmount())
                + " was due on " + nextDueDate
                + ". Please pay immediately to avoid interruption.";
    }

    private String formatAmount(BigDecimal amount) {
        return amount.stripTrailingZeros().toPlainString();
    }

    private PremiumSnapshot getPremiumSnapshot(Client client) {
        int monthsToAdd = switch (client.getPremiumCycle()) {
            case "QUARTERLY" -> 3;
            case "HALF_YEARLY" -> 6;
            case "YEARLY" -> 12;
            default -> 1;
        };

        LocalDate nextDueDate = client.getLastPaidDate().plusMonths(monthsToAdd);
        long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), nextDueDate);

        String status;
        if (nextDueDate.isBefore(LocalDate.now())) {
            status = "overdue";
        } else if (daysUntilDue <= 7) {
            status = "due";
        } else {
            status = "upcoming";
        }

        return new PremiumSnapshot(nextDueDate, status);
    }

    private record PremiumSnapshot(LocalDate nextDueDate, String status) {
    }
}
