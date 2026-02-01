package com.b2b.marketplace.search.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;

/**
 * Configuration properties for Solr search features
 */
@Configuration
@Getter
public class SolrSearchProperties {

    @Value("${spring.data.solr.host:http://localhost:8983/solr}")
    private String solrHost;

    @Value("${spring.data.solr.collection:b2b_products}")
    private String collection;

    @Value("${spring.data.solr.connection-timeout:5000}")
    private int connectionTimeout;

    @Value("${spring.data.solr.socket-timeout:30000}")
    private int socketTimeout;

    @Value("${solr.autocomplete.min-chars:2}")
    private int autocompleteMinChars;

    @Value("${solr.autocomplete.max-results:10}")
    private int autocompleteMaxResults;

    @Value("${solr.search.default-page-size:20}")
    private int defaultPageSize;

    @Value("${solr.search.max-page-size:100}")
    private int maxPageSize;

    @Value("${solr.facet.min-count:1}")
    private int facetMinCount;

    @Value("${solr.facet.limit:50}")
    private int facetLimit;

    @Value("${solr.highlight.fragment-size:200}")
    private int highlightFragmentSize;

    @Value("${solr.highlight.snippets:3}")
    private int highlightSnippets;

    @Value("${search.sync.enabled:true}")
    private boolean syncEnabled;

    @Value("${search.sync.interval:3600000}")
    private long syncInterval;

    @Value("${search.sync.startup-delay:5000}")
    private long startupDelay;
}
