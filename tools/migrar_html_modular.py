#!/usr/bin/env python3
"""Converte o HTML monolítico do Éter em fonte modular e auditável.

O conversor é deliberadamente mecânico: não reescreve regras do jogo. Ele
externaliza imagens, CSS e blocos JavaScript na mesma ordem em que existiam no
HTML, preservando o escopo léxico compartilhado dos scripts clássicos.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import re
import shutil
from pathlib import Path


DATA_URI = re.compile(
    r'(?P<prefix>(?P<quote>["\'])(?P<data>data:image/(?P<type>[\w.+-]+);base64,'
    r'(?P<payload>[A-Za-z0-9+/=]+))(?P=quote))'
)
KEY_BEFORE = re.compile(r'(?P<key>[A-Za-z_$][\w$]*|"[^"]+"|\'[^\']+\')\s*:\s*$')


PARTS = (
    ("00-assets.js", "__SCRIPT_START__"),
    ("core/01-config.js", "1. CONFIG + UTIL"),
    ("data/02-elements-status.js", "2. DADOS DO JOGO"),
    ("data/03-items-shops.js", "const SLOTS ="),
    ("data/04-skills.js", "const SKILLS ="),
    ("data/05-ultimates-combos.js", "const ULTIMATES ="),
    ("data/06-pets.js", "const PET_EXP_SHARE ="),
    ("characters/07-characters.js", "const BATTLE_ART ="),
    ("characters/08-progression-grimoire.js", "const PONTOS_POR_NIVEL ="),
    ("monsters/09-bestiary.js", "const RARIDADES ="),
    ("monsters/10-formations.js", "const FORMATIONS ="),
    ("world/11-quests.js", "const QUESTS ="),
    ("world/12-maps.js", "const RESERVE_EXP ="),
    ("engine/13-audio.js", "3. ÁUDIO"),
    ("engine/14-input.js", "4. INPUT"),
    ("engine/15-render.js", "5. RENDER HELPERS"),
    ("engine/16-save-state.js", "6. SAVE / LOAD"),
    ("engine/17-world.js", "8. MAPA / CAMPO"),
    ("engine/18-day-night.js", "7b. CICLO DE DIA E NOITE"),
    ("engine/19-world-map.js", "8f. MAPA DO MUNDO"),
    ("engine/20-field-view.js", "8b. DESENHO DO CAMPO"),
    ("ui/21-field-hud.js", "7c. HUD DE CAMPO"),
    ("ui/22-dialogue.js", "9. MENSAGENS"),
    ("ui/23-navigation.js", "9b. LISTA COM CURSOR"),
    ("ui/24-menu.js", "9c. MENU DE CAMPO"),
    ("ui/25-shop.js", "9d. LOJA"),
    ("combat/26-model.js", "10. COMBATE — MODELO"),
    ("combat/27-controller.js", "ZONAS DA TELA DE COMBATE"),
    ("combat/28-view.js", "11. COMBATE — VIEW"),
    ("engine/29-fx.js", "12. FX"),
    ("ui/30-title.js", "13. TELA DE TÍTULO"),
    ("ui/31-character-select.js", "13b. ESCOLHA DO PROTAGONISTA"),
    ("scenes/32-engine.js", "13b. CENAS — motor"),
    ("scenes/33-story.js", "13c. CENAS DO JOGO"),
    ("scenes/34-postgame.js", "13d. CENAS DA v4.8"),
    ("engine/35-loop.js", "14. LOOP PRINCIPAL"),
    ("tests/36-self-test.js", "15. AUTOTESTE"),
    ("tools/37-balance.js", "16. FERRAMENTA DE BALANCEAMENTO"),
)


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9._-]+", "-", value.lower()).strip("-") or "asset"


def category(key: str, script: str, position: int) -> str:
    regions = (
        ("const PETS =", "const BATTLE_ART =", "pets"),
        ("const BATTLE_ART =", "const PARTY_DEFS =", "characters"),
        ("const BESTIARY =", "const FORMATIONS =", "monsters"),
        ("const MAPS =", "3. ÁUDIO", "world"),
    )
    for start_marker, end_marker, name in regions:
        start = script.find(start_marker)
        end = script.find(end_marker, start + 1)
        if start >= 0 and start <= position < end:
            return name
    key_lower = key.lower()
    if key_lower.startswith(("battle_bg", "region_", "map_", "tile_", "prop_", "npc_", "fundo_")):
        return "world"
    if key_lower.startswith(("pet_", "familiar_")):
        return "pets"
    if key_lower.startswith(("ui_", "icon_", "hud_", "frame_", "tree_bg_", "hab_", "ail_")):
        return "ui"
    if any(token in key_lower for token in ("portrait", "_sheet", "battle_", "papelao", "lycan")):
        return "characters"
    if key_lower.startswith(("enemy_", "mob_", "boss_", "bestiary_")):
        return "monsters"
    if key_lower.startswith("bg_"):
        return "world"
    return "misc"


def find_key(script: str, start: int, index: int) -> str:
    prefix = script[max(0, start - 180):start]
    match = KEY_BEFORE.search(prefix)
    key = match.group("key").strip("\"'") if match else f"asset-{index:03d}"
    if key in {"src", "sprite", "campo", "battle", "batalha", "portrait"}:
        owners = re.findall(
            r'(?:^|\n)\s*(?:"([^"]+)"|\'([^\']+)\'|([A-Za-z_$][\w$]*))\s*:\s*\{',
            script[max(0, start - 500):start],
        )
        if owners:
            owner = next(value for value in owners[-1] if value)
            key = f"{owner}-{key}"
    return key


def externalize(script: str, out: Path) -> tuple[str, list[dict[str, object]]]:
    catalog: list[dict[str, object]] = []
    seen_names: dict[str, int] = {}

    def replace(match: re.Match[str]) -> str:
        index = len(catalog) + 1
        key = find_key(script, match.start(), index)
        ext = "jpg" if match.group("type") == "jpeg" else match.group("type")
        raw = base64.b64decode(match.group("payload"), validate=True)
        digest = hashlib.sha256(raw).hexdigest()
        base_name = slug(key)
        count = seen_names.get(base_name, 0) + 1
        seen_names[base_name] = count
        if count > 1:
            base_name = f"{base_name}-{count}"
        relative = Path("assets") / category(key, script, match.start()) / f"{base_name}.{ext}"
        target = out / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
        catalog.append({
            "key": key,
            "path": relative.as_posix(),
            "mime": f"image/{match.group('type')}",
            "bytes": len(raw),
            "sha256": digest,
        })
        return f'{match.group("quote")}{relative.as_posix()}{match.group("quote")}'

    return DATA_URI.sub(replace, script), catalog


def preserve_runtime_contracts(script: str) -> str:
    """Aplica correções operacionais já comprovadas que o monólito não traz."""
    def replace_once(old: str, new: str) -> None:
        nonlocal script
        if script.count(old) != 1:
            raise ValueError(f"contrato esperado uma vez, encontrado {script.count(old)}: {old[:60]}")
        script = script.replace(old, new, 1)

    antigo = "if (location.search.includes('test')) setTimeout(runSelfTests, 250);"
    novo = "if (location.search.includes('test')) aguardarRecursosDoAutoteste().then(runSelfTests);"
    if antigo not in script:
        raise ValueError("contrato antigo de boot não encontrado")
    script = script.replace(antigo, novo, 1)
    agendamento = """

