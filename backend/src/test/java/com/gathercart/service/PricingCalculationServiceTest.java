package com.gathercart.service;

import com.gathercart.entity.FulfillmentType;
import com.gathercart.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PricingCalculationServiceTest {

    private PricingCalculationService pricingService;

    @BeforeEach
    void setUp() {
        pricingService = new PricingCalculationService();
    }

    @Test
    @DisplayName("Quantities 1 to 4 should have 0% discount")
    void testRetailQuantitiesHaveZeroDiscount() {
        assertEquals(new BigDecimal("0.00"), pricingService.calculateDiscountPercent(1));
        assertEquals(new BigDecimal("0.00"), pricingService.calculateDiscountPercent(4));
    }

    @Test
    @DisplayName("Quantity 5 should have 4% discount and 25 should have 20% discount")
    void testWholesaleQuantitiesDiscountCurve() {
        assertEquals(new BigDecimal("4.00"), pricingService.calculateDiscountPercent(5));
        assertEquals(new BigDecimal("8.00"), pricingService.calculateDiscountPercent(10));
        assertEquals(new BigDecimal("12.00"), pricingService.calculateDiscountPercent(15));
        assertEquals(new BigDecimal("16.00"), pricingService.calculateDiscountPercent(20));
        assertEquals(new BigDecimal("20.00"), pricingService.calculateDiscountPercent(25));
    }

    @Test
    @DisplayName("Invalid quantities below 1 or above 25 should throw BusinessException")
    void testInvalidQuantitiesThrowException() {
        assertThrows(BusinessException.class, () -> pricingService.calculateDiscountPercent(0));
        assertThrows(BusinessException.class, () -> pricingService.calculateDiscountPercent(26));
    }

    @Test
    @DisplayName("Vendor cost floor prevents unit price from dropping below vendorCost * 1.05")
    void testVendorFloorProtection() {
        BigDecimal mrp = new BigDecimal("100.00");
        BigDecimal vendorCost = new BigDecimal("85.00"); // 85 * 1.05 = 89.25 floor
        // 20% discount would give 80.00, but floor is 89.25
        BigDecimal price = pricingService.calculateEffectiveUnitPrice(mrp, vendorCost, 25);
        assertEquals(new BigDecimal("89.25"), price);
    }

    @Test
    @DisplayName("Store pickup delivery fee is always 0")
    void testStorePickupIsFree() {
        PricingCalculationService.DeliveryItemSpec item = new PricingCalculationService.DeliveryItemSpec(5, new BigDecimal("2.0"));
        BigDecimal fee = pricingService.calculateDeliveryFee(FulfillmentType.STORE_PICKUP, List.of(item));
        assertEquals(new BigDecimal("0.00"), fee);
    }

    @Test
    @DisplayName("Home delivery fee computes base fee + quantity * weight * 10")
    void testHomeDeliveryFee() {
        // Base: 40 + (5 * 2.0 * 10) = 40 + 100 = 140.00
        PricingCalculationService.DeliveryItemSpec item = new PricingCalculationService.DeliveryItemSpec(5, new BigDecimal("2.0"));
        BigDecimal fee = pricingService.calculateDeliveryFee(FulfillmentType.HOME_DELIVERY, List.of(item));
        assertEquals(new BigDecimal("140.00"), fee);
    }
}

