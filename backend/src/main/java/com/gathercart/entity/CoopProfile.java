package com.gathercart.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coop_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoopProfile extends BaseEntity {

    @Column(name = "coop_id_code", nullable = false, unique = true, length = 50)
    private String coopIdCode;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "location", length = 300)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "vpa", length = 100)
    private String vpa;

    @Column(name = "bank_name", length = 100)
    private String bankName;
}

