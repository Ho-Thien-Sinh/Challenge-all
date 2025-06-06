// @ts-nocheck
const axios = require('axios');
const cheerio = require('cheerio');
const newsService = require('../services/newsService');

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8',
    'Referer': 'https://vnexpress.net/',
    'Connection': 'keep-alive',
  },
  timeout: 15000
});

const fetchTuoitreNews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 52;
    const result = newsService.getArticles(limit);
    
    res.json({
      ...result,
      stats: {
        ...result.stats,
        source: 'Tuổi Trẻ',
        lastFetched: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy tin tức từ Tuổi Trẻ:', error);
    res.status(500).json({ 
      error: 'Không thể lấy tin tức từ Tuổi Trẻ',
      details: error.message 
    });
  }
};

module.exports = {
  fetchTuoitreNews
};

