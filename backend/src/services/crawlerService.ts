import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { Site, SuggestedPost } from '../types/Site';

export class CrawlerService {
  private browser: puppeteer.Browser | null = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async crawlSite(site: Site): Promise<SuggestedPost[]> {
    try {
      console.log(`🔍 Iniciando crawler para: ${site.name} (${site.url})`);
      
      // Usar axios em vez de Puppeteer para maior confiabilidade
      const response = await axios.get(site.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000
      });

      console.log(`✅ HTML obtido: ${response.data.length} caracteres`);

      // Parsear com cheerio
      const $ = cheerio.load(response.data);
      const posts: SuggestedPost[] = [];

      // Buscar elementos baseado nos seletores
      const titleElements = $(site.selector_title);
      const imageElements = $(site.selector_image);
      const linkElements = site.selector_link ? $(site.selector_link) : null;

      console.log(`📊 Encontrados ${titleElements.length} títulos, ${imageElements.length} imagens`);

      // Sempre tentar seletores genéricos primeiro (mais confiável)
      console.log(`🔍 Tentando seletores genéricos...`);
      
      // Buscar todos os títulos possíveis
      const allTitles = $('h1, h2, h3, h4, .title, .headline, .news-title, .post-title, .article-title, [class*="title"], [class*="headline"], [class*="news"], [class*="article"]');
      const allImages = $('img');
      const allLinks = $('a');

      console.log(`📊 Encontrados: ${allTitles.length} títulos, ${allImages.length} imagens, ${allLinks.length} links`);

      // Debug: mostrar alguns títulos encontrados
      if (allTitles.length > 0) {
        console.log(`🔍 Primeiros 5 títulos encontrados:`);
        for (let i = 0; i < Math.min(5, allTitles.length); i++) {
          const title = allTitles.eq(i).text().trim();
          console.log(`  ${i + 1}. "${title}"`);
        }
      }

      // Debug: mostrar algumas imagens encontradas
      if (allImages.length > 0) {
        console.log(`🖼️ Primeiras 5 imagens encontradas:`);
        for (let i = 0; i < Math.min(5, allImages.length); i++) {
          const img = allImages.eq(i);
          const src = img.attr('src') || img.attr('data-src') || img.attr('data-lazy') || 'sem src';
          console.log(`  ${i + 1}. "${src}"`);
        }
      }

      // Processar até 10 posts
      const maxPosts = Math.min(10, allTitles.length);
      
      for (let i = 0; i < maxPosts; i++) {
        try {
          const titleElement = allTitles.eq(i);
          const title = titleElement.text().trim();

          // Pular títulos muito curtos ou vazios
          if (!title || title.length < 10) continue;
          
          // Pular títulos que são muito comuns (navegação, etc.)
          const commonWords = ['menu', 'navegação', 'login', 'cadastro', 'buscar', 'pesquisar', 'contato', 'sobre', 'home', 'início'];
          if (commonWords.some(word => title.toLowerCase().includes(word))) continue;

          // Buscar imagem próxima ao título
          let imageUrl = '';
          let articleUrl = '';

          // Tentar encontrar imagem no mesmo container ou próxima
          const titleParent = titleElement.parent();
          const nearbyImages = titleParent.find('img');
          
          if (nearbyImages.length > 0) {
            const img = nearbyImages.first();
            imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-lazy') || '';
          } else {
            // Buscar imagem em containers próximos
            const nearbyContainers = titleParent.siblings().find('img');
            if (nearbyContainers.length > 0) {
              const img = nearbyContainers.first();
              imageUrl = img.attr('src') || img.attr('data-src') || img.attr('data-lazy') || '';
            }
          }

          // Se não encontrou imagem próxima, usar qualquer imagem
          if (!imageUrl) {
            const randomImage = allImages.eq(Math.floor(Math.random() * Math.min(5, allImages.length)));
            imageUrl = randomImage.attr('src') || randomImage.attr('data-src') || randomImage.attr('data-lazy') || '';
          }

          // Buscar link do artigo
          const titleLink = titleElement.closest('a');
          if (titleLink.length > 0) {
            articleUrl = titleLink.attr('href') || '';
          } else {
            // Buscar link próximo
            const nearbyLinks = titleParent.find('a');
            if (nearbyLinks.length > 0) {
              articleUrl = nearbyLinks.first().attr('href') || '';
            }
          }

          // Validar e limpar URLs
          if (imageUrl) {
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              const baseUrl = new URL(site.url);
              imageUrl = baseUrl.origin + imageUrl;
            }
          }

          if (articleUrl) {
            if (articleUrl.startsWith('//')) {
              articleUrl = 'https:' + articleUrl;
            } else if (articleUrl.startsWith('/')) {
              const baseUrl = new URL(site.url);
              articleUrl = baseUrl.origin + articleUrl;
            }
          }

          // Se não tem imagem, tentar encontrar qualquer imagem
          if (!imageUrl) {
            // Buscar qualquer imagem no site
            const anyImage = allImages.eq(Math.floor(Math.random() * Math.min(10, allImages.length)));
            imageUrl = anyImage.attr('src') || anyImage.attr('data-src') || anyImage.attr('data-lazy') || '';
            
            if (imageUrl) {
              // Converter URL relativa para absoluta
              if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
              } else if (imageUrl.startsWith('/')) {
                const baseUrl = new URL(site.url);
                imageUrl = baseUrl.origin + imageUrl;
              }
            }
          }

          // Se ainda não tem imagem, pular
          if (!imageUrl) {
            console.log(`⚠️ Pulando post ${i + 1}: sem imagem`);
            continue;
          }

          const suggestedPost: SuggestedPost = {
            site_id: site.id!,
            title: title,
            image_url: imageUrl,
            article_url: articleUrl || undefined,
            source_site: site.name,
            is_approved: false
          };

          posts.push(suggestedPost);
          console.log(`✅ Post encontrado: ${title.substring(0, 50)}...`);

        } catch (error) {
          console.log(`❌ Erro ao processar post ${i}:`, error);
          continue;
        }
      }

      // Se ainda não encontrou posts, tentar seletores específicos
      if (posts.length === 0 && (titleElements.length > 0 || imageElements.length > 0)) {
        console.log(`🔍 Tentando seletores específicos...`);
        
        const maxPosts = Math.min(10, titleElements.length, imageElements.length);
        
        for (let i = 0; i < maxPosts; i++) {
          try {
            const titleElement = titleElements.eq(i);
            const imageElement = imageElements.eq(i);
            const linkElement = linkElements ? linkElements.eq(i) : null;

            const title = titleElement.text().trim();
            let imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || imageElement.attr('data-lazy');
            let articleUrl = linkElement ? linkElement.attr('href') : null;

            // Limpar e validar dados
            if (!title || title.length < 10) continue;
            if (!imageUrl) continue;

            // Converter URL relativa para absoluta
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              const baseUrl = new URL(site.url);
              imageUrl = baseUrl.origin + imageUrl;
            }

            if (articleUrl && articleUrl.startsWith('/')) {
              const baseUrl = new URL(site.url);
              articleUrl = baseUrl.origin + articleUrl;
            }

            const suggestedPost: SuggestedPost = {
              site_id: site.id!,
              title: title,
              image_url: imageUrl,
              article_url: articleUrl || undefined,
              source_site: site.name,
              is_approved: false
            };

            posts.push(suggestedPost);
            console.log(`✅ Post encontrado (específico): ${title.substring(0, 50)}...`);

          } catch (error) {
            console.log(`❌ Erro ao processar post específico ${i}:`, error);
            continue;
          }
        }
      } else {
        // Processar com seletores específicos
        const maxPosts = Math.min(10, titleElements.length, imageElements.length);
        
        for (let i = 0; i < maxPosts; i++) {
          try {
            const titleElement = titleElements.eq(i);
            const imageElement = imageElements.eq(i);
            const linkElement = linkElements ? linkElements.eq(i) : null;

            const title = titleElement.text().trim();
            let imageUrl = imageElement.attr('src') || imageElement.attr('data-src') || imageElement.attr('data-lazy');
            let articleUrl = linkElement ? linkElement.attr('href') : null;

            // Limpar e validar dados
            if (!title || title.length < 10) continue;
            if (!imageUrl) continue;

            // Converter URL relativa para absoluta
            if (imageUrl.startsWith('//')) {
              imageUrl = 'https:' + imageUrl;
            } else if (imageUrl.startsWith('/')) {
              const baseUrl = new URL(site.url);
              imageUrl = baseUrl.origin + imageUrl;
            }

            if (articleUrl && articleUrl.startsWith('/')) {
              const baseUrl = new URL(site.url);
              articleUrl = baseUrl.origin + articleUrl;
            }

            // Validar se a imagem é acessível (mais permissivo)
            try {
              const imageResponse = await axios.head(imageUrl, { timeout: 3000 });
              if (imageResponse.status !== 200) continue;
            } catch (error) {
              console.log(`⚠️ Imagem não acessível: ${imageUrl}`);
              // Continuar mesmo se a imagem não for acessível
            }

            const suggestedPost: SuggestedPost = {
              site_id: site.id!,
              title: title,
              image_url: imageUrl,
              article_url: articleUrl || undefined,
              source_site: site.name,
              is_approved: false
            };

            posts.push(suggestedPost);
            console.log(`✅ Post encontrado: ${title.substring(0, 50)}...`);

          } catch (error) {
            console.log(`❌ Erro ao processar post ${i}:`, error);
            continue;
          }
        }
      }

      console.log(`🎉 Crawler concluído para ${site.name}: ${posts.length} posts encontrados`);
      return posts;

    } catch (error) {
      console.error(`❌ Erro no crawler para ${site.name}:`, error);
      return [];
    }
  }

  // Método para testar um site específico
  async testSite(site: Site): Promise<{ success: boolean; posts: SuggestedPost[]; error?: string }> {
    try {
      const posts = await this.crawlSite(site);
      return {
        success: true,
        posts: posts
      };
    } catch (error) {
      return {
        success: false,
        posts: [],
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Método para obter seletores comuns de sites populares
  static getCommonSelectors(siteUrl: string): { title: string; image: string; link?: string } {
    const url = new URL(siteUrl);
    const domain = url.hostname.toLowerCase();

    // Seletores para sites comuns
    const selectors: { [key: string]: { title: string; image: string; link?: string } } = {
      'g1.globo.com': {
        title: '.feed-post-link',
        image: '.feed-post-link img',
        link: '.feed-post-link'
      },
      'globo.com': {
        title: '.feed-post-link',
        image: '.feed-post-link img',
        link: '.feed-post-link'
      },
      'uol.com.br': {
        title: '.headline',
        image: '.headline img',
        link: '.headline a'
      },
      'folha.com.br': {
        title: '.c-headline__title',
        image: '.c-headline__image img',
        link: '.c-headline__title a'
      },
      'estadao.com.br': {
        title: '.headline',
        image: '.headline img',
        link: '.headline a'
      },
      'terra.com.br': {
        title: '.card-news__title',
        image: '.card-news__image img',
        link: '.card-news__title a'
      },
      'espn.com.br': {
        title: 'h1, h2, h3, .headline, .title, [class*="title"], [class*="headline"]',
        image: 'img[src*="http"], img[data-src*="http"]',
        link: 'a[href*="http"]'
      },
      'espn.com': {
        title: 'h1, h2, h3, .headline, .title, [class*="title"], [class*="headline"]',
        image: 'img[src*="http"], img[data-src*="http"]',
        link: 'a[href*="http"]'
      }
    };

    // Retornar seletores específicos ou genéricos
    for (const [siteDomain, selector] of Object.entries(selectors)) {
      if (domain.includes(siteDomain)) {
        return selector;
      }
    }

    // Seletores genéricos como fallback
    return {
      title: 'h1, h2, h3, .title, .headline, [class*="title"], [class*="headline"]',
      image: 'img[src*="http"], img[data-src*="http"]',
      link: 'a[href*="http"]'
    };
  }
}
