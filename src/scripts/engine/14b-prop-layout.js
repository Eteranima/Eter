/* ===================================================================
   LAYOUT COMPARTILHADO DE PROPS

   O runtime e o Editor de Cenários chamam esta mesma função. Assim a
   prévia não inventa outro pé, escala ou sombra para a peça e não volta
   a aprovar uma fachada/lago que o campo desenharia diferente.
   =================================================================== */
function calcularLayoutProp(iw, ih, sx, sy, o = {}, tile = 32){
  const escala = o.escala ?? 1;
  const largura = Math.round(iw * escala), altura = Math.round(ih * escala);
  const peX = sx + tile / 2, peY = sy + tile - (o.recuo ?? 2);
  return {
    largura, altura, peX, peY,
    x:Math.round(peX - largura / 2), y:peY - altura,
    sombra:o.sombra !== false,
    sombraRaioX:Math.min(largura * .40, tile * .58),
  };
}
