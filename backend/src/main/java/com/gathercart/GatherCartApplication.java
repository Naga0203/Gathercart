package com.gathercart;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class GatherCartApplication {

    static {
        loadDotenv();
    }

    public static void loadDotenv() {
        try {
            String dir = Files.exists(Path.of(".env"))
                    ? "."
                    : (Files.exists(Path.of("backend/.env")) ? "backend" : ".");
            Dotenv dotenv = Dotenv.configure()
                    .directory(dir)
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception ignored) {
            // Fall back to system properties / application.yml defaults
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(GatherCartApplication.class, args);
    }
}
