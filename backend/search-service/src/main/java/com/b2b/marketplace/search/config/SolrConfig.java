package com.b2b.marketplace.search.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.data.solr.enabled", havingValue = "true", matchIfMissing = true)
public class SolrConfig {

    @Value("${spring.data.solr.host:http://localhost:8983/solr}")
    private String solrHost;

    // Spring Boot's SolrAutoConfiguration will pick up `spring.data.solr.host` property.
}
