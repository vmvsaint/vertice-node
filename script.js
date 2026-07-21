/* =========================================================
   VÉRTICE DIGITAL — script.js
   ---------------------------------------------------------
   O que este arquivo faz (na ordem):
   0. Fundo interativo de partículas (sci-fi)
   1. Menu do celular (hambúrguer que vira X)
   2. Efeito de digitação no título do hero
   3. Animação de entrada dos elementos ao rolar a página
   4. Contadores animados da seção "Resultados"
   5. Formulário de contato → abre o WhatsApp com a mensagem pronta
   6. (COMENTADO) Como salvar os contatos no Supabase
   ========================================================= */

/* Detecta se a pessoa prefere menos animação (acessibilidade) */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 0. FUNDO INTERATIVO — REDE DE PARTÍCULAS ---------- */
/* Uma "rede neural" sci-fi: pontos flutuando que se conectam com
   linhas quando estão perto, nas cores da marca. Quando o mouse se
   aproxima, as partículas se AFASTAM suavemente — é a interação.

   ⚙️ Ajustes rápidos (as constantes logo abaixo):
     DENSIDADE ....... menor número = MAIS partículas
     DIST_CONEXAO .... distância máxima para desenhar a linha
     RAIO_MOUSE ...... alcance da "força" do cursor
   🖼️ Para usar uma imagem no lugar, veja "FUNDO COM IMAGEM"
   no styles.css e apague/comente esta seção. */
(function fundoInterativo() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || reduceMotion) return; // respeita quem prefere sem animação

  const ctx = canvas.getContext('2d');
  const DENSIDADE = 16000;   // 1 partícula a cada X pixels de tela
  const DIST_CONEXAO = 130;  // px
  const RAIO_MOUSE = 150;    // px
  const CORES = ['56,189,248', '167,139,250']; // azul e violeta da marca (RGB)

  let particulas = [];
  let largura, altura;
  const mouse = { x: null, y: null };

  function redimensionar() {
    largura = canvas.width = window.innerWidth;
    altura = canvas.height = window.innerHeight;
    criarParticulas();
  }

  function criarParticulas() {
    // no celular a tela é menor, então nascem menos partículas — leve!
    const total = Math.min(Math.floor((largura * altura) / DENSIDADE), 110);
    particulas = [];
    for (let i = 0; i < total; i++) {
      particulas.push({
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * 0.35, // velocidade horizontal
        vy: (Math.random() - 0.5) * 0.35, // velocidade vertical
        raio: Math.random() * 1.6 + 0.6,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
      });
    }
  }

  window.addEventListener('resize', redimensionar);
  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  let rodando = true;
  // pausa quando a aba fica em segundo plano (economiza bateria)
  document.addEventListener('visibilitychange', () => {
    rodando = !document.hidden;
    if (rodando) requestAnimationFrame(desenhar);
  });

  function desenhar() {
    if (!rodando) return;
    ctx.clearRect(0, 0, largura, altura);

    for (const p of particulas) {
      // movimento constante
      p.x += p.vx;
      p.y += p.vy;

      // rebate nas bordas da tela
      if (p.x < 0 || p.x > largura) p.vx *= -1;
      if (p.y < 0 || p.y > altura) p.vy *= -1;

      // interação: o mouse "empurra" as partículas próximas
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < RAIO_MOUSE && dist > 0) {
          const forca = (RAIO_MOUSE - dist) / RAIO_MOUSE; // 0 a 1
          p.x += (dx / dist) * forca * 2.2;
          p.y += (dy / dist) * forca * 2.2;
        }
      }

      // desenha o ponto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.cor}, .55)`;
      ctx.fill();
    }

    // desenha as linhas entre partículas próximas
    for (let i = 0; i < particulas.length; i++) {
      for (let j = i + 1; j < particulas.length; j++) {
        const a = particulas[i];
        const b = particulas[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < DIST_CONEXAO) {
          // quanto mais perto, mais visível a linha
          const alfa = (1 - dist / DIST_CONEXAO) * 0.16;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${a.cor}, ${alfa})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(desenhar);
  }

  redimensionar();
  requestAnimationFrame(desenhar);
})();


/* ---------- 1. MENU DO CELULAR ---------- */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  burger.setAttribute('aria-expanded', open); // ajuda leitores de tela
});

