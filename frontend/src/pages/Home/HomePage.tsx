import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  Percent,
  Sparkles,
  ArrowRight,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';
import {
  Badge,
  ProgressBar,
  PriceDisplay,
  Button,
  Card,
  Skeleton,
  EmptyState,
  Alert,
} from '../../components/common';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import type { ProductSummary, Category, ProductQueryParams } from '../../types/product';
import type { PagedResponse } from '../../types/api';

export const HomePage: React.FC = () => {
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Search & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState<'id,desc' | 'price,asc' | 'price,desc' | 'name,asc' | 'newest,desc'>('id,desc');

  // Products pagination state
  const [productsPage, setProductsPage] = useState<PagedResponse<ProductSummary>>({
    content: [],
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(
    async (pageToLoad = 0) => {
      setIsLoading(true);
      setError(null);
      try {
        const [sortBy, sortDir] = sortOption.split(',') as [string, 'asc' | 'desc'];
        const params: ProductQueryParams = {
          page: pageToLoad,
          size: 12,
          sortBy,
          sortDir,
        };

        if (selectedCategoryId !== null) {
          params.categoryId = selectedCategoryId;
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const result = await productService.getProducts(params);
        setProductsPage(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to connect to product service';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategoryId, debouncedSearch, sortOption]
  );

  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  const handleResetFilters = () => {
    setSelectedCategoryId(null);
    setSearchTerm('');
    setSortOption('id,desc');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-10 border border-emerald-100/80 dark:border-emerald-900/40 shadow-xs">
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline-green" size="md" icon={<ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}>
            VERIFIED COOPERATIVE HUB
          </Badge>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Neighbourhood Group Offers in Indiranagar, Bengaluru
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Join bulk wholesale buys with neighbours in your locality. Real products sourced directly from regional APMC co-ops and farmer producer mills.
          </p>

          {/* 3 Value Propositions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs flex-shrink-0">
                ₹0
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Zero upfront payment</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Pledge first, pay on lock</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Free delivery at 10+</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">To community drop point</div>
              </div>
            </div>

            <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-xs flex-shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Direct mill pricing</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">20–30% below retail MRP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls Bar */}
      <div className="space-y-4">
        {/* Top Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name or mill..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            >
              <option value="id,desc">Default (Featured)</option>
              <option value="price,asc">Price: Low to High</option>
              <option value="price,desc">Price: High to Low</option>
              <option value="name,asc">Name: A to Z</option>
              <option value="newest,desc">Newest Additions</option>
            </select>
          </div>
        </div>

        {/* Category Pills & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategoryId === null
                  ? 'bg-emerald-800 text-white shadow-xs dark:bg-emerald-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategoryId === cat.id
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium self-end sm:self-center">
            {isLoading
              ? 'Loading products...'
              : `Displaying ${productsPage.content.length} of ${productsPage.totalElements} products`}
          </div>
        </div>
      </div>

      {/* Error Alert with Retry */}
      {error && (
        <Alert
          variant="error"
          title="Error loading product inventory"
          onDismiss={() => setError(null)}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProducts(productsPage.page)}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Retry Connection
            </Button>
          </div>
        </Alert>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} padding="none" className="overflow-hidden flex flex-col justify-between">
              <div>
                <Skeleton variant="rectangular" className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton variant="text" className="w-3/4 h-5" />
                  <Skeleton variant="text" className="w-1/2 h-3" />
                  <Skeleton variant="rectangular" className="h-8 w-2/3 rounded-lg" />
                  <Skeleton variant="rectangular" className="h-4 w-full rounded-md" />
                </div>
              </div>
              <div className="p-5 pt-0">
                <Skeleton variant="rectangular" className="h-10 w-full rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && productsPage.content.length === 0 && (
        <EmptyState
          title="No products found"
          description={
            debouncedSearch || selectedCategoryId !== null
              ? "We couldn't find any products matching your current filters. Try clearing your search or category selection."
              : 'No products are currently available. Check back soon for new wholesale batches!'
          }
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Live Products Grid */}
      {!isLoading && !error && productsPage.content.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsPage.content.map((product) => {
            return (
              <Card
                key={product.id}
                padding="none"
                className="overflow-hidden flex flex-col justify-between hover:shadow-md transition group border border-slate-200/80 dark:border-slate-800"
              >
                <div>
                  {/* Image & Header Badges */}
                  <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={
                        product.imageUrl ||
                        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge variant="green" size="sm">
                        ACTIVE DEAL
                      </Badge>
                      {product.isPesticideTested && (
                        <Badge
                          variant="outline-green"
                          size="sm"
                          icon={<BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />}
                        >
                          Tested
                        </Badge>
                      )}
                    </div>

                    {/* Category Tag Top Right */}
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700">
                      {product.categoryName}
                    </div>

                    {/* Unit Tag Bottom Left */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      {product.unitLabel}
                    </div>

                    {/* Savings Tag Bottom Right */}
                    {product.savingsPercent > 0 && (
                      <div className="absolute bottom-3 right-3 bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                        Save {product.savingsPercent}%
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    {/* Authoritative Price Row */}
                    <PriceDisplay
                      price={product.groupPrice}
                      mrp={product.mrp}
                      size="md"
                    />

                    {/* Progress & Value Hint */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">
                          Bulk Wholesale Batch
                        </span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                          Direct Mill Price
                        </span>
                      </div>

                      <ProgressBar current={18} total={25} variant="emerald" />

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">
                          Save ₹{product.savingsAmount.toFixed(0)} vs local retail store
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button Footer */}
                <div className="p-5 pt-0">
                  <Link to={`/offers/${product.id}`} className="block">
                    <Button
                      variant="primary"
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="w-full"
                    >
                      View Details &amp; Mill Spec
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && !error && productsPage.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
          <div className="text-xs text-slate-500">
            Page {productsPage.page + 1} of {productsPage.totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={productsPage.page === 0}
              onClick={() => fetchProducts(productsPage.page - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={productsPage.last || productsPage.page + 1 >= productsPage.totalPages}
              onClick={() => fetchProducts(productsPage.page + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Suggest New Bulk Pool Banner */}
      <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-2xs flex-shrink-0">
            🌾
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Want to propose an item for Indiranagar?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Request a wholesale bulk slot for your apartment building or street association.
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="whitespace-nowrap">
          Suggest New Bulk Pool
        </Button>
      </div>
    </div>
  );
};
