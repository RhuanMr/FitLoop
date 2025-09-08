import * as cron from 'node-cron';
import { CrawlerService } from './crawlerService';
import supabase from './supabaseService';
import { Site, SuggestedPost } from '../types/Site';

export class SchedulerService {
  private crawlerService: CrawlerService;
  private jobs: Map<number, cron.ScheduledTask> = new Map();

  constructor() {
    this.crawlerService = new CrawlerService();
  }

  // Iniciar o agendador
  async start() {
    console.log('🚀 Iniciando Scheduler Service...');
    
    // Carregar sites ativos e criar jobs
    await this.loadActiveSites();
    
    console.log('✅ Scheduler Service iniciado com sucesso!');
  }

  // Carregar sites ativos e criar jobs
  async loadActiveSites() {
    try {
      const { data: sites, error } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erro ao carregar sites:', error);
        return;
      }

      console.log(`📋 Carregando ${sites?.length || 0} sites ativos...`);

      // Limpar jobs existentes
      this.clearAllJobs();

      // Criar jobs para cada site
      sites?.forEach(site => {
        this.createJobForSite(site);
      });

    } catch (error) {
      console.error('❌ Erro ao carregar sites ativos:', error);
    }
  }

  // Criar job para um site específico
  createJobForSite(site: Site) {
    if (!site.id || !site.is_active) return;

    // Parar job existente se houver
    this.stopJobForSite(site.id);

    // Criar expressão cron baseada no intervalo em horas
    const cronExpression = this.getCronExpression(site.interval_hours);
    
    console.log(`⏰ Criando job para ${site.name}: a cada ${site.interval_hours}h (${cronExpression})`);

    const job = cron.schedule(cronExpression, async () => {
      await this.executeCrawlForSite(site);
    }, {
      timezone: 'America/Sao_Paulo'
    });

    this.jobs.set(site.id, job);
  }

  // Executar crawler para um site específico
  async executeCrawlForSite(site: Site) {
    try {
      console.log(`🕐 Executando crawler agendado para: ${site.name}`);
      
      const posts = await this.crawlerService.crawlSite(site);
      
      if (posts.length > 0) {
        // Salvar posts sugeridos no banco
        await this.saveSuggestedPosts(posts);
        
        // Atualizar timestamp do último crawl
        await this.updateLastCrawled(site.id!);
        
        console.log(`✅ Crawler concluído para ${site.name}: ${posts.length} posts salvos`);
      } else {
        console.log(`⚠️ Nenhum post encontrado para ${site.name}`);
      }

    } catch (error) {
      console.error(`❌ Erro no crawler agendado para ${site.name}:`, error);
    }
  }

  // Salvar posts sugeridos no banco
  async saveSuggestedPosts(posts: SuggestedPost[]) {
    try {
      const { error } = await supabase
        .from('suggested_posts')
        .insert(posts);

      if (error) {
        console.error('❌ Erro ao salvar posts sugeridos:', error);
      } else {
        console.log(`💾 ${posts.length} posts sugeridos salvos no banco`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar posts sugeridos:', error);
    }
  }

  // Atualizar timestamp do último crawl
  async updateLastCrawled(siteId: number) {
    try {
      const { error } = await supabase
        .from('sites')
        .update({ last_crawled: new Date().toISOString() })
        .eq('id', siteId);

      if (error) {
        console.error('❌ Erro ao atualizar last_crawled:', error);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar last_crawled:', error);
    }
  }

  // Parar job para um site específico
  stopJobForSite(siteId: number) {
    const job = this.jobs.get(siteId);
    if (job) {
      job.stop();
      this.jobs.delete(siteId);
      console.log(`⏹️ Job parado para site ID: ${siteId}`);
    }
  }

  // Limpar todos os jobs
  clearAllJobs() {
    this.jobs.forEach((job, siteId) => {
      job.stop();
      console.log(`⏹️ Job parado para site ID: ${siteId}`);
    });
    this.jobs.clear();
  }

  // Converter intervalo em horas para expressão cron
  private getCronExpression(intervalHours: number): string {
    if (intervalHours < 1) {
      // Menos de 1 hora - a cada 30 minutos
      return '*/30 * * * *';
    } else if (intervalHours === 1) {
      // 1 hora - a cada hora
      return '0 * * * *';
    } else if (intervalHours <= 6) {
      // 2-6 horas - a cada 2 horas
      return '0 */2 * * *';
    } else if (intervalHours <= 12) {
      // 6-12 horas - a cada 6 horas
      return '0 */6 * * *';
    } else if (intervalHours <= 24) {
      // 12-24 horas - a cada 12 horas
      return '0 */12 * * *';
    } else {
      // Mais de 24 horas - uma vez por dia
      return '0 0 * * *';
    }
  }

  // Executar crawler manualmente para um site
  async runManualCrawl(siteId: number): Promise<{ success: boolean; posts: SuggestedPost[]; error?: string }> {
    try {
      const { data: site, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (error || !site) {
        return {
          success: false,
          posts: [],
          error: 'Site não encontrado'
        };
      }

      const posts = await this.crawlerService.crawlSite(site);
      
      if (posts.length > 0) {
        await this.saveSuggestedPosts(posts);
        await this.updateLastCrawled(siteId);
      }

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

  // Parar o agendador
  async stop() {
    console.log('⏹️ Parando Scheduler Service...');
    this.clearAllJobs();
    await this.crawlerService.closeBrowser();
    console.log('✅ Scheduler Service parado');
  }
}
