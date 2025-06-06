import { fetchAndSaveTuoiTreNews } from '../src/services/tuoitreScraper';
import db from '../src/config/db';
import dotenv from 'dotenv';
import path from 'path';

// Define the article type for the response
interface ScrapedArticle {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  summary: string;
  content: string;
  publishedAt: Date;
  category: string;
  author?: string;
  tags?: string[];
}

// Define the API response type
interface ScraperResponse {
  success: boolean;
  message: string;
  error?: any;
  articles?: ScrapedArticle[];
}

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../server.env/.env') });

// Test the scraper
const testScraper = async () => {
  try {
    console.log('🔍 Testing Tuoi Tre News Scraper...');
    
    // Sync database
    console.log('🔄 Syncing database...');
    await db.sync({ force: false });
    
    // Test scraping a category
    const category = 'thoi-su'; // Change category here if needed
    console.log(`📰 Fetching news from category: ${category}`);
    
    const result = await fetchAndSaveTuoiTreNews(category) as ScraperResponse;
    
    if (result.success) {
      console.log('✅ Success!');
      console.log(`📊 ${result.message}`);
      
      if (result.articles && result.articles.length > 0) {
        console.log(`📝 Articles saved: ${result.articles.length}`);
        console.log('\n📰 Sample article:');
        console.log(`   Title: ${result.articles[0].title}`);
        console.log(`   URL: ${result.articles[0].url}`);
        console.log(`   Image: ${result.articles[0].imageUrl}`);
      } else {
        console.log('ℹ️ No new articles were saved.');
      }
    } else {
      console.error('❌ Error:', result.message);
      if (result.error) {
        console.error(result.error);
      }
    }
  } catch (error) {
    console.error('❌ Unhandled error:', error);
  } finally {
    // Close database connection
    await db.close();
    process.exit(0);
  }
};

// Run the test
testScraper();
