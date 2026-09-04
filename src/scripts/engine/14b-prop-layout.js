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
    /* Giro em graus, sempre normalizado pra 0-359. Só existe pra quem
       pede — sem `o.giro` (a esmagadora maioria dos props hoje) dá 0 e
       ninguém muda de desenho. O pivô é o PÉ (peX,peY), o mesmo ponto
       de sempre: a peça gira sobre a própria base, não sobre o centro
       da imagem, senão ela "flutua" pra fora da célula ao girar. */
    giro:((o.giro || 0) % 360 + 360) % 360,
  };
}
