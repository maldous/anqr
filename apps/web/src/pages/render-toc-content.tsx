import { ChevronDown, ChevronUp } from "lucide-react";
import type { TocGroup } from "./static-page-types";

export function renderTocContent(
  groups: TocGroup[],
  activeSlug: string,
  expandedGroups: Set<string>,
  handleGroupClick: (group: TocGroup) => void,
  toggleGroup: (key: string) => void,
  handleItemClick: (slug: string) => void,
) {
  return (
    <nav className="text-sm">
      {groups.map((group) => (
        <div key={group.key} className="mb-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleGroupClick(group)}
              className="flex-1 text-left text-base font-bold text-foreground hover:text-primary py-2 px-2 rounded-l transition-colors cursor-pointer"
              title={`Go to ${group.title}`}
            >
              {group.title}
            </button>
            <button
              type="button"
              onClick={() => toggleGroup(group.key)}
              className="p-2 rounded-r hover:bg-muted transition-colors"
              title={expandedGroups.has(group.key) ? "Collapse" : "Expand"}
            >
              {expandedGroups.has(group.key) ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          {expandedGroups.has(group.key) && (
            <ul className="mt-1 space-y-0.5 border-l-2 border-muted ml-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`block w-full text-left py-1 pl-3 pr-2 text-xs leading-snug transition-colors rounded-r ${
                      activeSlug === item.id
                        ? "text-primary font-medium bg-primary/10 border-l-2 border-primary -ml-[2px]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
