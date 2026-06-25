# Wayfarer's Codex: Scrying Station

A fantasy Discord theme that turns the app into a translucent scrying desk:
glass-like panels over an original candlelit scholar's table scene.

This project is fantasy-inspired without using licensed settings, characters,
logos, maps, or commercial tabletop game art.

## What's Included

- `WayfarersCodex-ScryingStation.theme.css` - the BetterDiscord theme
- `preview-scrying-station.html` - offline visual preview
- `assets/scrying-station.webp` - optimized background scene
- `assets/scrying-station-source.png` - full-quality source scene

## Current Version

- Theme: `2.0.57`
- Plugin: none required

Recent improvements:

- Persistent panels are kept at one light 10% glass layer.
- Unread channels get a teal row glow using Discord's native CSS unread state.
- Native server unread dots and badges keep their Discord-provided behavior.
- Voice speaking styling uses Discord's native speaking classes when available.
- Member and chat name colors stay controlled by Discord/server role settings.
- Right-side member hover paint is removed so the whole panel does not light up.
- Activity/Active Now card hover paint is also removed so the whole right side
  does not light up.
- Discord's top/bottom unread jump bars inside the left channel panel are
  hidden without affecting real unread channel highlights.
- The companion plugin has been retired for this build; the theme is CSS-only.
- The runtime CSS avoids imports, `:has()` selectors, live backdrop blur,
  filters, animations, and JavaScript-driven panel scans.
- Video/call wrapper surfaces use transparency where Discord allows it. Black
  pixels inside the actual stream/video cannot be made transparent by CSS.
- The non-prioritized/floating video content is enlarged to 2.5x and grows
  downward without forcing Discord's drag position or screen anchor.
- Member names keep their normal/role colors when hovering the member list.

## Install

1. Download `WayfarersCodex-ScryingStation.theme.css`.
2. Put it in your BetterDiscord themes folder.
3. Remove or disable `WayfarersCodex-UnreadIndicators.plugin.js` if you
   installed an older version.
4. Reload Discord, then enable the theme.

The theme loads its background image from this repository, so Discord needs an
internet connection for the desk scene to appear.

## Customize Transparency

The main glass surfaces are set to 10% opacity:

```css
--wc-glass: rgba(30, 19, 13, 0.10);
```

Increase the last number for darker panels, or decrease it for more of the
desk scene showing through.

## Troubleshooting

If unread channel highlights stop working after a Discord update, restart
Discord first. This CSS-only build follows Discord's native unread classes, so
it stays lightweight but cannot calculate unread state itself.

If the theme still looks stale after updating, remove the old theme file and
install the current version again. Also make sure the old companion plugin is
disabled or removed.

## Notes

BetterDiscord and similar client modifications are third-party software. Review
the current terms and security guidance for your chosen client before installing
any add-on.
