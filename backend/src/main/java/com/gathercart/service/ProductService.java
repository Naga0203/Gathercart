package com.gathercart.service;

import com.gathercart.dto.CreateProductRequest;
import com.gathercart.dto.PageResponse;
import com.gathercart.dto.ProductDetailResponse;
import com.gathercart.dto.ProductSummaryResponse;
import com.gathercart.dto.UpdateProductRequest;
import com.gathercart.entity.Category;
import com.gathercart.entity.CoopProfile;
import com.gathercart.entity.Product;
import com.gathercart.entity.ProductImage;
import com.gathercart.exception.BusinessException;
import com.gathercart.exception.ResourceNotFoundException;
import com.gathercart.repository.CategoryRepository;
import com.gathercart.repository.CoopProfileRepository;
import com.gathercart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CoopProfileRepository coopProfileRepository;

    @Transactional(readOnly = true)
    public PageResponse<ProductSummaryResponse> getProducts(
            Long categoryId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        if (page < 0) page = 0;
        if (size <= 0) size = 12;
        if (size > 100) size = 100;

        String sortProperty = resolveSortProperty(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortProperty);

        Pageable pageable = PageRequest.of(page, size, sort);
        String cleanedSearch = (search != null && !search.trim().isEmpty()) ? search.trim().toLowerCase() : null;

        org.springframework.data.jpa.domain.Specification<Product> spec = (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (cleanedSearch != null) {
                String pattern = "%" + cleanedSearch + "%";
                var nameLike = cb.like(cb.lower(root.get("name")), pattern);
                var descLike = cb.like(cb.lower(root.get("description")), pattern);
                var catLike = cb.like(cb.lower(root.get("category").get("name")), pattern);
                predicates.add(cb.or(nameLike, descLike, catLike));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductSummaryResponse> items = productPage.getContent()
                .stream()
                .map(ProductSummaryResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.from(productPage, items);
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(Long id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        return ProductDetailResponse.fromEntity(product);
    }

    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        validatePrices(request.getMrp(), request.getGroupPrice());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        CoopProfile coopProfile = null;
        if (request.getCoopProfileId() != null) {
            coopProfile = coopProfileRepository.findById(request.getCoopProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Co-op profile not found with ID: " + request.getCoopProfileId()));
        }

        Product product = Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .detailedDescription(request.getDetailedDescription())
                .category(category)
                .coopProfile(coopProfile)
                .unitLabel(request.getUnitLabel().trim())
                .unitWeightKg(request.getUnitWeightKg())
                .mrp(request.getMrp())
                .groupPrice(request.getGroupPrice())
                .imageUrl(request.getImageUrl())
                .isLabVerified(Boolean.TRUE.equals(request.getIsLabVerified()))
                .isPesticideTested(Boolean.TRUE.equals(request.getIsPesticideTested()))
                .harvestDate(request.getHarvestDate())
                .moistureLevel(request.getMoistureLevel())
                .grainType(request.getGrainType())
                .processing(request.getProcessing())
                .culinaryProfile(request.getCulinaryProfile())
                .qualityMetrics(request.getQualityMetrics())
                .isActive(true)
                .build();

        if (request.getGalleryImageUrls() != null && !request.getGalleryImageUrls().isEmpty()) {
            int order = 0;
            for (String imgUrl : request.getGalleryImageUrls()) {
                if (imgUrl != null && !imgUrl.trim().isEmpty()) {
                    ProductImage pImg = ProductImage.builder()
                            .imageUrl(imgUrl.trim())
                            .displayOrder(order++)
                            .isVerified(true)
                            .build();
                    product.addImage(pImg);
                }
            }
        }

        Product saved = productRepository.save(product);
        log.info("Created product with ID: {} ('{}')", saved.getId(), saved.getName());
        return ProductDetailResponse.fromEntity(saved);
    }

    @Transactional
    public ProductDetailResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        BigDecimal effectiveMrp = request.getMrp() != null ? request.getMrp() : product.getMrp();
        BigDecimal effectiveGroupPrice = request.getGroupPrice() != null ? request.getGroupPrice() : product.getGroupPrice();
        validatePrices(effectiveMrp, effectiveGroupPrice);

        if (request.getName() != null) product.setName(request.getName().trim());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getDetailedDescription() != null) product.setDetailedDescription(request.getDetailedDescription());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getCoopProfileId() != null) {
            CoopProfile coopProfile = coopProfileRepository.findById(request.getCoopProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Co-op profile not found with ID: " + request.getCoopProfileId()));
            product.setCoopProfile(coopProfile);
        }

        if (request.getUnitLabel() != null) product.setUnitLabel(request.getUnitLabel().trim());
        if (request.getUnitWeightKg() != null) product.setUnitWeightKg(request.getUnitWeightKg());
        if (request.getMrp() != null) product.setMrp(request.getMrp());
        if (request.getGroupPrice() != null) product.setGroupPrice(request.getGroupPrice());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getIsLabVerified() != null) product.setIsLabVerified(request.getIsLabVerified());
        if (request.getIsPesticideTested() != null) product.setIsPesticideTested(request.getIsPesticideTested());
        if (request.getHarvestDate() != null) product.setHarvestDate(request.getHarvestDate());
        if (request.getMoistureLevel() != null) product.setMoistureLevel(request.getMoistureLevel());
        if (request.getGrainType() != null) product.setGrainType(request.getGrainType());
        if (request.getProcessing() != null) product.setProcessing(request.getProcessing());
        if (request.getCulinaryProfile() != null) product.setCulinaryProfile(request.getCulinaryProfile());
        if (request.getQualityMetrics() != null) product.setQualityMetrics(request.getQualityMetrics());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getGalleryImageUrls() != null) {
            product.getImages().clear();
            int order = 0;
            for (String imgUrl : request.getGalleryImageUrls()) {
                if (imgUrl != null && !imgUrl.trim().isEmpty()) {
                    ProductImage pImg = ProductImage.builder()
                            .imageUrl(imgUrl.trim())
                            .displayOrder(order++)
                            .isVerified(true)
                            .build();
                    product.addImage(pImg);
                }
            }
        }

        Product updated = productRepository.save(product);
        log.info("Updated product with ID: {}", updated.getId());
        return ProductDetailResponse.fromEntity(updated);
    }

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Deactivated product with ID: {}", id);
    }

    private void validatePrices(BigDecimal mrp, BigDecimal groupPrice) {
        if (mrp == null || groupPrice == null) {
            return;
        }
        if (mrp.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("MRP must be greater than zero");
        }
        if (groupPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Group price must be greater than zero");
        }
        if (groupPrice.compareTo(mrp) > 0) {
            throw new BusinessException("Group price (₹" + groupPrice + ") cannot be higher than regular MRP (₹" + mrp + ")");
        }
    }

    private String resolveSortProperty(String sortBy) {
        if (sortBy == null) return "id";
        return switch (sortBy.toLowerCase()) {
            case "price", "groupprice" -> "groupPrice";
            case "mrp" -> "mrp";
            case "name" -> "name";
            case "newest", "createdat" -> "createdAt";
            default -> "id";
        };
    }
}

