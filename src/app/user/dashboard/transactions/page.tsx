"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, ReceiptText } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";

type Transaction = {
  _id: string;
  amount: number;
  type: "purchase" | "usage" | "refund";
  description: string;
  createdAt: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const PAGE_SIZE = 10;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/users/credits/transactions?page=${currentPage}&limit=${PAGE_SIZE}`,
          {
          cache: "no-store",
          }
        );
        const payload = await response.json();

        if (response.ok && Array.isArray(payload?.transactions)) {
          setTransactions(payload.transactions);
          setPagination(payload?.pagination || null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.type === "purchase" || item.type === "refund") {
          acc.in += item.amount;
        }
        if (item.type === "usage") {
          acc.out += item.amount;
        }
        return acc;
      },
      { in: 0, out: 0 }
    );
  }, [transactions]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Credit Transactions</h1>
            <p className="text-sm text-foreground/65">
              Full credit ledger for purchases and spending.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-5">
            <p className="text-sm text-emerald-100/80">Credits Added</p>
            <p className="mt-1 text-3xl font-bold text-emerald-100">+{summary.in}</p>
          </article>
          <article className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-5">
            <p className="text-sm text-amber-100/80">Credits Spent</p>
            <p className="mt-1 text-3xl font-bold text-amber-100">-{summary.out}</p>
          </article>
        </section>

        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <span className="text-xs text-foreground/60">
              Page {pagination?.page || currentPage} of {pagination?.totalPages || 1}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-foreground/70">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <div className="rounded-lg border border-rose-500/20 bg-black/20 p-6 text-center text-sm text-foreground/70">
              No transactions yet. Buy credits or run analysis tasks to generate history.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-foreground/65">Type</th>
                    <th className="px-3 py-2 text-foreground/65">Amount</th>
                    <th className="px-3 py-2 text-foreground/65">Description</th>
                    <th className="px-3 py-2 text-foreground/65">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((item) => {
                    const isIn = item.type === "purchase" || item.type === "refund";
                    return (
                      <tr key={item._id} className="rounded-lg bg-black/20">
                        <td className="rounded-l-lg border-y border-l border-rose-500/15 px-3 py-3 text-foreground">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs">
                            {isIn ? (
                              <ArrowDownCircle className="h-3.5 w-3.5 text-emerald-300" />
                            ) : (
                              <ArrowUpCircle className="h-3.5 w-3.5 text-amber-300" />
                            )}
                            {item.type}
                          </span>
                        </td>
                        <td
                          className={[
                            "border-y border-rose-500/15 px-3 py-3 font-semibold",
                            isIn ? "text-emerald-200" : "text-amber-200",
                          ].join(" ")}
                        >
                          {isIn ? "+" : "-"}
                          {item.amount}
                        </td>
                        <td className="border-y border-rose-500/15 px-3 py-3 text-foreground/80">
                          <div className="inline-flex items-start gap-2">
                            <ReceiptText className="mt-0.5 h-4 w-4 text-rose-200" />
                            <span>{item.description || "No description"}</span>
                          </div>
                        </td>
                        <td className="rounded-r-lg border-y border-r border-rose-500/15 px-3 py-3 text-foreground/70">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && transactions.length > 0 ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-foreground/60">
                Showing {transactions.length} of {pagination?.totalItems || transactions.length} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                  disabled={!pagination?.hasPreviousPage}
                  className="rounded-md border border-rose-500/25 bg-white/5 px-3 py-1.5 text-xs text-foreground hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((value) =>
                      pagination?.hasNextPage ? value + 1 : value
                    )
                  }
                  disabled={!pagination?.hasNextPage}
                  className="rounded-md border border-rose-500/25 bg-white/5 px-3 py-1.5 text-xs text-foreground hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
};

export default TransactionsPage;
