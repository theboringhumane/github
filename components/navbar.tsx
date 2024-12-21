import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { PR } from "../types/objects";

export function Navbar({
  prs,
  repo,
  setFilter,
}: {
  prs: PR[];
  repo: string;
  setFilter: (filter: string) => void;
}) {
  const labels = [...new Set(prs.flatMap((pr) => pr.labels))];
  const states = [...new Set(prs.map((pr) => pr.state))];

  return (
    <div className="border-b border-muted">
      <div className="w-full flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {["State", "Label"].map((filter) => (
            <Select
              key={filter}
              onValueChange={(value) => {
                setFilter(`${filter.toLowerCase()}:${value}`);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={filter} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter}s</SelectItem>
                {filter === "State"
                  ? states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))
                  : labels.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          ))}
          <Select>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="recently-updated">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
