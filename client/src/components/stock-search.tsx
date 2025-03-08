import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { searchStocks } from "@/lib/yahoo-finance";

interface StockSearchProps {
  onSelect: (symbol: string) => void;
}

export function StockSearch({ onSelect }: StockSearchProps) {
  const [search, setSearch] = useState("");

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", search],
    queryFn: () => searchStocks(search),
    enabled: search.length > 1,
  });

  return (
    <div className="w-full max-w-sm">
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isLoading && (
          <div className="p-4 text-sm text-muted-foreground">
            Searching...
          </div>
        )}
        {results && results.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto">
            {results.map((stock) => (
              <button
                key={stock.symbol}
                className="w-full px-4 py-2 text-left hover:bg-accent"
                onClick={() => {
                  onSelect(stock.symbol);
                  setSearch("");
                }}
              >
                <div className="text-sm font-medium">{stock.symbol}</div>
                <div className="text-xs text-muted-foreground">
                  {stock.name}
                </div>
              </button>
            ))}
          </div>
        )}
      </Command>
    </div>
  );
}
