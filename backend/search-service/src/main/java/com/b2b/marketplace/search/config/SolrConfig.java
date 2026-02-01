package com.b2b.marketplace.search.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpRequestInterceptor;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.solr.client.solrj.SolrClient;
import org.apache.solr.client.solrj.impl.HttpSolrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ConditionalOnProperty(name = "spring.data.solr.enabled", havingValue = "true", matchIfMissing = true)
public class SolrConfig {

    @Value("${spring.data.solr.host:http://localhost:8983/solr}")
    private String solrHost;

    @Value("${spring.data.solr.username:}")
    private String solrUsername;

    @Value("${spring.data.solr.password:}")
    private String solrPassword;

    @Value("${spring.data.solr.connection-timeout:10000}")
    private int connectionTimeout;

    @Value("${spring.data.solr.socket-timeout:60000}")
    private int socketTimeout;

    @Bean
    public SolrClient solrClient() {
        log.info("Configuring Solr client for host: {}", solrHost);
        
        HttpSolrClient.Builder builder = new HttpSolrClient.Builder(solrHost)
                .withConnectionTimeout(connectionTimeout)
                .withSocketTimeout(socketTimeout);

        // Add Basic Authentication if credentials are provided
        if (solrUsername != null && !solrUsername.isEmpty() && 
            solrPassword != null && !solrPassword.isEmpty()) {
            
            log.info("Configuring Basic Authentication for Solr with username: {}", solrUsername);
            
            // Create credentials provider
            CredentialsProvider credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(solrUsername, solrPassword)
            );

            // Create connection pooling manager
            PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
            connectionManager.setMaxTotal(100);
            connectionManager.setDefaultMaxPerRoute(20);

            // Create request config with timeouts
            RequestConfig requestConfig = RequestConfig.custom()
                    .setConnectTimeout(connectionTimeout)
                    .setSocketTimeout(socketTimeout)
                    .setConnectionRequestTimeout(connectionTimeout)
                    .build();

            // Build HTTP client with preemptive authentication
            CloseableHttpClient httpClient = HttpClientBuilder.create()
                    .setConnectionManager(connectionManager)
                    .setDefaultRequestConfig(requestConfig)
                    .setDefaultCredentialsProvider(credentialsProvider)
                    .addInterceptorFirst((HttpRequestInterceptor) (request, context) -> {
                        // Preemptively add auth header to every request
                        if (!request.containsHeader("Authorization")) {
                            String auth = solrUsername + ":" + solrPassword;
                            String encodedAuth = java.util.Base64.getEncoder()
                                    .encodeToString(auth.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                            request.addHeader("Authorization", "Basic " + encodedAuth);
                        }
                    })
                    .build();

            builder.withHttpClient(httpClient);
            
            log.info("Basic Authentication configured with preemptive auth header");
        } else {
            log.warn("No Solr credentials configured - using unauthenticated access");
        }

        HttpSolrClient solrClient = builder.build();
        
        log.info("Solr client configured successfully");
        return solrClient;
    }
}
