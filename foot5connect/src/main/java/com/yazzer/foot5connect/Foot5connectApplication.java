package com.yazzer.foot5connect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class Foot5connectApplication {

	public static void main(String[] args) {
		SpringApplication.run(Foot5connectApplication.class, args);
	}

}
