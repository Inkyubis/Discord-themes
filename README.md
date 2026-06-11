# Wayfarer's Codex: Scrying Station

An original fantasy Discord theme that presents the interface as translucent
magical glass floating over a candlelit scholar's desk. The scene includes an
open parchment, brass instruments, crystals, candles, and a luminous scrying
orb.

## Install

The image is embedded inside the CSS. Installation requires only one file:

1. Open your custom client theme folder.
2. Place `WayfarersCodex-ScryingStation.theme.css` in that folder.
3. Return to Discord and enable **Wayfarer's Codex: Scrying Station**.

The ZIP also contains:

- `preview-scrying-station.html` - offline visual preview
- `assets/scrying-station.webp` - compact scene image
- `assets/scrying-station-source.png` - full-quality source scene

Client modifications are third-party software. Review the current terms and
security guidance for your chosen client before installing one.

## Customize

The main controls are near the top of the CSS:

```css
--wc-glass-deep: rgba(3, 10, 11, 0.70);
--wc-glass: rgba(7, 19, 20, 0.52);
--wc-glass-soft: rgba(11, 29, 29, 0.37);
--wc-nav-glass: rgba(7, 19, 20, 0.35);
--wc-teal: #63e6dc;
--wc-amber: #e4aa55;
```

Lower the final number in an `rgba()` glass color to reveal more of the desk.
Raise it for stronger text contrast. `--wc-nav-glass` controls the server
channel list, direct-message/friends navigation, friends list, and member list.

## Originality

The scene, interface treatment, palette, and terminology were created for this
package. The image uses generic fantasy objects and contains no copied logos,
named settings, recognizable characters, commercial maps, or franchise art.

Avoid adding protected logos, signature characters, copied rulebook layouts, or
recognizable assets from commercial tabletop properties.

## Compatibility

Discord regularly changes internal class names. This theme favors Discord color
tokens and partial class selectors to reduce breakage, but future updates may
require selector maintenance.