/* Fecha o menu quando algum link é clicado */
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- 2. ROTATOR DE FRASES (sem mexer no layout) ---------- */
/* Como funciona: a frase vive numa linha própria com altura fixa
   (definida no CSS em .rotator), então trocar o texto NUNCA empurra
   a página. A troca é: fade-out subindo → troca o texto → fade-in
   subindo de baixo. Nada de "digitação" que muda a largura da linha.

   ✏️ Para mudar as frases, edite esta lista.
   Dica: mantenha frases CURTAS (até ~30 caracteres) para caberem
   em UMA linha até no celular — é isso que garante altura estável. */
const frases = [
  'mais clientes',
  'um site profissional',
  'atendimento 24h',
  'anúncios que vendem',
];

const rotatorEl = document.getElementById('rotator');

if (rotatorEl && !reduceMotion) {
  let idxFrase = 0;

  setInterval(() => {
    // 1) anima a frase atual para fora (sobe e some)
    rotatorEl.classList.add('rot-out');

    // 2) quando o fade-out termina (400ms), troca o texto
    setTimeout(() => {
      idxFrase = (idxFrase + 1) % frases.length;
      rotatorEl.textContent = frases[idxFrase];

      // 3) reposiciona a nova frase logo abaixo, invisível...
      rotatorEl.classList.remove('rot-out');
      rotatorEl.classList.add('rot-in');

      // 4) ...e no quadro seguinte deixa ela subir para o lugar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => rotatorEl.classList.remove('rot-in'));
      });
    }, 400);
  }, 3200); // troca a cada 3,2 segundos
}

/* ---------- 3. ANIMAÇÃO DE ENTRADA (scroll reveal) ---------- */
/* Usamos IntersectionObserver: ele avisa quando um elemento
   entra na tela. É muito mais leve do que escutar o scroll. */
const revealTargets = document.querySelectorAll('.card, .step, .section-head, .contact-info, .form');

