package com.gathercart.common;

import jakarta.persistence.MappedSuperclass;

/**
 * Re-export of BaseEntity in common package for backward compatibility.
 * Prefer using {@link com.gathercart.entity.BaseEntity} for entities.
 */
@MappedSuperclass
public abstract class BaseEntity extends com.gathercart.entity.BaseEntity {
}
