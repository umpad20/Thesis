"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Edit,
  Plus,
  Sparkles,
  Award,
  Star,
  Ribbon,
  Medal,
  CheckCircle2,
  Trash2,
  X,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BadgeGraphic, getBadgeCategoryLabel } from "@/components/badge-graphic";
import { fetchBadgesFromSupabase, fetchBadgeLessonCounts } from "@/utils/supabase-queries";
import { fetchTeacherSectionsFromSupabase, getCurrentUser } from "@/utils/auth-helpers";
import { createClient } from "@/utils/supabase/client";
import type { Badge, BadgeType, MedalType } from "@/lib/types";

export default function TeacherBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<number, number>>({});
  const [teacherSections, setTeacherSections] = useState<string[]>(["Grade 3-A"]);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "star" | "ribbon" | "medal">("all");
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [xpReward, setXpReward] = useState<number>(100);
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createType, setCreateType] = useState<BadgeType>("star");
  const [createMedalType, setCreateMedalType] = useState<MedalType>("bronze");
  const [createSection, setCreateSection] = useState("all");
  const [createPassingScore, setCreatePassingScore] = useState(75);
  const [createXpReward, setCreateXpReward] = useState(250);
  const [createDescription, setCreateDescription] = useState("");

  useEffect(() => {
    async function fetchData() {
      const [badgeList, counts, sections] = await Promise.all([
        fetchBadgesFromSupabase(),
        fetchBadgeLessonCounts(),
        fetchTeacherSectionsFromSupabase(),
      ]);
      setBadges(badgeList);
      setLessonCounts(counts);
      if (sections.length > 0) {
        setTeacherSections(sections);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const starBadges = badges.filter((b) => b.badge_type === "star");
  const ribbonBadges = badges.filter((b) => b.badge_type === "ribbon");
  const medalBadges = badges.filter((b) => b.badge_type === "medal");

  const filteredBadges = badges.filter((b) => {
    // Section filter
    const matchesSection =
      selectedSectionFilter === "all" ||
      b.target_section === "all" ||
      b.target_section === selectedSectionFilter;

    // Type filter
    const matchesType = activeTab === "all" || b.badge_type === activeTab;

    return matchesSection && matchesType;
  });

  const openEditModal = (badge: Badge) => {
    setEditingBadge(badge);
    setPassingScore(badge.required_passing_score);
    setXpReward(badge.xp_reward);
    setDescription(badge.description);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBadge) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("badges")
        .update({
          required_passing_score: Number(passingScore),
          xp_reward: Number(xpReward),
          description: description,
          updated_at: new Date().toISOString(),
        })
        .eq("badge_id", editingBadge.badge_id);

      if (!error) {
        setBadges((prev) =>
          prev.map((b) =>
            b.badge_id === editingBadge.badge_id
              ? {
                  ...b,
                  required_passing_score: Number(passingScore),
                  xp_reward: Number(xpReward),
                  description: description,
                  updated_at: new Date().toISOString(),
                }
              : b
          )
        );
      }
    } catch (err) {
      console.error("Error saving badge:", err);
    }
    setSaving(false);
    setEditingBadge(null);
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const user = getCurrentUser();
      const maxOrder = Math.max(...badges.map((b) => b.badge_order || 0), 0);

      const newBadge = {
        badge_name: createName.trim(),
        badge_type: createType,
        medal_type: createType === "medal" ? createMedalType : null,
        description: createDescription.trim() || `Mastery badge for ${createName}`,
        badge_order: maxOrder + 1,
        required_passing_score: Number(createPassingScore),
        xp_reward: Number(createXpReward),
        target_section: createSection,
        teacher_id: user?.id || null,
      };

      const { data, error } = await supabase.from("badges").insert(newBadge).select().single();

      if (!error && data) {
        setBadges((prev) => [...prev, data as Badge]);
        setIsCreateOpen(false);
        setCreateName("");
        setCreateDescription("");
      }
    } catch (err) {
      console.error("Error creating badge:", err);
    }
    setSaving(false);
  };

  const handleDeleteBadge = async (badgeId: number) => {
    if (confirm("Are you sure you want to delete this custom badge?")) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from("badges").delete().eq("badge_id", badgeId);
        if (!error) {
          setBadges((prev) => prev.filter((b) => b.badge_id !== badgeId));
        }
      } catch (err) {
        console.error("Error deleting badge:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/teacher" className="hover:text-slate-600">
              Teacher Hub
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Badge Mastery Rules</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Mastery Badge Thresholds &amp; Hierarchy
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            5 Default Mastery Accolades · Max 3 lessons per badge · Section-scoped custom badges
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          size="sm"
          className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm shadow-blue-200 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Badge Accolade</span>
        </Button>
      </div>

      {/* 2. Educational Rule Banner & Category Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-bold w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All Badges ({badges.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("star")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "star" ? "bg-amber-500 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Stars ({starBadges.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ribbon")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "ribbon" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Ribbon className="w-3.5 h-3.5" />
            <span>Ribbons ({ribbonBadges.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("medal")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "medal" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Medal className="w-3.5 h-3.5" />
            <span>Medals ({medalBadges.length})</span>
          </button>
        </div>

        {/* Section Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
          <span className="font-bold text-slate-500">Section Scope:</span>
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Enrolled Badges</option>
            {teacherSections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. 5 Default Mastery Stages Banner */}
      <div className="dashboard-card p-4 bg-gradient-to-r from-blue-50/50 via-slate-50 to-amber-50/40 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-slate-800">
              5 Default Mastery Progression: 1st Star → 2nd Ribbon → 3rd Bronze → 4th Silver → 5th Gold
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200/80">
            Rule: Maximum 3 Lessons per Badge
          </span>
        </div>
      </div>

      {/* 4. Badge Configuration List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading badges from Supabase...</div>
      ) : (
        <div className="space-y-3.5">
          {filteredBadges.map((badge) => {
            const categoryLabel = getBadgeCategoryLabel(badge.badge_type, badge.medal_type);
            const currentLessons = lessonCounts[badge.badge_id] || 0;
            const isFull = currentLessons >= 3;

            const badgeBorderColor =
              badge.badge_type === "star"
                ? "border-l-amber-400"
                : badge.badge_type === "ribbon"
                ? "border-l-blue-500"
                : badge.medal_type === "bronze"
                ? "border-l-amber-600"
                : badge.medal_type === "silver"
                ? "border-l-slate-400"
                : "border-l-yellow-400";

            return (
              <div
                key={badge.badge_id}
                className={`dashboard-card p-5 border-l-4 ${badgeBorderColor} transition-all hover:shadow-xs`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Graphic & Info */}
                  <div className="flex items-center gap-4">
                    <BadgeGraphic
                      type={badge.badge_type}
                      medalType={badge.medal_type}
                      size="sm"
                      status="completed"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {badge.badge_order}. {badge.badge_name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            badge.badge_type === "star"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : badge.badge_type === "ribbon"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : badge.medal_type === "bronze"
                              ? "bg-orange-100 text-orange-900 border border-orange-200"
                              : badge.medal_type === "silver"
                              ? "bg-slate-100 text-slate-800 border border-slate-300"
                              : "bg-yellow-100 text-yellow-900 border border-yellow-300"
                          }`}
                        >
                          {categoryLabel}
                        </span>

                        {badge.target_section && badge.target_section !== "all" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            Section: {badge.target_section}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{badge.description}</p>
                    </div>
                  </div>

                  {/* Right: Capacity & Parameters */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {/* Lesson Capacity Indicator */}
                    <div
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                        isFull
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">
                        {currentLessons} / 3 Lessons {isFull && "(Full)"}
                      </span>
                    </div>

                    <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-400 block font-semibold text-[9px] uppercase tracking-wider mb-0.5">
                        Passing Score
                      </span>
                      <span className="text-slate-900 font-bold text-xs">
                        ≥{badge.required_passing_score}%
                      </span>
                    </div>

                    <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-amber-600 block font-semibold text-[9px] uppercase tracking-wider mb-0.5">
                        XP Reward
                      </span>
                      <span className="text-amber-800 font-bold text-xs">
                        +{badge.xp_reward} XP
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(badge)}
                      className="h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </Button>

                    {badge.badge_id > 5 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBadge(badge.badge_id)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Note */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Scope: <code className="text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{badge.target_section || "all"}</code>
                      {" · "}Type: <code className="text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{badge.badge_type}</code>
                      {badge.medal_type && (
                        <> · Tier: <code className="text-[10px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{badge.medal_type}</code></>
                      )}
                    </span>
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active in Progression
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create New Badge Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create New Badge Accolade
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBadge} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Badge Name *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Fluency Champion Ribbon"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Badge Category *
                  </label>
                  <select
                    value={createType}
                    onChange={(e) => setCreateType(e.target.value as BadgeType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="star">Star Badge</option>
                    <option value="ribbon">Ribbon Badge</option>
                    <option value="medal">Medal Badge</option>
                  </select>
                </div>

                {createType === "medal" ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Medal Tier *
                    </label>
                    <select
                      value={createMedalType || "bronze"}
                      onChange={(e) => setCreateMedalType(e.target.value as MedalType)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="bronze">Bronze Medal</option>
                      <option value="silver">Silver Medal</option>
                      <option value="gold">Gold Medal</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Target Section Scope *
                    </label>
                    <select
                      value={createSection}
                      onChange={(e) => setCreateSection(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="all">Universal (All Students)</option>
                      {teacherSections.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec} (Only Enrolled Pupils)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {createType === "medal" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Target Section Scope *
                  </label>
                  <select
                    value={createSection}
                    onChange={(e) => setCreateSection(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="all">Universal (All Students)</option>
                    {teacherSections.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} (Only Enrolled Pupils)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Required Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={createPassingScore}
                    onChange={(e) => setCreatePassingScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    XP Reward Points
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={2000}
                    step={25}
                    required
                    value={createXpReward}
                    onChange={(e) => setCreateXpReward(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Badge Description &amp; Criteria
                </label>
                <textarea
                  rows={2}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Describe how students earn this badge..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {saving ? "Creating Badge..." : "Save New Badge"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Badge Rules Modal */}
      {editingBadge && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <BadgeGraphic
                type={editingBadge.badge_type}
                medalType={editingBadge.medal_type}
                size="sm"
                status="completed"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Rules: {editingBadge.badge_name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">
                  {getBadgeCategoryLabel(editingBadge.badge_type, editingBadge.medal_type)} (Stage {editingBadge.badge_order})
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Required Passing Score (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={50}
                    max={100}
                    required
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  XP Reward Points
                </label>
                <input
                  type="number"
                  min={10}
                  max={2000}
                  step={25}
                  required
                  value={xpReward}
                  onChange={(e) => setXpReward(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Badge Description &amp; Criteria
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBadge(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {saving ? "Saving to Supabase..." : "Save Mastery Rule"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
