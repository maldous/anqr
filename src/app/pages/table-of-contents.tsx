import { List } from "lucide-react";
import { useEffect, useState } from "react";
import { renderTocContent } from "./render-toc-content";
import type { TocGroup } from "./static-page-types";
import { TableOfContentsPanelHeader } from "./table-of-contents-panel-header";
import type { TableOfContentsProps } from "./table-of-contents.types";

export function TableOfContents({
  groups,
  activeSlug,
  onNavigate,
  onClose,
  isOpen,
  t,
}: TableOfContentsProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groups.length > 0 ? [groups[0].key] : []),
  );

  useEffect(() => {
    setExpandedGroups(new Set(groups.length > 0 ? [groups[0].key] : []));
  }, [groups]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleItemClick = (slug: string) => {
    onNavigate(slug);
    setMobileOpen(false);
  };

  const handleGroupClick = (group: TocGroup) => {
    if (group.id) {
      handleItemClick(group.id);
    } else if (group.items.length > 0) {
      handleItemClick(group.items[0].id);
    }
    if (!expandedGroups.has(group.key)) {
      toggleGroup(group.key);
    }
  };

  const tocContent = renderTocContent(
    groups,
    activeSlug,
    expandedGroups,
    handleGroupClick,
    toggleGroup,
    handleItemClick,
  );

  return (
    <>
      <div className="lg:hidden">
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="fixed z-50 p-2.5 rounded-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            style={{ top: "calc(60px + env(safe-area-inset-top, 0px) + 12px)", left: "12px" }}
            title={t("accessibility.openGuideSidebar")}
          >
            <List className="h-5 w-5" />
          </button>
        )}

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 cursor-default"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <div
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-background border-r shadow-xl transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <TableOfContentsPanelHeader
            className="flex items-center justify-between p-4 border-b"
            onClose={() => setMobileOpen(false)}
            title={t("accessibility.closeSidebar")}
          />
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)] scrollbar-hide">{tocContent}</div>
        </div>
      </div>

      <aside
        className={`hidden lg:block flex-shrink-0 border-r bg-background guide-sidebar transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "w-64" : "w-0 border-r-0"
        }`}
      >
        <div className="sticky top-0 h-screen overflow-y-auto py-6 px-4 scrollbar-hide">
          <TableOfContentsPanelHeader
            className="flex items-center justify-between mb-4"
            onClose={onClose}
            title={t("accessibility.closeSidebar")}
          />
          {tocContent}
        </div>
      </aside>
    </>
  );
}
