"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Volume2,
  ChevronRight,
} from "lucide-react";
import { mockVocabularyWords } from "@/lib/mock-data";

export default function VocabularyPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWords = mockVocabularyWords.filter(
    (w) =>
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Navigation Trail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/dashboard" className="hover:text-slate-600">
              Dashboard
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 font-bold">Vocabulary Vault</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Grade 3 Vocabulary Glossary
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Master reading comprehension through contextual vocabulary terms and definitions.
          </p>
        </div>

        {/* Total words counter */}
        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs font-semibold">
          <span className="text-slate-400">Total Unlocked: </span>
          <span className="text-blue-600 font-bold">12 Words</span>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="dashboard-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search word or meaning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Category:
          </span>
          <select className="bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none">
            <option>All Modules</option>
            <option>Fire Badge (Lesson 3)</option>
            <option>Cold Badge (Lesson 1-2)</option>
          </select>
        </div>
      </div>

      {/* 3. Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((item) => (
          <div
            key={item.word_id}
            className="dashboard-card p-5 dashboard-card-hover flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900">
                  {item.word}
                </span>
                <button
                  type="button"
                  aria-label="Listen to word pronunciation"
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.definition}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-3.5 rounded-b-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Contextual Example
              </span>
              <p className="text-xs text-slate-700 italic">
                &quot;{item.example_sentence}&quot;
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
