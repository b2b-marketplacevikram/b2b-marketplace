package com.b2b.marketplace.search.config;

import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SolrClientConfig {

    @Value("${spring.data.solr.host:http://localhost:8983/solr}")
    private String solrHost;

    @Bean
    public SolrClient solrClient() {
        String baseUrl = solrHost.endsWith("/") ? solrHost : solrHost + "/";
        return new HttpSolrClient.Builder(baseUrl).build();
    }
}
