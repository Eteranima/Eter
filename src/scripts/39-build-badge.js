/* ===================================================================
   39. CARIMBO DE BUILD — só em eterhml.denverso.com
   O texto real (data/hora da publicação) é escrito por
   tools/construir_modular.py a cada build, direto em cima do marcador
   __BUILD_TIMESTAMP__ que fica em src/index.html. Rodar o jogo direto
   de src/ (sem build) mostra o marcador cru — inofensivo, só feio, e é
   assim que se percebe que alguém esqueceu de rodar o build.

   A visibilidade é decidida aqui, em runtime, pelo hostname — não pelo
   conteúdo do arquivo. Isso é o que garante a promoção pra produção
   (necromod/eter, eter.denverso.com) levar o MESMO código-fonte sem
   nunca mostrar o carimbo lá: o hostname na hora de carregar a página
   é que muda, o arquivo publicado é idêntico. Falha fechada de
   propósito — qualquer hostname que não seja exatamente o da HML
   mantém o carimbo escondido (o CSS já esconde por padrão; isto só
   soma a classe quando reconhece o host certo). */
(function(){
  const HOST_HML = 'eterhml.denverso.com';

  /** Pura, pra dar pra testar sem precisar navegar de verdade. */
  function ehHostHML(host){ return host === HOST_HML; }

  function aplicar(){
    if (!ehHostHML(location.hostname)) return;
    const el = document.getElementById('build-badge');
    if (el) el.classList.add('mostrar');
  }

  aplicar();
  // exposto só pro autoteste conferir a regra sem depender do hostname real
  window.__ehHostHML = ehHostHML;
})();