if (!reduceMotion && 'IntersectionObserver' in window) {
  // Prepara os elementos (escondidos) só se o JS estiver rodando —
  // assim, se algo falhar, o site continua todo visível.
  revealTargets.forEach((el) => el.classList.add('will-reveal'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // pequeno atraso em cascata para ficar elegante
          setTimeout(() => entry.target.classList.add('revealed'), i * 70);
          observer.unobserve(entry.target); // anima só uma vez
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

/* ---------- 4. CONTADORES DA SEÇÃO RESULTADOS ---------- */
/* Cada número tem data-target (valor final), e opcionalmente
   data-prefix ("R$ ", "+") e data-suffix ("%", "x").
   Exemplo no HTML:
   <span class="num" data-target="347" data-prefix="+">0</span>  */
const nums = document.querySelectorAll('.result .num');

function animarContador(el) {
  const alvo = parseInt(el.dataset.target || '0', 10);
  const prefixo = el.dataset.prefix || '';
  const sufixo = el.dataset.suffix || '';
  const duracao = 1400; // milissegundos
  const inicio = performance.now();

  function frame(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    // easing "ease-out": começa rápido e desacelera
    const suave = 1 - Math.pow(1 - progresso, 4);
    const valor = Math.round(alvo * suave);
    el.textContent = prefixo + valor.toLocaleString('pt-BR') + sufixo;
    if (progresso < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if ('IntersectionObserver' in window) {
  const numObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (reduceMotion) {
            // sem animação: mostra o valor final direto
            const el = entry.target;
            el.textContent = (el.dataset.prefix || '') +
              parseInt(el.dataset.target || '0', 10).toLocaleString('pt-BR') +
              (el.dataset.suffix || '');
          } else {
            animarContador(entry.target);
          }
          numObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  nums.forEach((el) => numObserver.observe(el));
}

/* ---------- 5. FORMULÁRIO → WHATSAPP ---------- */
/* Estratégia: sem servidor nenhum, o formulário monta a mensagem
   e abre o WhatsApp da agência com tudo preenchido. Simples e
   funciona em qualquer hospedagem (Vercel, GitHub Pages etc).

   📞 IMPORTANTE: troque o número abaixo pelo TELEFONE 1 real
   no formato 55 + DDD + número (sem espaços nem símbolos). */
const NUMERO_WHATSAPP = '5521968193801';

const form = document.getElementById('leadForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', (evento) => {
  evento.preventDefault(); // impede a página de recarregar

  const nome = document.getElementById('f-nome').value.trim();
  const zap = document.getElementById('f-zap').value.trim();
  const servico = document.getElementById('f-servico').value;
  const mensagem = document.getElementById('f-msg').value.trim();

  // validação simples
  if (!nome || !zap || !servico) {
    formMsg.style.color = '#F87171';
    formMsg.textContent = 'Preencha nome, WhatsApp e o serviço desejado. 🙂';
    return;
  }

  // monta o texto que chega no WhatsApp da agência
  const texto =
    `Olá! Vim pelo site da Vértice Digital.%0A%0A` + // %0A = quebra de linha
    `*Nome:* ${encodeURIComponent(nome)}%0A` +
    `*WhatsApp:* ${encodeURIComponent(zap)}%0A` +
    `*Serviço:* ${encodeURIComponent(servico)}%0A` +
    `*Projeto:* ${encodeURIComponent(mensagem || 'não informado')}`;

  // >>> AQUI é onde a integração com o Supabase entraria (ver bloco 6) <<<

  formMsg.style.color = '#34D399';
  formMsg.textContent = 'Abrindo seu WhatsApp... ✅';
  window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${texto}`, '_blank');
  form.reset();
});

/* ---------- 6. DEPOIMENTOS: setas do carrossel + lightbox ---------- */
/* Tudo aqui é "defensivo": se a seção não existir na página,
   nada quebra (os ifs cuidam disso). */
const depoSlider = document.getElementById('depoSlider');
const depoAnt = document.getElementById('depoAnt');
const depoProx = document.getElementById('depoProx');
 
if (depoSlider && depoAnt && depoProx) {
  // rola exatamente 1 card (largura do card + o gap de 1rem)
  function passoDoSlider() {
    const card = depoSlider.querySelector('.depo-slide');
    return card ? card.offsetWidth + 16 : 260;
  }
  depoAnt.addEventListener('click', () => depoSlider.scrollBy({ left: -passoDoSlider(), behavior: 'smooth' }));
  depoProx.addEventListener('click', () => depoSlider.scrollBy({ left: passoDoSlider(), behavior: 'smooth' }));
}
 
/* Lightbox: clicar num print amplia; clicar fora (ou no ✕, ou Esc) fecha */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxFechar = document.getElementById('lightboxFechar');
 
if (lightbox && depoSlider) {
  // abre ao clicar em qualquer IMAGEM do carrossel (placeholders não abrem)
  depoSlider.addEventListener('click', (e) => {
    const img = e.target.closest('.depo-slide img');
    if (!img) return;
    lightboxImg.src = img.src;
    lightbox.classList.add('aberto');
    lightbox.setAttribute('aria-hidden', 'false');
  });
 
  function fecharLightbox() {
    lightbox.classList.remove('aberto');
    lightbox.setAttribute('aria-hidden', 'true');
  }
  lightboxFechar.addEventListener('click', fecharLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) fecharLightbox(); // clicou no fundo escuro
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharLightbox();
  });
}

/* ---------- 7. (OPCIONAL) SALVAR OS CONTATOS NO SUPABASE ----------
   Quando você criar seu projeto no Supabase (o passo a passo está
   no arquivo GUIA-DO-INICIANTE.txt), descomente o código abaixo e
   cole-o DENTRO do evento de submit, no lugar marcado com >>> <<<.

   Antes, crie a tabela executando este SQL no Supabase (SQL Editor):

   create table leads (
     id bigint generated always as identity primary key,
     criado_em timestamptz default now(),
     nome text not null,
     whatsapp text not null,
     servico text,
     mensagem text
   );
   alter table leads enable row level security;
   create policy "site pode inserir leads"
     on leads for insert to anon with check (true);

   Depois descomente e preencha com a URL e a chave "anon" do SEU projeto
   (Configurações → API dentro do painel do Supabase):

   const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
   const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';

   fetch(`${SUPABASE_URL}/rest/v1/leads`, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'apikey': SUPABASE_ANON_KEY,
       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
     },
     body: JSON.stringify({ nome, whatsapp: zap, servico, mensagem }),
   })
     .then(() => console.log('Lead salvo no Supabase ✅'))
     .catch((erro) => console.error('Erro ao salvar lead:', erro));

   Obs.: a chave "anon" PODE ficar no site (ela é pública por design),
   desde que o RLS (Row Level Security) esteja ativado como no SQL acima.
   NUNCA coloque a chave "service_role" em um site.
------------------------------------------------------------------- */
