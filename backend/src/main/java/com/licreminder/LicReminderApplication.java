package com.licreminder;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LicReminderApplication {

    public static void main(String[] args) {
        SpringApplication.run(LicReminderApplication.class, args);
    }
}
