package com.gathercart.service;

import com.gathercart.entity.FulfillmentType;
import com.gathercart.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PricingCalculationService {

    public static final BigDecimal BASE_DELIVERY_FEE = new BigDecimal("40.00");
    public static final BigDecimal RATE_PER_KG = new BigDecimal("10.00");
    public static final BigDecimal DEFAULT_VENDOR_COST_FACTOR = new BigDecimal("0.70");
    public static final BigDecimal MIN_VENDOR_MARKUP = new BigDecimal("1.05");

    public record DeliveryItemSpec(int quantity, BigDecimal unitWeightKg) {}

    public BigDecimal calculateDiscountPercent(int quantity) {
        if (quantity < 1 || quantity > 25) {
            throw new BusinessException("Order quantity must be between 1 and 25 units per item");
        }
        if (quantity < 5) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        // 4.0 + (quantity - 5) * 0.8
        BigDecimal step = BigDecimal.valueOf(quantity - 5).multiply(new BigDecimal("0.8"));
        return new BigDecimal("4.0").add(step).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateEffectiveUnitPrice(BigDecimal mrp, BigDecimal vendorCostPrice, int quantity) {
        BigDecimal discountPercent = calculateDiscountPercent(quantity);
        BigDecimal discountFactor = BigDecimal.ONE.subtract(
                discountPercent.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
        );
        BigDecimal discountedPrice = mrp.multiply(discountFactor).setScale(2, RoundingMode.HALF_UP);

        BigDecimal effectiveVendorCost = (vendorCostPrice != null && vendorCostPrice.compareTo(BigDecimal.ZERO) > 0)
                ? vendorCostPrice
                : mrp.multiply(DEFAULT_VENDOR_COST_FACTOR);

        BigDecimal priceFloor = effectiveVendorCost.multiply(MIN_VENDOR_MARKUP).setScale(2, RoundingMode.HALF_UP);

        return discountedPrice.max(priceFloor);
    }

    public BigDecimal calculateDeliveryFee(FulfillmentType fulfillmentType, List<DeliveryItemSpec> items) {
        if (fulfillmentType == null || fulfillmentType == FulfillmentType.STORE_PICKUP) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal extraFee = BigDecimal.ZERO;
        if (items != null) {
            for (DeliveryItemSpec item : items) {
                BigDecimal weight = (item.unitWeightKg() != null && item.unitWeightKg().compareTo(BigDecimal.ZERO) > 0)
                        ? item.unitWeightKg()
                        : BigDecimal.ONE;
                BigDecimal itemDelivery = BigDecimal.valueOf(item.quantity())
                        .multiply(weight)
                        .multiply(RATE_PER_KG);
                extraFee = extraFee.add(itemDelivery);
            }
        }

        return BASE_DELIVERY_FEE.add(extraFee).setScale(2, RoundingMode.HALF_UP);
    }
}

