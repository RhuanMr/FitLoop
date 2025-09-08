const axios = require('axios');
const cheerio = require('cheerio');

async function testSimpleCrawler() {
  try {
    console.log('🔍 Testando crawler simples...');
    
    const response = await axios.get('https://www.espn.com.br/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 10000
    });
    
    console.log(`✅ HTML obtido: ${response.data.length} caracteres`);
    
    const $ = cheerio.load(response.data);
    
    // Buscar títulos
    const titles = $('h1, h2, h3, h4, .title, .headline, [class*="title"], [class*="headline"]');
    console.log(`📊 Encontrados ${titles.length} títulos`);
    
    // Mostrar primeiros 5 títulos
    for (let i = 0; i < Math.min(5, titles.length); i++) {
      const title = titles.eq(i).text().trim();
      console.log(`  ${i + 1}. "${title}"`);
    }
    
    // Buscar imagens
    const images = $('img');
    console.log(`🖼️ Encontradas ${images.length} imagens`);
    
    // Mostrar primeiras 5 imagens
    for (let i = 0; i < Math.min(5, images.length); i++) {
      const img = images.eq(i);
      const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy') || 'sem src';
      console.log(`  ${i + 1}. "${src}"`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testSimpleCrawler();
