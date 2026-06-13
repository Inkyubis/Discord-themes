/**
 * @name WayfarersCodexUnreadIndicators
 * @author Inkyubis & Byte
 * @version 1.0.1
 * @description Keeps server-rail unread markers visible without marking muted or stale channel state.
 */

module.exports = class WayfarersCodexUnreadIndicators {
  start() {
    this.readState = BdApi.Webpack.getStore("GuildReadStateStore");
    this.scheduleUpdate = () => {
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(() => this.updateMarkers());
    };

    this.observer = new MutationObserver(this.scheduleUpdate);
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.readState?.addChangeListener(this.scheduleUpdate);

    BdApi.DOM.addStyle(
      "WayfarersCodexUnreadIndicators",
      `
        #app-mount nav[aria-label*="Servers"]
          [class*="listItem_"][data-wc-unread="true"] {
          position: relative;
        }

        #app-mount nav[aria-label*="Servers"]
          [class*="listItem_"][data-wc-unread="true"]::before {
          content: "";
          position: absolute;
          z-index: 10;
          top: 50%;
          left: 0;
          width: 4px;
          height: 10px;
          border-radius: 0 4px 4px 0;
          background: var(--wc-teal, #63e6dc) !important;
          box-shadow: 0 0 12px rgba(99, 230, 220, 0.9) !important;
          transform: translateY(-50%);
        }
      `
    );

    this.updateMarkers();
  }

  updateMarkers() {
    const treeItems = document.querySelectorAll(
      'nav[aria-label*="Servers"] [data-list-item-id^="guildsnav___"]'
    );

    for (const treeItem of treeItems) {
      const guildId = treeItem.dataset.listItemId?.replace("guildsnav___", "");
      if (!/^\d+$/.test(guildId || "")) continue;

      const unread =
        this.readState?.hasUnread(guildId) ||
        this.readState?.getMentionCount(guildId) > 0;
      const listItem = treeItem.closest('[class*="listItem_"]');

      if (listItem) {
        if (unread) {
          listItem.setAttribute("data-wc-unread", "true");
        } else {
          listItem.removeAttribute("data-wc-unread");
        }
      }
    }
  }

  stop() {
    cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
    this.readState?.removeChangeListener(this.scheduleUpdate);
    BdApi.DOM.removeStyle("WayfarersCodexUnreadIndicators");

    document
      .querySelectorAll('[data-wc-unread="true"]')
      .forEach((element) => element.removeAttribute("data-wc-unread"));
  }
};
