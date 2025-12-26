import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchAPI } from '../services/api';
import './SolrSearch.css';

/**
 * Advanced Solr Search Component with autocomplete, facets, and highlighting
 */
const SolrSearch = ({ onProductSelect, initialQuery = '' }) => {
  // Search state
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;
  
  // Facets
  const [facets, setFacets] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    categoryId: null,
    supplierId: null,
    origin: null,
    minPrice: null,
    maxPrice: null,
    minRating: null,
    isFeatured: null,
    inStock: null,
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState('relevance');
  
  // Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  // Stats
  const [stats, setStats] = useState(null);
  
  // Highlighting
  const [highlighting, setHighlighting] = useState({});

  // Debounce timer for autocomplete
  const debounceTimer = useRef(null);

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popularity', label: 'Most Popular' },
  ];

  // Perform search
  const performSearch = useCallback(async (resetPage = false) => {
    setLoading(true);
    const currentPage = resetPage ? 0 : page;
    
    if (resetPage) {
      setPage(0);
    }

    const searchRequest = {
      query: query,
      ...selectedFilters,
      sortBy: sortBy,
      page: currentPage,
      size: pageSize,
      includeFacets: true,
      enableHighlighting: true,
    };

    const response = await searchAPI.advancedSearch(searchRequest);
    
    if (response.success) {
      setResults(response.data.results || []);
      setTotalResults(response.data.totalResults || 0);
      setTotalPages(response.data.totalPages || 0);
      setSearchTime(response.data.searchTime || 0);
      setFacets(response.data.facets || []);
      setHighlighting(response.data.highlighting || {});
      setStats(response.data.stats || null);
    } else {
      setResults([]);
      setTotalResults(0);
    }
    
    setLoading(false);
  }, [query, selectedFilters, sortBy, page]);

  // Autocomplete handler
  const handleAutocomplete = useCallback(async (searchText) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const response = await searchAPI.autocomplete(searchText, 8);
    
    if (response.success && response.data.suggestions) {
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    }
  }, []);

  // Handle input change with debounced autocomplete
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1);

    // Debounce autocomplete
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      handleAutocomplete(value);
    }, 200);
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        performSearch(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(suggestions[highlightedIndex]);
        } else {
          setShowSuggestions(false);
          performSearch(true);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Select a suggestion
  const selectSuggestion = (suggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Optionally navigate to product
    if (onProductSelect && suggestion.productId) {
      onProductSelect(suggestion.productId);
    } else {
      // Trigger search with the selected term
      setTimeout(() => performSearch(true), 0);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: value === 'all' ? null : value
    }));
  };

  // Handle facet click
  const handleFacetClick = (facetField, value) => {
    const filterMap = {
      'categoryName': 'categoryId',
      'supplierName': 'supplierId',
      'origin': 'origin',
    };
    
    const filterName = filterMap[facetField] || facetField;
    setSelectedFilters(prev => ({
      ...prev,
      [filterName]: prev[filterName] === value ? null : value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      categoryId: null,
      supplierId: null,
      origin: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      isFeatured: null,
      inStock: null,
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trigger search when filters or sort change
  useEffect(() => {
    if (query) {
      performSearch(true);
    }
  }, [selectedFilters, sortBy]);

  // Render highlighted text
  const renderHighlightedText = (productId, field, fallback) => {
    const highlights = highlighting[productId];
    if (highlights && highlights[field] && highlights[field].length > 0) {
      return (
        <span dangerouslySetInnerHTML={{ __html: highlights[field][0] }} />
      );
    }
    return fallback;
  };

  return (
    <div className="solr-search-container">
      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search products..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <button 
            className="search-button"
            onClick={() => performSearch(true)}
            disabled={loading}
          >
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown" ref={suggestionsRef}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className="suggestion-text">{suggestion.text}</span>
                  {suggestion.category && (
                    <span className="suggestion-category">in {suggestion.category}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className="search-content">
        {/* Facets Sidebar */}
        <div className="facets-sidebar">
          <div className="facets-header">
            <h3>Filters</h3>
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All
            </button>
          </div>

          {/* Quick Filters */}
          <div className="filter-section">
            <h4>Quick Filters</h4>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.isFeatured === true}
                onChange={(e) => handleFilterChange('isFeatured', e.target.checked ? true : null)}
              />
              Featured Only
            </label>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={selectedFilters.inStock === true}
                onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : null)}
              />
              In Stock
            </label>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={selectedFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : null)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={selectedFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h4>Minimum Rating</h4>
            <select
              value={selectedFilters.minRating || ''}
              onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          {/* Dynamic Facets */}
          {facets.map(facet => (
            <div key={facet.field} className="filter-section">
              <h4>{formatFacetTitle(facet.field)}</h4>
              <div className="facet-values">
                {facet.values.slice(0, 10).map(value => (
                  <div
                    key={value.value}
                    className={`facet-value ${selectedFilters[facet.field] === value.value ? 'selected' : ''}`}
                    onClick={() => handleFacetClick(facet.field, value.value)}
                  >
                    <span className="facet-name">{value.value}</span>
                    <span className="facet-count">({value.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Search Results */}
        <div className="results-container">
          {/* Results Header */}
          <div className="results-header">
            <span className="results-count">
              {totalResults > 0 
                ? `Showing ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, totalResults)} of ${totalResults} results`
                : 'No results found'
              }
            </span>
            <span className="search-time">({searchTime}ms)</span>
          </div>

          {/* Stats */}
          {stats && totalResults > 0 && (
            <div className="search-stats">
              <span>Price: ${stats.minPrice?.toFixed(2)} - ${stats.maxPrice?.toFixed(2)}</span>
              <span>Avg Rating: {stats.avgRating?.toFixed(1)} ⭐</span>
            </div>
          )}

          {/* Results Grid */}
          <div className="results-grid">
            {results.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => onProductSelect && onProductSelect(product.id)}
              >
                {product.isFeatured && (
                  <span className="featured-badge">⭐ Featured</span>
                )}
                <div className="product-image-placeholder">
                  {product.name?.charAt(0) || 'P'}
                </div>
                <div className="product-info">
                  <h4 className="product-name">
                    {renderHighlightedText(product.id, 'name', product.name)}
                  </h4>
                  <p className="product-description">
                    {renderHighlightedText(product.id, 'description', 
                      product.description?.substring(0, 100) + '...'
                    )}
                  </p>
                  <div className="product-meta">
                    <span className="product-price">${product.price?.toFixed(2)}</span>
                    <span className="product-rating">
                      {product.rating?.toFixed(1)} ⭐ ({product.reviewCount})
                    </span>
                  </div>
                  <div className="product-details">
                    <span className="product-category">{product.categoryName}</span>
                    <span className="product-supplier">{product.supplierName}</span>
                  </div>
                  {product.moq > 1 && (
                    <span className="product-moq">MOQ: {product.moq}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => { setPage(p => p - 1); performSearch(); }}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => { setPage(p => p + 1); performSearch(); }}
              >
                Next
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && query && (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format facet titles
function formatFacetTitle(field) {
  const titles = {
    'categoryName': 'Category',
    'supplierName': 'Supplier',
    'origin': 'Origin',
    'isFeatured': 'Featured',
    'tags': 'Tags',
  };
  return titles[field] || field;
}

export default SolrSearch;
