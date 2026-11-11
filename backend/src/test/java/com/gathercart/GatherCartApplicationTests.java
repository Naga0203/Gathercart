package com.gathercart;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import javax.sql.DataSource;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/postgres",
    "spring.datasource.driver-class-name=org.postgresql.Driver",
    "spring.jpa.hibernate.ddl-auto=none"
})
class GatherCartApplicationTests {

    @MockBean
    private DataSource dataSource;

    @Test
    void contextLoads() {
        // Confirms Spring Boot application context bootstraps cleanly
    }
}
