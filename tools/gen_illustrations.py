#!/usr/bin/env python3
"""Generates one illustration per section type for the "Add a section" modal.

Structure follows the product-ui-illustrations skill: the GEO block and the
primitives are the shared visual language (copied verbatim, never varied); the
LAYOUTS below are one composition per section, varied on purpose.

Output is `src/ui/illustrations.ts` — a name -> SVG-string map. The SVG is
inlined by React rather than loaded through <img>, because CSS custom
properties do not cross into <img>, and every id is suffixed with the section
name so masks and filters can't cross-apply.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icons import PHOSPHOR

# ---------------------------------------------------------------- geometry --
GEO = dict(
    SIZE=160,
    PANEL_X=21, PANEL_W=118, PANEL_Y=8, PANEL_R=10,
    CARD_X=11,  CARD_W=138,  CARD_Y=24, CARD_H=27, CARD_R=8,
    MED_CX=80,  MED_CY=33,   MED_R=14,
    FADE_A=0.70, FADE_B=0.82,
    PAD=10,
    SW=0.5,          # THE stroke width. Every stroke, everywhere.
    CPAD=8,
)
G = GEO
SW = GEO['SW']
LINE = 'var(--il-line, #B9B1A4)'
FILL = 'var(--il-fill, #DCD6CE)'
FSOFT = 'var(--il-fill-soft, #E9E4DC)'
SOFT = 'var(--il-stroke-soft, #9B948A)'
SURF = 'var(--il-surface, #FFFFFF)'
GHOST = 'var(--il-ghost, #EAE7E2)'
ACC = 'var(--il-accent, #3E9077)'
STRK = 'var(--il-stroke, #35322D)'

BRAND = ['#C25E3E', '#2F9468', '#5C82CE', '#B08A3E', '#8A6BC0']


# ------------------------------------------------------------- primitives --
def icon(name, x, y, size, color=STRK, weight='regular'):
    sc = size / 256.0
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({sc:.5f})" fill="{color}">'
            f'<path d="{PHOSPHOR[weight][name]}"/></g>')


def avatar(x, y, size, color=SOFT):
    return icon('user-circle', x, y, size, color)


def bar(x, y, w, h=5, fill=FILL):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{h/2:.2f}" fill="{fill}"/>'


def barpair(x, y, w1, w2, h1=4.2, h2=5.2, gap=7.6):
    return bar(x, y, w1, h1) + bar(x, y + gap, w2, h2)


def dot(x, y, r, on=True, c=FILL):
    return (f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{c}"/>' if on else
            f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="none" stroke="{LINE}" stroke-width="{SW}"/>')


def rule(x1, x2, y, op=0.8):
    return f'<rect x="{x1}" y="{y}" width="{x2-x1}" height="{SW}" fill="{LINE}" opacity="{op}"/>'


def vrule(x, y1, y2, op=0.75):
    return f'<rect x="{x}" y="{y1}" width="{SW}" height="{y2-y1}" fill="{LINE}" opacity="{op}"/>'


def backdrop(kind, x, w, y, h=None):
    r = G['PANEL_R'] + 6
    if kind == 'none':
        return ''
    if kind == 'plate':
        return (f'<rect x="{x-7}" y="{y+4}" width="{w+14}" height="{(h or 160-y)+6}" rx="{r}" '
                f'fill="{GHOST}" stroke="{LINE}" stroke-width="{SW}"/>')
    if kind == 'offset':
        return (f'<rect x="{x+8}" y="{y+8}" width="{w}" height="{(h or 160-y)}" rx="{G["PANEL_R"]}" '
                f'fill="{GHOST}" stroke="{LINE}" stroke-width="{SW}"/>')
    if kind == 'twin':
        return ''.join(
            f'<rect x="{x-d}" y="{y+d}" width="{w+2*d}" height="{(h or 160-y)}" rx="{G["PANEL_R"]+d//2}" '
            f'fill="{GHOST}" stroke="{LINE}" stroke-width="{SW}"/>'
            for d in (10, 5))
    raise ValueError(kind)


def panel(uid, x=21, w=118, y=8, h=None, mode='fade', chrome=False, back='plate'):
    r = G['PANEL_R']
    s = backdrop(back, x, w, y, h)
    if mode == 'fade':
        p = f"M{x} {y+r}a{r} {r} 0 0 1 {r} -{r}h{w-2*r}a{r} {r} 0 0 1 {r} {r}V160H{x}z"
        s += f'<path d="{p}" fill="url(#panelG-{uid})" stroke="{LINE}" stroke-width="{SW}"/>'
    else:
        s += (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" '
              f'fill="url(#panelG-{uid})" stroke="{LINE}" stroke-width="{SW}"/>')
    if chrome:
        s += ''.join(dot(x + 10 + i * 5.5, y + 9, 1.7, True, LINE) for i in range(3))
        s += rule(x, x + w, y + 16, 0.55)
    return s


def card(x, y, w, h, r, uid, lift=True, fill=SURF, stroke=LINE):
    big = w * h > 2600
    f = (f' filter="url(#lift{"L" if big else ""}-{uid})"') if lift else ''
    return (f'<g{f}><rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{SW}"/></g>')


def tile(x, y, s=16, r=5, fill=None):
    if fill:
        return f'<rect x="{x}" y="{y}" width="{s}" height="{s}" rx="{r}" fill="{fill}"/>'
    return (f'<rect x="{x}" y="{y}" width="{s}" height="{s}" rx="{r}" fill="none" '
            f'stroke="{LINE}" stroke-width="{SW}"/>' + dot(x + s / 2, y + s / 2, 2.4))


def media(x, y, w, h, r=6):
    """An image placeholder: outlined well with a small centred glyph."""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{FSOFT}" '
            f'stroke="{LINE}" stroke-width="{SW}"/>'
            + icon('squares-four', x + w / 2 - 5, y + h / 2 - 5, 10, SOFT))


def kebab(x, y):
    return ''.join(dot(x, y + i * 3.6, 1.15, True, SOFT) for i in (-1, 0, 1))


def check(x, y, s=9, c=ACC):
    return icon('check', x, y, s, c)


def pill(x, y, w, h=11, sel=False):
    edge = '' if sel else f' stroke="{LINE}" stroke-width="{SW}"'
    fill = FSOFT if sel else 'none'
    return (f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{h}" rx="{h/2}" '
            f'fill="{fill}"{edge}/>')


def accent_pill(x, y, w, h=11):
    """The one interaction cue. Accent budget: at most two per illustration."""
    return f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{h}" rx="{h/2}" fill="{ACC}"/>'


def field(x, y, w, h=13):
    """An input well."""
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{SURF}" '
            f'stroke="{LINE}" stroke-width="{SW}"/>' + bar(x + 6, y + h / 2 - 2, w * 0.42, 4, FSOFT))


def medallion(uid, ic, cx=80, cy=None, r=None, lift=False):
    cy = G['MED_CY'] if cy is None else cy
    r = G['MED_R'] if r is None else r
    f = f' filter="url(#lift-{uid})"' if lift else ''
    return (f'<g{f}><circle cx="{cx}" cy="{cy}" r="{r}" fill="{SURF}" '
            f'stroke="{LINE}" stroke-width="{SW}"/></g>'
            + icon(ic, cx - 7.5, cy - 7.5, 15))


def svg(uid, label, faded, floating=''):
    return f'''<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{label}" class="il">
<defs>
<linearGradient id="fadeG-{uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="{G['FADE_A']}" stop-color="#fff"/><stop offset="{G['FADE_B']}" stop-color="#000"/>
</linearGradient>
<mask id="fade-{uid}"><rect width="160" height="160" fill="url(#fadeG-{uid})"/></mask>
<linearGradient id="panelG-{uid}" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="var(--il-panel-top, #FCFBF9)"/>
<stop offset="1" stop-color="var(--il-panel, #F7F5F2)"/>
</linearGradient>
<filter id="lift-{uid}" x="-60%" y="-60%" width="220%" height="220%">
<feDropShadow dx="0" dy="2" stdDeviation="2.6" flood-color="var(--il-shadow-c, #4A3F33)" flood-opacity="var(--il-shadow-o, 0.16)"/>
</filter>
<filter id="liftL-{uid}" x="-60%" y="-60%" width="220%" height="220%">
<feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="var(--il-shadow-c, #4A3F33)" flood-opacity="var(--il-shadow-o, 0.16)"/>
</filter>
</defs>
<g mask="url(#fade-{uid})">{faded}</g>
{floating}</svg>'''


# ------------------------------------------------------------------ guards --
CLEARANCE = 2.0


def fits(x0, x1, size, what='glyph'):
    room = x1 - x0
    if size + 2 * CLEARANCE > room:
        raise ValueError(f'{what} needs {size + 2*CLEARANCE} of room, gap {x0}..{x1} is {room}.')
    return x0 + (room - size) / 2


def padded(card_y, card_h, top, bottom, what='card'):
    t, b = top - card_y, (card_y + card_h) - bottom
    if b <= 0:
        raise ValueError(f'{what}: content overflows the bottom by {-b:.1f}.')
    if abs(t - b) > 4:
        raise ValueError(f'{what}: padding is {t:.1f} top vs {b:.1f} bottom.')
    return True


# =========================================================== L A Y O U T S ==

def hero(uid, label):
    """A headline over a hero image. Float: a raised statement card — the
    subject of a hero IS the statement, so the statement is what lifts."""
    b = panel(uid, 21, 118, 8, back='twin')
    b += media(31, 74, 98, 54)                       # the image, dissolving
    f = card(11, 26, 138, 34, G['CARD_R'], uid)
    f += bar(24, 35, 62, 6) + bar(24, 45.5, 40, 4.4)
    f += accent_pill(97, 36.5, 20, 10) + pill(120, 36.5, 16, 10)
    padded(26, 34, 35, 49.9, 'hero statement')
    return svg(uid, label, b, f)


def features(uid, label):
    """Many capabilities of equal weight. Float: a corner chip — the header
    band is content here, and a full-width bar would outrank the grid."""
    b = panel(uid, 21, 118, 8, back='none')
    for r in range(3):
        for c in range(2):
            x, y = 31 + c * 52, 46 + r * 30
            b += card(x, y, 46, 24, 7, uid, lift=False)
            b += tile(x + 6, y + 6, 11, 3.5, None)
            b += bar(x + 22, y + 10, 18, 4.2)
    chip = card(13, 14, 62, 22, 8, uid) + icon('squares-four', 22, 19, 12) + bar(39, 24.4, 26, 4.6)
    return svg(uid, label, b, chip)


def logos(uid, label):
    """Third-party marks in a row. Brand colour is exempt from the accent
    budget — it belongs to the logos, not to the illustration."""
    b = panel(uid, 22, 116, 8, back='none')
    b += bar(58, 62, 44, 4.6, FSOFT)
    for r in range(2):
        for i in range(4):
            x, y = 33 + i * 22, 78 + r * 24
            b += tile(x, y, 14, 4, BRAND[(r * 4 + i) % len(BRAND)])
    f = card(11, 24, 138, 26, 9, uid)
    for i, c in enumerate(BRAND[:4]):
        f += tile(26 + i * 23, 31.5, 12, 4, c)
    f += vrule(119, 31, 43, 0.8) + icon('buildings', 128, 32, 10, SOFT)
    return svg(uid, label, b, f)


def stats(uid, label):
    """Ascending columns. No float: the figures ARE the subject, and a title
    bar above them would be the only thing anyone read."""
    b = panel(uid, 24, 112, 22, h=100, mode='contained', back='plate')
    b += bar(36, 34, 30, 5) + bar(36, 43.5, 48, 4.2)
    base = 106                      # keeps every bar base clear of the fade
    for i, h in enumerate((20, 30, 40, 52)):
        x = 38 + i * 22
        b += f'<rect x="{x}" y="{base-h}" width="13" height="{h}" rx="4" fill="{FILL if i < 3 else ACC}"/>'
    b += rule(30, 130, base + 5, 0.7)
    return svg(uid, label, b)


def testimonials(uid, label):
    """Three quotes, the middle one raised. A set with one chosen."""
    b = panel(uid, 16, 128, 44, h=92, mode='contained', back='none')
    for i, x in enumerate((22, 92)):
        b += card(x, 54, 46, 50, 9, uid, lift=False)
        b += f'<circle cx="{x+23}" cy="70" r="9.5" fill="{BRAND[i+1]}" opacity="0.3"/>'
        b += avatar(x + 17, 64, 12)
        b += bar(x + 11, 86, 24, 4.2) + bar(x + 8, 93, 30, 4.2)
    b += bar(48, 112, 64, 5) + bar(58, 121, 44, 4.4)
    mid = card(55, 32, 50, 60, 11, uid)
    mid += f'<circle cx="80" cy="52" r="12" fill="{ACC}" opacity="0.14"/>'
    mid += avatar(72.5, 44.5, 15, ACC)
    mid += bar(65, 70, 30, 4.8) + bar(61, 78.5, 38, 4.8)
    return svg(uid, label, b, mid)


def pricing(uid, label):
    """A plan/feature grid — the relationship is comparison, not listing.
    Float: a corner chip, because the column heads own the header band."""
    b = panel(uid, 21, 118, 8, back='none')
    cols = [92, 110, 128]
    for i, x in enumerate(cols):
        if i == 1:
            b += accent_pill(x - 9, 46, 18, 10)
        else:
            b += pill(x - 8, 46, 16, 10)
    b += rule(30, 134, 64)
    for r, cells in enumerate([[1, 1, 1], [0, 1, 1], [0, 1, 1], [0, 0, 1]]):
        y = 76 + r * 13
        b += bar(31, y - 2.5, 40, 5)
        for x, on in zip(cols, cells):
            if on and x == cols[1] and r < 3:
                b += check(x - 4.5, y - 4.5, 9, SOFT)
            else:
                b += dot(x, y, 3, bool(on))
    chip = card(13, 16, 62, 22, 8, uid) + icon('tag', 22, 21, 12) + bar(39, 24.4, 26, 4.6)
    return svg(uid, label, b, chip)


def gallery(uid, label):
    """A mosaic. No float: the grid is the surface, and the surface is the
    subject."""
    b = panel(uid, 15, 130, 8, back='plate')
    b += media(25, 20, 68, 52)
    b += media(97, 20, 38, 24, 5)
    b += media(97, 48, 38, 24, 5)
    for i in range(3):
        b += media(25 + i * 37, 80, 33, 34, 5)
    return svg(uid, label, b)


def faq(uid, label):
    """One answer open among stacked questions. Float: the open row itself —
    the subject is one of the content items, so that item lifts."""
    b = panel(uid, 25, 110, 8, back='offset')
    for i in range(3):
        y = 86 + i * 20
        b += bar(37, y, 46, 5) + icon('caret-down', 116, y - 2.5, 10, SOFT)
        if i < 2:
            b += rule(35, 125, y + 12, 0.5)
    f = card(15, 34, 130, 40, 8, uid)
    f += bar(27, 42, 50, 5) + icon('caret-right', 126, 39.5, 10, SOFT)
    f += bar(27, 54, 96, 4.2) + bar(27, 61, 72, 4.2)
    padded(34, 40, 42, 65.2, 'open answer')
    return svg(uid, label, b, f)


def contact(uid, label):
    """A form. Float: a medallion — the feature is a thing (a way to reach
    someone), not a record."""
    b = panel(uid, 22, 116, 30, h=94, mode='contained', back='plate')
    b += field(34, 58, 44) + field(84, 58, 44)
    b += field(34, 78, 94)
    b += accent_pill(34, 98, 42, 12)
    return svg(uid, label, b, medallion(uid, 'chat-circle', cy=37, r=15))


def cursor(x, y, c=ACC):
    return f'<path d="M{x} {y}l4.6 11.4 1.8-4.6 4.6-1.8z" fill="{c}"/>'


def cta(uid, label):
    """One decisive action. No medallion — the button IS the subject, so the
    button is the thing that lifts, and a cursor supplies the interaction cue.
    (An earlier pass had a medallion over a pill here, which made this a twin
    of the contact card at thumbnail size.)"""
    b = panel(uid, 30, 100, 34, h=92, mode='contained', back='twin')
    b += bar(48, 52, 64, 6) + bar(56, 64, 48, 4.4) + bar(62, 74, 36, 4.4)
    f = card(52, 92, 56, 22, 11, uid)
    f += accent_pill(60, 98, 40, 10)
    f += cursor(96, 106)
    padded(92, 22, 98, 108, 'cta button')
    return svg(uid, label, b, f)


def guides(uid, label):
    """Categories with articles hanging off them. Two chips on the diagonal:
    a thing with parts attached."""
    b = panel(uid, 28, 104, 8, back='offset')
    b += bar(96, 20, 18, 4.6) + kebab(124, 22.5)
    b += rule(28, 132, 34, 0.5)
    for i in range(4):
        y = 46 + i * 19
        b += icon('book-open', 38, y, 12, SOFT)
        b += barpair(56, y - 0.5, 24, 52, 4, 5, 7.2)
    a = card(13, 12, 58, 21, 8, uid) + icon('graduation-cap', 22, 17, 12) + bar(39, 20.4, 24, 4.6)
    c = card(91, 94, 58, 21, 8, uid) + icon('stack', 100, 99, 12, SOFT) + bar(117, 102.4, 24, 4.6)
    return svg(uid, label, b, a + c)


def api_reference(uid, label):
    """Endpoint rows with method pills. Window chrome and no float: this is a
    real surface with more of it off-screen."""
    b = panel(uid, 13, 134, 8, chrome=True, back='twin')
    for i in range(4):
        y = 34 + i * 22
        b += card(21, y, 118, 18, 6, uid, lift=(i == 0))
        b += pill(26, y + 3.5, 22, 11, i == 0)
        b += bar(30, y + 7.6, 14, 3.4, ACC if i == 0 else SOFT)
        b += bar(54, y + 6.6, 40, 4.4)
        b += kebab(130, y + 9)
    return svg(uid, label, b)


def recipes(uid, label):
    """A stack of solutions, one lifted out. A group, receding."""
    b = panel(uid, 25, 110, 8, back='offset')
    for i, (x, w, h, op) in enumerate([(35, 90, 16, 0.70), (45, 70, 13, 0.40)]):
        y = 84 + i * 22
        b += f'<g opacity="{op}">' + card(x, y, w, h, 6.5, uid, lift=False)
        b += icon('cube', x + 6, y + h / 2 - 5, 10, SOFT)
        b += bar(x + 21, y + h / 2 - 2.1, w - 38, 4.2)
        b += icon('arrow-right', x + w - 14, y + h / 2 - 4.2, 8.5, SOFT) + '</g>'
    top = card(13, 56, 134, 21, 7, uid)
    top += icon('cube', 23, 61.5, 11) + bar(41, 64.7, 50, 4.6)
    top += pill(100, 61, 22, 11) + bar(105, 65, 12, 3.2, SOFT)
    return svg(uid, label, b, medallion(uid, 'brackets-curly') + top)


def awards(uid, label):
    """Recognition: a dated record of awards. Float: a medallion — the thing
    being illustrated is an honour, not a screen."""
    b = panel(uid, 25, 110, 8, back='offset')
    b += bar(58, 56, 44, 5) + bar(66, 66, 28, 4.2, FSOFT)
    for i in range(4):
        y = 84 + i * 17
        b += bar(37, y, 13, 4.2, FSOFT)
        b += bar(57, y, 44, 4.6)
        b += bar(108, y, 16, 3.6, FSOFT)
        if i < 3:
            b += rule(35, 125, y + 9.5, 0.5)
    return svg(uid, label, b, medallion(uid, 'check-circle', cy=30, r=15, lift=True))


def featured_apis(uid, label):
    """A catalogue: categories on the left, the APIs they hold on the right.
    Float: a corner chip, because the cards own the body."""
    b = panel(uid, 21, 118, 8, back='none')
    for r in range(3):
        for c in range(2):
            b += tile(31 + c * 20, 60 + r * 20, 16, 5, None)
    for i in range(2):
        y = 60 + i * 34
        b += card(78, y, 52, 28, 7, uid, lift=False)
        b += f'<rect x="78" y="{y}" width="52" height="9" rx="3.5" fill="{ACC}" opacity="0.8"/>'
        b += bar(84, y + 14, 30, 4.6) + bar(84, y + 21, 22, 3.6, FSOFT)
    chip = card(13, 14, 66, 22, 8, uid) + icon('brackets-curly', 22, 19, 12) + bar(39, 24.4, 30, 4.6)
    return svg(uid, label, b, chip)


def marketplace(uid, label):
    """Capabilities beside a live console. Float: the console — the promise of
    this section is that you can run the thing right here."""
    b = panel(uid, 15, 130, 8, back='plate')
    for i in range(4):
        y = 30 + i * 20
        b += icon('cube', 25, y, 11, SOFT if i else STRK)
        b += barpair(42, y, 26, 40, 4.2, 4.6, 7.4)
        if i < 3:
            b += rule(23, 74, y + 15, 0.45)
    f = card(84, 26, 62, 76, 8, uid)
    f += rule(84, 146, 40, 0.6) + bar(90, 31, 20, 4.2, FSOFT)
    for i, w in enumerate((44, 32, 38, 26, 40)):
        b2 = bar(90, 48 + i * 10, w, 3.6, FILL if i % 2 else FSOFT)
        f += b2
    f += accent_pill(90, 88, 22, 9)
    return svg(uid, label, b, f)


def getting_started(uid, label):
    """A journey: four steps, each leading to the next."""
    b = panel(uid, 13, 134, 8, back='none')
    b += bar(24, 26, 56, 5.4) + bar(24, 36, 36, 4.2, FSOFT)
    for i in range(4):
        x = 22 + i * 30
        b += card(x, 56, 24, 46, 6, uid, lift=(i == 0))
        b += dot(x + 12, 66, 3.4, i == 0, ACC if i == 0 else FILL)
        b += bar(x + 5, 76, 14, 4.2) + bar(x + 5, 84, 10, 3.4, FSOFT)
        if i < 3:
            b += icon('arrow-right', x + 26.5, 74, 8, SOFT)
    return svg(uid, label, b)


def solution(uid, label):
    """Verticals on the left, the stack each one needs on the right. No float:
    the pairing IS the subject."""
    b = panel(uid, 15, 130, 8, chrome=True, back='plate')
    for i in range(4):
        y = 34 + i * 20
        b += card(23, y, 42, 16, 5, uid, lift=False,
                  stroke=ACC if i == 0 else LINE)
        b += bar(28, y + 5.8, 24, 4.4 if i == 0 else 4)
    b += media(73, 34, 70, 44)
    for i in range(2):
        y = 84 + i * 17
        b += card(73, y, 70, 13, 5, uid, lift=False)
        b += bar(79, y + 4.5, 34, 4.2) + icon('arrow-right', 128, y + 2.5, 8, SOFT)
    return svg(uid, label, b)


def why_choose_us(uid, label):
    """Reasons around one raised claim. Float: the claim that matters most."""
    b = panel(uid, 21, 118, 8, back='none')
    b += bar(56, 20, 48, 5.4) + bar(64, 30, 32, 4.2, FSOFT)
    for r in range(2):
        for c in range(2):
            x, y = 29 + c * 62, 46 + r * 44
            b += card(x, y, 44, 38, 7, uid, lift=False)
            b += tile(x + 6, y + 6, 12, 4, None)
            b += bar(x + 6, y + 23, 30, 4.4) + bar(x + 6, y + 31, 22, 3.6, FSOFT)
    f = card(56, 58, 48, 44, 9, uid)
    f += f'<circle cx="80" cy="72" r="11" fill="{ACC}" opacity="0.16"/>'
    f += icon('shield-check', 73, 65, 14, ACC)
    f += bar(64, 85, 32, 4.6) + bar(68, 92, 24, 3.6, FSOFT)
    padded(58, 44, 65, 95.6, 'why claim')
    return svg(uid, label, b, f)


def resources(uid, label):
    """Articles: covers and their titles. Float: the lead story."""
    b = panel(uid, 15, 130, 8, back='plate')
    for i in range(2):
        x = 25 + i * 58
        b += media(x, 88, 50, 30, 5)
        b += bar(x, 124, 20, 3.6, FSOFT) + bar(x, 132, 40, 4.6)
    f = card(13, 26, 134, 52, 8, uid)
    f += media(21, 34, 52, 36, 6)
    f += bar(82, 40, 18, 3.6, FSOFT)
    f += bar(82, 50, 54, 5) + bar(82, 59, 40, 4.2)
    return svg(uid, label, b, f)


def partners(uid, label):
    """Marks in one row. Brand colour is exempt from the accent budget — it
    belongs to the partners, not to the illustration."""
    b = panel(uid, 22, 116, 40, h=76, mode='contained', back='twin')
    b += bar(62, 56, 36, 4.6, FSOFT)
    for i, c in enumerate(BRAND[:4]):
        b += tile(34 + i * 24, 76, 16, 5, c)
    b += rule(34, 126, 104, 0.5)
    b += bar(58, 114, 44, 4.2, FSOFT)
    return svg(uid, label, b, medallion(uid, 'users-three', cy=40, r=14, lift=True))


def references(uid, label):
    """A closing banner with the product beside it. Float: the app panel."""
    b = panel(uid, 21, 118, 8, back='offset')
    b += card(13, 34, 134, 60, 9, uid, lift=False)
    b += bar(26, 48, 54, 5.4) + bar(26, 59, 44, 4.2) + bar(26, 68, 32, 4.2, FSOFT)
    b += accent_pill(26, 80, 34, 10)
    f = card(96, 24, 44, 80, 9, uid)
    f += rule(96, 140, 38, 0.6) + bar(102, 30, 18, 4.2, FSOFT)
    f += bar(102, 46, 32, 5)
    for i in range(3):
        y = 60 + i * 14
        f += dot(108, y + 3, 4, i == 0, ACC if i == 0 else FILL)
        f += bar(118, y + 1, 16, 4.2)
    return svg(uid, label, b, f)


SET = [
    ('hero', 'Hero', hero),
    ('features', 'Features', features),
    ('logos', 'Logo strip', logos),
    ('stats', 'Stats', stats),
    ('testimonials', 'Testimonials', testimonials),
    ('pricing', 'Pricing', pricing),
    ('gallery', 'Gallery', gallery),
    ('faq', 'FAQ', faq),
    ('contact', 'Contact', contact),
    ('cta', 'Call to action', cta),
    ('docsIndex', 'Guides index', guides),
    ('apiReference', 'API reference', api_reference),
    ('recipes', 'Product recipes', recipes),
    ('awards', 'Awards & Recognition', awards),
    ('featuredApis', 'Featured APIs', featured_apis),
    ('marketplace', 'Marketplace & Features', marketplace),
    ('gettingStarted', 'Getting Started', getting_started),
    ('solution', 'Solution', solution),
    ('whyChooseUs', 'Why Choose Us', why_choose_us),
    ('resources', 'Resources', resources),
    ('partners', 'Trusted Partners', partners),
    ('references', 'References', references),
]

if __name__ == '__main__':
    out = {}
    for uid, label, fn in SET:
        out[uid] = fn(uid, label)

    here = os.path.dirname(os.path.abspath(__file__))
    dest = os.path.join(here, '..', 'src', 'ui', 'illustrations.ts')
    body = ',\n'.join(
        f"  {uid}: `{doc}`" for uid, doc in out.items()
    )
    open(dest, 'w').write(
        "/* GENERATED by tools/gen_illustrations.py — do not edit by hand.\n"
        "   One abstract illustration per section type, built with the\n"
        "   product-ui-illustrations skill's visual language: one stroke width,\n"
        "   one shadow, placeholder bars over words, and a single accent that\n"
        "   picks up the brand colour through --il-accent.\n\n"
        "   Inlined (not <img>) so the --il-* custom properties reach it; every\n"
        "   id is suffixed with the section name so masks never cross-apply. */\n\n"
        "export const ILLUSTRATIONS: Record<string, string> = {\n" + body + ",\n}\n"
    )
    print(f'wrote {len(out)} illustrations to src/ui/illustrations.ts')
