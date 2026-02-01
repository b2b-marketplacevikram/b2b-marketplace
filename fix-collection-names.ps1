# Script to replace COLLECTION constant with collectionName variable in all Solr search files

Write-Host "Fixing collection name references in search service..." -ForegroundColor Cyan

$files = @(
    "backend\search-service\src\main\java\com\b2b\marketplace\search\repository\ProductSearchRepository.java",
    "backend\search-service\src\main\java\com\b2b\marketplace\search\service\BundleSolrSearchService.java",
    "backend\search-service\src\main\java\com\b2b\marketplace\search\service\AdvancedSolrSearchService.java"
)

foreach ($file in $files) {
    $fullPath = "f:\B2B-MarketPlace\b2b-marketplace\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $fullPath -Raw
        
        # Replace all COLLECTION references (but not the constant declaration or import statements)
        $content = $content -replace 'solrClient\.query\(COLLECTION,', 'solrClient.query(collectionName,'
        $content = $content -replace 'solrClient\.add\(COLLECTION,', 'solrClient.add(collectionName,'
        $content = $content -replace 'solrClient\.commit\(COLLECTION\)', 'solrClient.commit(collectionName)'
        $content = $content -replace 'solrClient\.deleteById\(COLLECTION,', 'solrClient.deleteById(collectionName,'
        $content = $content -replace 'solrClient\.deleteByQuery\(COLLECTION,', 'solrClient.deleteByQuery(collectionName,'
        
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "  ✓ Updated" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`n✓ All files processed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Compile: cd backend\search-service; mvn clean compile" -ForegroundColor White
Write-Host "2. Run: mvn spring-boot:run" -ForegroundColor White
