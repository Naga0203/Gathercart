package com.gathercart.config;

import com.gathercart.entity.Category;
import com.gathercart.entity.CoopProfile;
import com.gathercart.entity.Product;
import com.gathercart.entity.ProductImage;
import com.gathercart.repository.CategoryRepository;
import com.gathercart.repository.CoopProfileRepository;
import com.gathercart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final CoopProfileRepository coopProfileRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            seedData();
        } else {
            log.info("Database already seeded with {} products.", productRepository.count());
        }
    }

    private void seedData() {
        log.info("Seeding initial categories, co-op profiles, and products into database...");

        // 1. Categories
        Category riceCategory = Category.builder()
                .name("Rice & Grains")
                .icon("🌾")
                .displayOrder(1)
                .isActive(true)
                .build();

        Category oilCategory = Category.builder()
                .name("Cold Pressed Oils")
                .icon("🫒")
                .displayOrder(2)
                .isActive(true)
                .build();

        Category dalCategory = Category.builder()
                .name("Pulses & Dals")
                .icon("🫘")
                .displayOrder(3)
                .isActive(true)
                .build();

        Category nutsCategory = Category.builder()
                .name("Dry Fruits")
                .icon("🥜")
                .displayOrder(4)
                .isActive(true)
                .build();

        categoryRepository.saveAll(List.of(riceCategory, oilCategory, dalCategory, nutsCategory));

        // 2. Co-op Profiles
        CoopProfile raichurCoop = CoopProfile.builder()
                .coopIdCode("KA-RAI-048")
                .name("Raichur Farmer Producer Co-operative")
                .location("Tungabhadra Basin, Raichur District, Karnataka")
                .description("Cooperative representing 380 paddy farmers along the Tungabhadra river canal network.")
                .isVerified(true)
                .vpa("raichur.coop@okaxis")
                .bankName("Karnataka Grameena Bank")
                .build();

        CoopProfile salemCoop = CoopProfile.builder()
                .coopIdCode("TN-SAL-019")
                .name("Salem Oilseed Growers Co-op")
                .location("Shevaroy Foothills, Salem District, Tamil Nadu")
                .description("Multi-generation artisanal groundnut oil press collective using slow Mara Chekku.")
                .isVerified(true)
                .vpa("salemmill@okaxis")
                .bankName("Canara Bank")
                .build();

        CoopProfile kashmirCoop = CoopProfile.builder()
                .coopIdCode("JK-SOP-005")
                .name("Kashmir Valley Orchardists Federation")
                .location("Sopore & Baramulla Valleys, Jammu & Kashmir")
                .description("High-altitude orchardist union harvesting organic Kashmir walnuts and dry fruits.")
                .isVerified(true)
                .vpa("kashmirwalnut@okhdfcbank")
                .bankName("J&K Bank")
                .build();

        CoopProfile gulbargaCoop = CoopProfile.builder()
                .coopIdCode("KA-GUL-112")
                .name("Gulbarga Farmers Producer Co.")
                .location("Sedam Taluk, Kalaburagi District, Karnataka")
                .description("GI-tagged certified red gram pulses collective in Kalaburagi.")
                .isVerified(true)
                .vpa("gulbargatoor@okicici")
                .bankName("State Bank of India")
                .build();

        CoopProfile saurashtraCoop = CoopProfile.builder()
                .coopIdCode("GJ-RAJ-088")
                .name("Saurashtra Organic Dairy Co-op")
                .location("Gondal Taluk, Rajkot District, Gujarat")
                .description("Pure Gir cow Bilona ghee collective grazing in organic pastures of Saurashtra.")
                .isVerified(true)
                .vpa("coop.saurashtra@okhdfcbank")
                .bankName("HDFC Bank")
                .build();

        CoopProfile ratnagiriCoop = CoopProfile.builder()
                .coopIdCode("MH-RAT-021")
                .name("Ratnagiri Mango Growers Association")
                .location("Dapoli Coastal Belt, Ratnagiri, Maharashtra")
                .description("Geographical Indication (GI) certified Alphonso orchardists society.")
                .isVerified(true)
                .vpa("ratnagiricoop@oksbi")
                .bankName("Bank of Maharashtra")
                .build();

        coopProfileRepository.saveAll(List.of(raichurCoop, salemCoop, kashmirCoop, gulbargaCoop, saurashtraCoop, ratnagiriCoop));

        // 3. Products
        Product p1 = Product.builder()
                .name("Sona Masoori Raw Rice (Aged 12 Months)")
                .description("Aged 12 Months • Direct from Raichur Mills")
                .detailedDescription("This batch is authentic, single-estate Sona Masoori cultivated on the alluvial banks of the Tungabhadra River. It is naturally cured for twelve months in aerated dry storage to ensure optimum gelatinization, meaning fluffy, discrete grains that do not become mushy or sticky during pressure cooking.")
                .category(riceCategory)
                .coopProfile(raichurCoop)
                .unitLabel("10 kg bag")
                .unitWeightKg(new BigDecimal("10.00"))
                .mrp(new BigDecimal("850.00"))
                .groupPrice(new BigDecimal("649.00"))
                .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80")
                .isLabVerified(false)
                .isPesticideTested(true)
                .harvestDate("Nov 2023 (Naturally Aged)")
                .moistureLevel("< 11.8% (Optimal cook)")
                .grainType("Medium Raw (Aromatic & light)")
                .processing("Zero Wax (Single polish)")
                .culinaryProfile("Ideal Dishes: Everyday Steamed Rice, Sambar Rice, Lemon Rice, Curd Rice.\nWater-to-Rice Ratio: 1 : 2.5 (optimal tenderness after 3 cooker whistles).\nDigestibility: Light on the stomach with low starch stickiness, ideal for multi-generational families.")
                .qualityMetrics("Average Grain Length: 5.2 mm (Uncooked) / 9.8 mm (Cooked)\nBroken Grain Ratio: < 2.5% max\nArtificial Fragrances / Polish: None (Zero talc / paraffin free)\nPackaging Material: Double-stitched cotton-lined breathable bag")
                .isActive(true)
                .build();
        p1.addImage(ProductImage.builder()
                .imageUrl("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80")
                .displayOrder(1)
                .isVerified(true)
                .build());
        p1.addImage(ProductImage.builder()
                .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80")
                .displayOrder(2)
                .isVerified(true)
                .build());

        Product p2 = Product.builder()
                .name("Cold Pressed Groundnut Oil")
                .description("Wood Churned (Mara Chekku) • Salem Mills")
                .detailedDescription("Slow-pressed at under 42°C in traditional vaagai wood churns to preserve vital nutrients, natural aroma, and essential fatty acids. Unrefined, chemical-free, and unbleached.")
                .category(oilCategory)
                .coopProfile(salemCoop)
                .unitLabel("5 L tin can")
                .unitWeightKg(new BigDecimal("4.55"))
                .mrp(new BigDecimal("1250.00"))
                .groupPrice(new BigDecimal("990.00"))
                .imageUrl("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80")
                .isLabVerified(true)
                .isPesticideTested(true)
                .harvestDate("Jan 2024")
                .moistureLevel("< 0.2%")
                .grainType("Wood Churned Mara Chekku")
                .processing("Wood Cold-Pressed, Sedimentary Filtered")
                .culinaryProfile("Ideal Dishes: Traditional South Indian Tadka, Deep Frying, Sautéing, Chutneys.\nSmoke Point: High smoke point (approx 225°C) ideal for deep frying.")
                .qualityMetrics("Free Fatty Acids: < 0.8%\nPeroxide Value: < 2.0 meq/kg\nArtificial Colors / Preservatives: None")
                .isActive(true)
                .build();

        Product p3 = Product.builder()
                .name("Kashmiri Walnuts (In Shell)")
                .description("Kashmir Valley Harvest • 2 kg jute sack")
                .detailedDescription("Kagzi thin-shelled walnuts handpicked in organic orchards along the Jhelum river valley. Easy to crack by hand, high oil content, light amber kernels rich in Omega-3.")
                .category(nutsCategory)
                .coopProfile(kashmirCoop)
                .unitLabel("2 kg sack")
                .unitWeightKg(new BigDecimal("2.00"))
                .mrp(new BigDecimal("1800.00"))
                .groupPrice(new BigDecimal("1350.00"))
                .imageUrl("https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=1200&q=80")
                .isLabVerified(true)
                .isPesticideTested(true)
                .harvestDate("Oct 2023")
                .moistureLevel("< 5.0%")
                .grainType("Kagzi Thin Shell")
                .processing("Sun Dried, Zero Bleaching")
                .culinaryProfile("Ideal for daily morning consumption, soaked overnight, baking, and traditional Kashmiri preparations.")
                .qualityMetrics("Kernel Yield: > 48%\nOil Content: > 62%\nBleaching: 100% natural, chlorine-free")
                .isActive(true)
                .build();

        Product p4 = Product.builder()
                .name("Desi Toor Dal (Unpolished)")
                .description("Organic Certified • Gulbarga Farmers Producer Co.")
                .detailedDescription("GI-tagged Gulbarga red gram split pulse, naturally dried under Deccan sun without any synthetic oils, water polish, or artificial colouring agents.")
                .category(dalCategory)
                .coopProfile(gulbargaCoop)
                .unitLabel("5 kg pack")
                .unitWeightKg(new BigDecimal("5.00"))
                .mrp(new BigDecimal("900.00"))
                .groupPrice(new BigDecimal("720.00"))
                .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80")
                .isLabVerified(true)
                .isPesticideTested(true)
                .harvestDate("Dec 2023")
                .moistureLevel("< 10.5%")
                .grainType("Desi Small Grain")
                .processing("Unpolished, Sun-cured")
                .culinaryProfile("Ideal Dishes: Authentic Karnataka Bisi Bele Bath, South Indian Sambar, Dal Tadka, Rasam.")
                .qualityMetrics("Protein Content: 22.3 g / 100 g\nForeign Matter: < 0.1%\nCooking Time: 20 mins without soda")
                .isActive(true)
                .build();

        Product p5 = Product.builder()
                .name("A2 Gir Cow Bilona Ghee")
                .description("Traditional Curd Churned • Saurashtra Dairy")
                .detailedDescription("Crafted from pure whole curd of grass-fed indigenous Gir cows using slow bilona two-way wooden churning. Rich in A2 beta-casein with a golden granular aromatic texture.")
                .category(oilCategory)
                .coopProfile(saurashtraCoop)
                .unitLabel("1 L glass jar")
                .unitWeightKg(new BigDecimal("0.91"))
                .mrp(new BigDecimal("2400.00"))
                .groupPrice(new BigDecimal("1850.00"))
                .imageUrl("https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=1200&q=80")
                .isLabVerified(true)
                .isPesticideTested(true)
                .harvestDate("Feb 2024")
                .moistureLevel("< 0.3%")
                .grainType("A2 Vedic Bilona")
                .processing("Slow earthen chulha firewood simmered")
                .culinaryProfile("Ideal for direct drizzle on hot rice, roti, Ayurvedic concoctions, and sweets.")
                .qualityMetrics("A2 Beta-Casein: 100% Certified\nGranularity: Natural Danedar Texture\nPackaging: Food-grade amber glass jar")
                .isActive(true)
                .build();

        Product p6 = Product.builder()
                .name("Alphonso Mango Pulp (Natural)")
                .description("Ratnagiri Co-op • No Added Sugar")
                .detailedDescription("100% pure pulped fruit from hand-selected tree-ripened Ratnagiri Hapus mangoes. Sterile packed with zero citric acid, no refined sugar, and no synthetic preservatives.")
                .category(nutsCategory)
                .coopProfile(ratnagiriCoop)
                .unitLabel("6 × 850g tins")
                .unitWeightKg(new BigDecimal("5.10"))
                .mrp(new BigDecimal("1600.00"))
                .groupPrice(new BigDecimal("1190.00"))
                .imageUrl("https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=80")
                .isLabVerified(false)
                .isPesticideTested(true)
                .harvestDate("May 2024")
                .moistureLevel("Natural Brix 22-24°")
                .grainType("Ratnagiri Hapus")
                .processing("Flash Pasteurized, Vacuum Sealed")
                .culinaryProfile("Ideal for Aamras, mango lassi, mango kulfi, puddings, and seasonal desserts.")
                .qualityMetrics("Brix: 23° natural sugar\nAdded Preservatives: 0%\nPulp Purity: 100% Single-Origin Ratnagiri")
                .isActive(true)
                .build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));
        log.info("Successfully seeded 4 categories, 6 co-op profiles, and 6 verified products.");
    }
}