/* O relatório mede dimensões e diferenças entre artes. Em acesso remoto,
   aguarde imagens e fontes terminarem antes de executar as asserções. */
async function aguardarRecursosDoAutoteste(){
  const imagens = [
    ...Object.values(spriteImages),
    ...Object.values(battleArt).map(a => a.img),
  ].filter(img => img?.decode);
  await Promise.all([
    document.fonts?.ready || Promise.resolve(),
    ...imagens.map(img => img.decode().catch(() => {})),
  ]);
}
"""
    marker = "\n/* ===================================================================\n   15. AUTOTESTE"
    if marker not in script:
        raise ValueError("marcador de autoteste ausente")
    script = script.replace(marker, agendamento + marker, 1)

    replace_once(
        "difficulty: G.difficulty, moldura: G.moldura, tema: G.tema,",
        "difficulty: G.difficulty, moldura: G.moldura, tema: G.tema,\n"
        "      modificadorCombate: G.modificadorCombate,",
    )
    replace_once(
        "  algum(){ for (let i = 0; i < SAVE_SLOTS; i++) if (this.exists(i)) return true; return false; },\n};",
        "  algum(){ for (let i = 0; i < SAVE_SLOTS; i++) if (this.exists(i)) return true; return false; },\n};\n"
        "const modificadorDoSave = s => s?.modificadorCombate === true;",
    )
    replace_once(
        "  tema:'eter',            // tema de interface (ver TEMAS)",
        "  tema:'eter',            // tema de interface (ver TEMAS)\n"
        "  modificadorCombate:false,",
    )
    replace_once(
        "  banner:{text:'', t:0},\n};\n\nfunction makeChar",
        "  banner:{text:'', t:0},\n};\n\n"
        "const ModificadorCombate = {\n"
        "  janelaMs:10000, ciclos:0, inicio:0, aguardandoLigar:false,\n"
        "  reset(){ this.ciclos = 0; this.inicio = 0; this.aguardandoLigar = false; },\n"
        "  registrarSom(mudo, agora = performance.now()){\n"
        "    if (this.inicio && agora - this.inicio > this.janelaMs) this.reset();\n"
        "    if (mudo){ if (!this.inicio) this.inicio = agora; this.aguardandoLigar = true; return false; }\n"
        "    if (!this.aguardandoLigar) return false;\n"
        "    this.aguardandoLigar = false; this.ciclos++;\n"
        "    if (this.ciclos < 3) return false;\n"
        "    G.modificadorCombate = !G.modificadorCombate; this.reset(); return true;\n"
        "  },\n"
        "  alternarSom(){\n"
        "    Sound.init(); const mudo = Sound.toggleMute();\n"
        "    if (this.registrarSom(mudo)) Sound.sfx('crit'); else Sound.sfx('confirm');\n"
        "  },\n"
        "};\n\nfunction makeChar",
    )
    replace_once(
        "  G.moldura = 'nenhuma';\n  G.tema = 'eter';\n  G.playtime = 0;",
        "  G.moldura = 'nenhuma';\n  G.tema = 'eter';\n"
        "  G.modificadorCombate = false;\n  G.playtime = 0;",
    )
    replace_once(
        "  G.tema = TEMAS.some(t => t.id === s.tema) ? s.tema : 'eter';",
        "  G.tema = TEMAS.some(t => t.id === s.tema) ? s.tema : 'eter';\n"
        "  G.modificadorCombate = modificadorDoSave(s);",
    )
    replace_once(
        "{label:() => `Som: ${Sound.muted ? 'DESLIGADO' : 'ligado'}`, run:m => { Sound.init(); Sound.toggleMute(); Sound.sfx('confirm'); }}",
        "{label:() => `Som: ${Sound.muted ? 'DESLIGADO' : 'ligado'}`, run:() => ModificadorCombate.alternarSom()}",
    )
    replace_once(
        "function critChance(u){ return clamp(0.06 + eSPD(u) / 400, 0.03, 0.4); }",
        "function critChance(u){ return clamp(0.06 + eSPD(u) / 400, 0.03, 0.4); }\n"
        "function chanceAcerto(u){\n"
        "  if (!G.modificadorCombate) return eACC(u);\n"
        "  return u.side === 'ally' ? 1 : 0.5;\n"
        "}\n"
        "function chanceCritico(u){ return G.modificadorCombate && u.side === 'ally' ? 0.7 : critChance(u); }\n"
        "function multiplicadorDanoCombate(src, tgt){\n"
        "  if (!G.modificadorCombate) return 1;\n"
        "  if (src.side === 'ally') return 1.2;\n"
        "  if (tgt.side === 'ally') return 0.7;\n"
        "  return 1;\n"
        "}",
    )
    replace_once("if (!chance(eACC(u)))", "if (!chance(chanceAcerto(u)))")
    replace_once("const crit = chance(critChance(u));", "const crit = chance(chanceCritico(u));")
    replace_once(
        "r.dmg = Math.max(1, Math.round(r.dmg * (src.side === 'ally' ? D.dmgOut : D.dmgIn)));",
        "r.dmg = Math.max(1, Math.round(r.dmg * (src.side === 'ally' ? D.dmgOut : D.dmgIn) *\n"
        "      multiplicadorDanoCombate(src, tgt)));",
    )
    return script


def marker_position(script: str, marker: str) -> int:
    if marker == "__SCRIPT_START__":
        return 0
    pos = script.find(marker)
    if pos < 0:
        raise ValueError(f"marcador ausente: {marker}")
    comment = script.rfind("/*", 0, pos)
    comment_end = script.rfind("*/", 0, pos)
    line = script.rfind("\n", 0, pos) + 1
    return comment if comment > comment_end else line


def split_script(script: str, out: Path) -> list[str]:
    positions = [(name, marker_position(script, marker)) for name, marker in PARTS]
    if positions != sorted(positions, key=lambda item: item[1]):
        raise ValueError("marcadores de módulos fora da ordem esperada")
    names: list[str] = []
    for index, (name, start) in enumerate(positions):
        end = positions[index + 1][1] if index + 1 < len(positions) else len(script)
        target = out / "scripts" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(script[start:end].strip() + "\n", encoding="utf-8")
        names.append(f"scripts/{name}")
    return names


def migrate(source: Path, out: Path) -> None:
    html = source.read_text(encoding="utf-8")
    style_match = re.search(r"<style[^>]*>(.*?)</style>", html, re.S)
    script_match = re.search(r"<script[^>]*>(.*?)</script>\s*</body>", html, re.S)
    if not style_match or not script_match:
        raise ValueError("HTML não possui os blocos únicos de style/script esperados")

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    script, catalog = externalize(script_match.group(1), out)
    script = preserve_runtime_contracts(script)
    scripts = split_script(script, out)

    css = style_match.group(1).strip() + "\n"
    css = re.sub(
        r"\s*@import url\([^\n]+\);",
        "\n@font-face{font-family:'Press Start 2P';src:url('../assets/fontes/press-start-2p-latin-ext.woff2') format('woff2');font-display:swap}\n"
        "@font-face{font-family:'Inter';src:url('../assets/fontes/inter-latin-ext.woff2') format('woff2');font-weight:400 600;font-display:swap}",
        css,
        count=1,
    )
    (out / "styles").mkdir()
    (out / "styles" / "game.css").write_text(css, encoding="utf-8")
    font_source = Path(__file__).resolve().parents[1] / "assets" / "fontes"
    shutil.copytree(font_source, out / "assets" / "fontes")

    tags = "\n".join(f'<script src="{name}"></script>' for name in scripts)
    result = html[:style_match.start()] + '<link rel="stylesheet" href="styles/game.css">' + html[style_match.end():script_match.start()] + tags + "\n</body>\n</html>\n"
    (out / "index.html").write_text(result, encoding="utf-8")

    metadata = {
        "source": source.name,
        "source_bytes": source.stat().st_size,
        "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest(),
        "version": re.search(r"APP_VERSION\s*=\s*['\"]([^'\"]+)", script).group(1),
        "assets": catalog,
        "scripts": scripts,
    }
    (out / "asset-catalog.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"versao={metadata['version']} assets={len(catalog)} scripts={len(scripts)} destino={out}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()
    migrate(args.source.resolve(), args.out.resolve())


if __name__ == "__main__":
    main()
