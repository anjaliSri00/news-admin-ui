"use client";

import React, { useState, useEffect } from "react";
import {
  NavTab,
  Monograph,
  Contributor,
  CuratedCategory,
  MediaAsset,
  BackendEventPayload,
  UpdateEventPayload,
} from "./types/editorial";
import {
  INITIAL_MONOGRAPHS,
  CURATED_CATEGORIES,
  DESK_DEADLINES,
  CONTRIBUTORS,
  MEDIA_ASSETS,
} from "./data/mockData";

import { Footer } from "./components/Footer";
import { OverviewScreen } from "./components/screens/OverviewScreen";
import { PipelineScreen } from "./components/screens/PipelineScreen";
import { TrendsManager } from "./components/screens/TrendsManager";
import { FurnitureManager } from "./components/screens/FurnitureManager";
import { MediaScreen } from "./components/screens/MediaScreen";
import { ContributorsScreen } from "./components/screens/ContributorsScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";

// Modals
import { NewMonographModal } from "./components/modals/NewMonographModal";
import { EditMonographModal } from "./components/modals/EditMonographModal";
import { DeleteConfirmModal } from "./components/modals/DeleteConfirmModal";
import { CategoryModal } from "./components/modals/CategoryModal";
import { EditContributorModal } from "./components/modals/EditContributorModal";
import { MonographReaderModal } from "./components/modals/MonographReaderModal";
import { CompilePdfModal } from "./components/modals/CompilePdfModal";
import { BatchUploadModal } from "./components/modals/BatchUploadModal";
import { InviteContributorModal } from "./components/modals/InviteContributorModal";
import { BreakingTickerModal } from "./components/modals/BreakingTickerModal";
import { ExportDispatchModal } from "./components/modals/ExportDispatchModal";
import { TrendingStory } from "./types/editorial";
import { EventsManager } from "./components/screens/EventsManager";
import fetchApiResponse from "./helper/api_data_store";
import { useSession } from "next-auth/react";
import { HomeDecorManager } from "./components/screens/HomeDecorManager";
import { toast } from "react-toastify";
import { Sidebar } from "./components/Sidebar";
import { Subheader } from "./components/Subheader";
import { NewsManager } from "./components/screens/NewsManager";
import {
  createDesigner,
  deleteDesigner,
  Designer,
  DesignerPayload,
  getDesigners,
  updateDesigner,
} from "./helper/designers";
import { DesignTechManager } from "./components/screens/DesignTechManager";
import { ProductsManager } from "./components/screens/ProductsManager";

interface DeletingItem {
  type: "monograph" | "category" | "contributor" | "media";
  id: string;
  title: string;
  description?: string;
}

export default function App() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const EVENTS_API = `${API_BASE_URL}/api/v1/internal-dashboard/events`;
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDecorModalOpen, setIsDecorModalOpen] = useState(false);
  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [isLatestNewsModalOpen, setIsLatestNewsModalOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [isDesignTechModalOpen, setIsDesignTechModalOpen] = useState(false);
const [isFurnitureModalOpen, setIsFurnitureModalOpen] = useState(false);
const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [monographs, setMonographs] = useState<Monograph[]>(INITIAL_MONOGRAPHS);
  const [categories, setCategories] =
    useState<CuratedCategory[]>(CURATED_CATEGORIES);
  const [deadlines] = useState(DESK_DEADLINES);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(MEDIA_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilterForMonographs, setCategoryFilterForMonographs] =
    useState<string | undefined>(undefined);
  const [contributors, setContributors] = useState<Designer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [selectedMonograph, setSelectedMonograph] = useState<Monograph | null>(
    null,
  );
  const [editingMonograph, setEditingMonograph] = useState<Monograph | null>(
    null,
  );
  const [isNewMonographOpen, setIsNewMonographOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CuratedCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Designer | null>(
    null,
  );
  const [isEditContributorOpen, setIsEditContributorOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<DeletingItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // General action modals
  const [isCompilePdfOpen, setIsCompilePdfOpen] = useState(false);
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);
  const [isInviteContributorOpen, setIsInviteContributorOpen] = useState(false);
  const [isScheduleTickerOpen, setIsScheduleTickerOpen] = useState(false);
  const [isExportDispatchOpen, setIsExportDispatchOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  //trending stories
  const [trendingStories, setTrendingStories] = useState<TrendingStory[]>([]);
  const [events, setEvents] = useState<BackendEventPayload[]>([]);

  const getAuthHeaders = () => {
    const accessToken = session?.accessToken;
    const refreshToken = session?.refreshToken;
    return {
      "Access-Token": accessToken,
      ...(refreshToken && { "Refresh-Token": refreshToken }),
    };
  };

  const loadDesigners = async () => {
    try {
      setIsLoading(true);

      const response = await fetchApiResponse<Designer[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/internal-dashboard/designers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Token": session.accessToken,
            ...(session.refreshToken && {
              "Refresh-Token": session.refreshToken,
            }),
          },
        },
      );

      const data = response.data;

      setContributors(
        Array.isArray(data) ? data : ((data as any)?.designers ?? []),
      );
    } catch (error) {
      console.error("Failed to load designers:", error);
      setContributors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "designers" || !session?.accessToken) return;
    loadDesigners();
  }, [activeTab, session?.accessToken, session?.refreshToken]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [tickerMessage, setTickerMessage] = useState(
    "Main Engine: Active (Zurich Node) · Global Content Ingestion: 99.98% · Curatorial Review: 3 Pending Final Sign-off · Scheduled Print Run: Nov 04, 2024",
  );

  // 1. READ / LIST (Initial sync from API routes)
  useEffect(() => {
    async function fetchAllData() {
      try {
        const [monoRes, catRes, contRes, mediaRes] = await Promise.all([
          fetch("/api/monographs"),
          fetch("/api/categories"),
          fetch("/api/contributors"),
          fetch("/api/media"),
          // fetch('/api/trending'),
        ]);

        if (monoRes.ok) {
          const data = await monoRes.json();
          if (data.monographs?.length > 0) setMonographs(data.monographs);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          if (data.categories?.length > 0) setCategories(data.categories);
        }
        if (contRes.ok) {
          const data = await contRes.json();
          if (data.contributors?.length > 0) setContributors(data.contributors);
        }
        if (mediaRes.ok) {
          const data = await mediaRes.json();
          if (data.media?.length > 0) setMediaAssets(data.media);
        }
      } catch (err) {
        console.warn("Initial API sync notice (using local baseline):", err);
      }
    }
    fetchAllData();
  }, []);

  // ----------------------------------------------------
  // MONOGRAPHS CRUD HANDLERS
  // ----------------------------------------------------
  // CREATE
  const handleSaveMonograph = async (newMono: Monograph) => {
    setMonographs((prev) => [newMono, ...prev]);
    setSelectedMonograph(newMono);
    showToast(`✓ Manuscript "${newMono.title}" commissioned (API POST)`);

    try {
      const res = await fetch("/api/monographs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMono),
      });
      const data = await res.json();
      if (data.monograph) {
        setMonographs((prev) => [
          data.monograph,
          ...prev.filter((m) => m.id !== newMono.id),
        ]);
      }
    } catch (err) {
      console.error("API create monograph failed:", err);
    }
  };

  // UPDATE
  const handleUpdateMonograph = async (updated: Monograph) => {
    setMonographs((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
    if (selectedMonograph && selectedMonograph.id === updated.id) {
      setSelectedMonograph(updated);
    }
    showToast(`✓ Monograph "${updated.title}" updated (API PUT)`);

    try {
      await fetch("/api/monographs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error("API update monograph failed:", err);
    }
  };

  // PATCH STATUS / PUBLISH
  const handlePublishToggle = async (id: string) => {
    const target = monographs.find((m) => m.id === id);
    const newStatus =
      target?.status === "published" ? "scheduled" : "published";
    const newStatusLabel =
      newStatus === "published" ? "Published" : "Scheduled";

    setMonographs((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: newStatus, statusLabel: newStatusLabel }
          : m,
      ),
    );

    if (selectedMonograph && selectedMonograph.id === id) {
      setSelectedMonograph((prev) =>
        prev
          ? { ...prev, status: newStatus, statusLabel: newStatusLabel }
          : null,
      );
    }
    showToast(
      `✓ Folio status patched to ${newStatusLabel.toUpperCase()} (API PATCH)`,
    );

    try {
      await fetch("/api/monographs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          statusLabel: newStatusLabel,
        }),
      });
    } catch (err) {
      console.error("API patch status failed:", err);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Monograph["status"],
  ) => {
    const labels: Record<Monograph["status"], string> = {
      draft: "Drafting Ingest",
      review: "Peer Review (Zurich)",
      scheduled: "Ready to Publish",
      published: "Published",
    };
    const newStatusLabel = labels[newStatus];

    setMonographs((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: newStatus, statusLabel: newStatusLabel }
          : m,
      ),
    );
    showToast(`✓ Stage updated to "${newStatusLabel}" (API PATCH)`);

    try {
      await fetch("/api/monographs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          statusLabel: newStatusLabel,
        }),
      });
    } catch (err) {
      console.error("API update status failed:", err);
    }
  };

  // DELETE
  const handleDeleteMonographConfirm = async () => {
    if (!deletingItem || deletingItem.type !== "monograph") return;
    setIsDeleting(true);
    const id = deletingItem.id;
    const title = deletingItem.title;

    try {
      await fetch(`/api/monographs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setMonographs((prev) => prev.filter((m) => m.id !== id));
      if (selectedMonograph?.id === id) setSelectedMonograph(null);
      showToast(`✓ Monograph "${title}" deleted from syndicate (API DELETE)`);
    } catch (err) {
      console.error("API delete monograph failed:", err);
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  // ----------------------------------------------------
  // CATEGORIES / SECTIONS CRUD HANDLERS
  // ----------------------------------------------------
  const handleSaveCategory = async (cat: CuratedCategory) => {
    const exists = categories.some((c) => c.id === cat.id);
    if (exists) {
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
      showToast(`✓ Section "${cat.title}" updated (API PUT)`);
    } else {
      setCategories((prev) => [...prev, cat]);
      showToast(`✓ Section "${cat.title}" created (API POST)`);
    }

    try {
      await fetch("/api/categories", {
        method: exists ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cat),
      });
    } catch (err) {
      console.error("API save category failed:", err);
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deletingItem || deletingItem.type !== "category") return;
    setIsDeleting(true);
    const id = deletingItem.id;
    const title = deletingItem.title;

    try {
      await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`✓ Section "${title}" removed (API DELETE)`);
    } catch (err) {
      console.error("API delete category failed:", err);
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  // ----------------------------------------------------
  // CONTRIBUTORS CRUD HANDLERS
  // ----------------------------------------------------
  const handleInviteContributor = async (payload: DesignerPayload) => {
    const response = await createDesigner(
      payload,
      session!.accessToken!,
      session?.refreshToken ?? undefined,
    );
    // console.log("---------------", response );
    if (
      response.body?.meta?.status === 200 ||
      response.body?.meta?.status === 201
    ) {
      setIsInviteContributorOpen(false);

      // Refresh the list using your existing designers-loading function.
      await loadDesigners();
    }
  };

  const handleUpdateContributor = async (
    updated: Designer,
    payload: DesignerPayload,
  ): Promise<void> => {
    if (!session?.accessToken) {
      throw new Error("Authentication required");
    }

    const response = await updateDesigner(
      updated.id,
      payload,
      session.accessToken,
      session.refreshToken ?? undefined,
    );

    const status = response.body?.meta?.status;

    if (status !== 200 && status !== 201) {
      throw new Error("Failed to update designer");
    }

    await loadDesigners();
    showToast(`Designer "${updated.name}" updated successfully`);
  };

  const handleDeleteContributorConfirm = async () => {
    if (!deletingItem || deletingItem.type !== "contributor") return;

    if (!session?.accessToken) {
      showToast("Authentication required");
      return;
    }

    setIsDeleting(true);

    const id = deletingItem.id;
    const name = deletingItem.title;

    try {
      const response = await deleteDesigner(
        id,
        session.accessToken,
        session.refreshToken ?? undefined,
      );

      if (response.body?.meta?.status === 200) {
        await loadDesigners();
        showToast(`Designer "${name}" deleted successfully`);
      } else {
        showToast("Failed to delete designer");
      }
    } catch (error) {
      console.error("API delete designer failed:", error);
      showToast("Failed to delete designer");
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  // ----------------------------------------------------
  // MEDIA ASSETS CRUD HANDLERS
  // ----------------------------------------------------
  const handleBatchUploadSuccess = async () => {
    const newAsset: MediaAsset = {
      id: `media-${Date.now()}`,
      title: "New High-Resolution Architectural Plate Ingest",
      photographer: "Rasmus Hjortshøj",
      monographTitle: "Curatorial Ingest Queue",
      resolution: "7200 x 4800 px (300 DPI)",
      aspectRatio: "3:2 Landscape",
      fileSize: "45.2 MB (TIFF / CMYK)",
      imageUrl:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      status: "300 DPI Verified",
      tags: ["New Ingest", "300 DPI", "Nordic Light"],
    };

    setMediaAssets((prev) => [newAsset, ...prev]);
    showToast("✓ 300 DPI Photographic Plate ingested (API POST)");

    try {
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsset),
      });
    } catch (err) {
      console.error("API media upload failed:", err);
    }
  };

  const handleDeleteMediaConfirm = async () => {
    if (!deletingItem || deletingItem.type !== "media") return;
    setIsDeleting(true);
    const id = deletingItem.id;
    const title = deletingItem.title;

    try {
      await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setMediaAssets((prev) => prev.filter((m) => m.id !== id));
      showToast(`✓ Photographic Plate "${title}" deleted (API DELETE)`);
    } catch (err) {
      console.error("API delete media failed:", err);
    } finally {
      setIsDeleting(false);
      setDeletingItem(null);
    }
  };

  // General confirm router
  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (deletingItem.type === "monograph") handleDeleteMonographConfirm();
    else if (deletingItem.type === "category") handleDeleteCategoryConfirm();
    else if (deletingItem.type === "contributor")
      handleDeleteContributorConfirm();
    else if (deletingItem.type === "media") handleDeleteMediaConfirm();
  };

  const handleGlobalAdd = () => {
    switch (activeTab) {
      case "events-industry":
        setIsEventModalOpen(true);
        break;
      case "home-decor":
        setIsDecorModalOpen(true);
        break;
      case "trending-stories":
        setIsTrendModalOpen(true);
        break;
      case "latest-news":
        setIsLatestNewsModalOpen(true);
        break;
      case "special-reports":
        setIsReportsModalOpen(true);
        break;
      case "designers":
        setIsInviteContributorOpen(true);
        // alert("Designers create modal will open");
        break;
      case "design-tech":
        setIsDesignTechModalOpen(true);
        break;

      case "furniture":
        setIsFurnitureModalOpen(true);
        break;
      case 'products':
  setIsProductModalOpen(true);
  break;  
      case "overview":
      case "editorial-desk":
        setIsNewMonographOpen(true); // Fallback to Monograph
        break;
      default:
        alert("Please select a content section first");
    }
  };

  //Event section

  // ----------------------------------------------------
  // EVENTS CRUD HANDLERS
  // ----------------------------------------------------

  // CREATE (Using your specific /add route)
  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetchApiResponse<{
          events: BackendEventPayload[];
        }>(EVENTS_API, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        // Helper returns { meta: {...}, data: {...} }
        if (response.data?.events) {
          setEvents(response.data.events);
        } else if (Array.isArray(response.data)) {
          // Fallback in case backend returns just the array inside data
          setEvents(response.data);
        }
      } catch (err) {
        console.error("Fetch events failed:", err);
      }
    }
    fetchEvents();
  }, []);

  // 2. CREATE EVENT
  // const handleCreateEvent = async (draft: Omit<BackendEventPayload, 'id'>) => {
  const handleCreateEvent = async (
    draft: Omit<BackendEventPayload, "id">,
  ): Promise<boolean> => {
    const tempId = `temp-${Date.now()}`;
    const tempEvent = { ...draft, id: tempId };
    setEvents((prev) => [tempEvent, ...prev]);

    try {
      const response = await fetchApiResponse<{ event: BackendEventPayload }>(
        `${EVENTS_API}/add`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify(draft),
        },
      );

      if (response.meta.status === 201 || response.meta.status === 200) {
        if (response.data?.event) {
          const savedEvent = response.data.event;
          setEvents((prev) =>
            prev.map((e) => (e.id === tempId ? savedEvent : e)),
          );

          // Show success toast
          toast.success(`Event created (${savedEvent.code || "Success"})`);
          return true; // Success flag
        }
      } else {
        // API returned an error status
        throw new Error(response.meta.message || "Failed to create event");
      }
    } catch (err: any) {
      // Remove fake event from list
      setEvents((prev) => prev.filter((e) => e.id !== tempId));

      // Show error toast (No throw, prevent crash)
      console.log(err.message || "Failed to create event");

      return false; // Failure flag
    }
  };

  const handleUpdateEvent = async (
    id: string,
    updatedData: Partial<BackendEventPayload>,
  ): Promise<boolean> => {
    // 🔥 SAFETY CHECK: Dono taraf se temp ID block kar do
    if (id.startsWith("temp-")) {
      toast.error("Cannot update an event that is not fully created yet.");
      return false;
    }

    const previousEvents = [...events];
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedData } : e)),
    );

    try {
      const response = await fetchApiResponse<{ event: BackendEventPayload }>(
        `${EVENTS_API}/${id}`, // 👈 Yahan original UUID jayega (e.g. 813eaff8-640d...)
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify(updatedData),
        },
      );

      if (response.meta.status === 200) {
        if (response.data?.event) {
          const savedEvent = response.data.event;
          setEvents((prev) => prev.map((e) => (e.id === id ? savedEvent : e)));
          toast.success("Event updated successfully");
          return true; // ✅ Success
        }
      } else {
        throw new Error(response.meta.message || "Update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update event");
      setEvents(previousEvents); // Rollback
      return false;
    }
  };

  // GET SINGLE EVENT (router.get("/:id"))
  // for getting latest data on the form
  const fetchSingleEvent = async (id: string) => {
    try {
      const response = await fetchApiResponse<{ event: BackendEventPayload }>(
        `${EVENTS_API}/${id}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      return response.data?.event;
    } catch (err) {
      console.error("Failed to fetch event details:", err);
      return null;
    }
  };

  // PATCH STATUS UPDATE (router.patch("/:id/status"))
  const handleUpdateEventStatus = async (
    id: string,
    newStatus: "draft" | "published" | "archived",
  ) => {
    const previousEvents = [...events];

    // 1. Optimistic UI Update (shown immediate changes on the list)
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );
    showToast(`⏳ Updating status to ${newStatus}...`);

    try {
      const response = await fetchApiResponse<any>(
        `${EVENTS_API}/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.data?.event) {
        const savedEvent = response.data.event;
        setEvents((prev) => prev.map((e) => (e.id === id ? savedEvent : e)));

        showToast(`✓ Status updated to ${newStatus.toUpperCase()}`);
        return savedEvent;
      }
    } catch (err) {
      console.error("Update status failed:", err);
      showToast(`❌ Failed to update status`);
      setEvents(previousEvents);
    }
  };

  // 3. DELETE EVENT
  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const previousEvents = [...events];
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast(`⏳ Deleting event...`);

    try {
      await fetchApiResponse(`${EVENTS_API}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      showToast("✓ Event deleted successfully");
    } catch (err) {
      console.error("API delete event failed:", err);
      showToast(`❌ Failed to delete event`);
      setEvents(previousEvents);
    }
  };

  const handleOpenInvite = () => {
    setIsInviteContributorOpen(true);
  };

  const handleEditContributor = (designer: Designer) => {
    setEditingContributor(designer);
    setIsEditContributorOpen(true);
  };

  const handleDeleteContributor = (designer: Designer) => {
    setDeletingItem({
      type: "contributor",
      id: designer.id,
      title: designer.name,
      description: "This designer will be removed.",
    });
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-on-surface flex font-sans">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] bg-primary-container text-white px-5 py-3 shadow-2xl font-sans text-[13px] flex items-center gap-3 animate-fade-in rounded-md">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "showrooms-projects") {
            setCategoryFilterForMonographs(undefined);
          }
        }}
        onGlobalAdd={handleGlobalAdd} // Jo naya function banaya tha
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        monographs={monographs}
        onSelectMonograph={setSelectedMonograph}
      />

      {/* Main Content Area */}
      {/* <main className="w-full pt-32 flex-1"> */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Subheader
          activeTab={activeTab}
          onGlobalAdd={handleGlobalAdd}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <main className="flex-1 pt-4">
          {activeTab === "overview" && (
            <OverviewScreen
              monographs={monographs}
              categories={categories}
              deadlines={deadlines}
              onSelectMonograph={setSelectedMonograph}
              onOpenNewMonograph={() => setIsNewMonographOpen(true)}
              onOpenCompilePdf={() => setIsCompilePdfOpen(true)}
              onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
              onOpenInviteContributor={() => setIsInviteContributorOpen(true)}
              onOpenScheduleTicker={() => setIsScheduleTickerOpen(true)}
              onOpenExportDispatch={() => setIsExportDispatchOpen(true)}
              tickerMessage={tickerMessage}
              onPublishToggle={handlePublishToggle}
              onStatusChange={handleStatusChange}
              onEditMonograph={(mono) => setEditingMonograph(mono)}
              onDeleteMonograph={(mono) =>
                setDeletingItem({
                  type: "monograph",
                  id: mono.id,
                  title: mono.title,
                  description: `№ ${mono.number} · ${mono.category} · Author: ${mono.author.name}`,
                })
              }
            />
          )}

          {activeTab === "home-decor" && (
            <HomeDecorManager
              isModalOpen={isDecorModalOpen}
              setIsModalOpen={setIsDecorModalOpen}
            />
          )}

          {activeTab === "trending-stories" && (
            <NewsManager
              isModalOpen={isTrendModalOpen}
              setIsModalOpen={setIsTrendModalOpen}
              defaultTab="trending"
            />
          )}

          {activeTab === "latest-news" && (
            <NewsManager
              isModalOpen={isLatestNewsModalOpen}
              setIsModalOpen={setIsLatestNewsModalOpen}
              defaultTab="latest"
            />
          )}

          {activeTab === "special-reports" && (
            <NewsManager
              isModalOpen={isReportsModalOpen}
              setIsModalOpen={setIsReportsModalOpen}
              defaultTab="special"
            />
          )}

          {activeTab === "events-industry" && (
            <EventsManager
              events={events}
              onCreate={handleCreateEvent}
              onUpdate={handleUpdateEvent}
              onStatusChange={handleUpdateEventStatus}
              onDelete={handleDeleteEvent}
              onFetchSingle={fetchSingleEvent}
              isModalOpen={isEventModalOpen}
              setIsModalOpen={setIsEventModalOpen}
            />
          )}

           {activeTab === "designers" && (
            <ContributorsScreen
              contributors={contributors}
              isLoading={isLoading}
              onOpenInvite={handleOpenInvite}
              onEditContributor={handleEditContributor}
              onDeleteContributor={handleDeleteContributor}
            />
          )}

          {activeTab === "design-tech" && (
            <DesignTechManager
              isModalOpen={isDesignTechModalOpen}
              setIsModalOpen={setIsDesignTechModalOpen}
            />
          )}

          {activeTab === "settings" && <SettingsScreen />}

          {activeTab === "furniture" && (
         <FurnitureManager
    isModalOpen={isFurnitureModalOpen}
    setIsModalOpen={setIsFurnitureModalOpen}
  />
          )}

          {activeTab === "showrooms-projects" && (
            <MediaScreen
              mediaAssets={mediaAssets}
              onOpenBatchUpload={() => setIsBatchUploadOpen(true)}
              onDeleteMedia={(asset) =>
                setDeletingItem({
                  type: "media",
                  id: asset.id,
                  title: asset.title,
                  description: `Photographer: ${asset.photographer} · ${asset.resolution}`,
                })
              }
            />
          )}
{activeTab === 'products' && (
  <ProductsManager
    isModalOpen={isProductModalOpen}
    setIsModalOpen={setIsProductModalOpen}
  />
)}
         
          {activeTab === "editorial-desk" && (
            <PipelineScreen
              monographs={monographs}
              onSelectMonograph={setSelectedMonograph}
              onOpenNewMonograph={() => setIsNewMonographOpen(true)}
              onStatusChange={handleStatusChange}
              onEditMonograph={(mono) => setEditingMonograph(mono)}
              onDeleteMonograph={(mono) =>
                setDeletingItem({
                  type: "monograph",
                  id: mono.id,
                  title: mono.title,
                  description: `№ ${mono.number} · ${mono.category}`,
                })
              }
            />
          )}
        </main>

        {/* Broadsheet Footer */}
        <Footer onNavClick={setActiveTab} />
      </div>

      {/* Modals & Proofing Drawers */}
      <NewMonographModal
        isOpen={isNewMonographOpen}
        onClose={() => setIsNewMonographOpen(false)}
        onSave={handleSaveMonograph}
      />

      <EditMonographModal
        isOpen={Boolean(editingMonograph)}
        onClose={() => setEditingMonograph(null)}
        monograph={editingMonograph}
        onUpdate={handleUpdateMonograph}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
        onSave={handleSaveCategory}
      />

      <EditContributorModal
        isOpen={isEditContributorOpen}
        onClose={() => setIsEditContributorOpen(false)}
        contributor={editingContributor}
        onSave={handleUpdateContributor}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title={deletingItem?.title || ""}
        itemDescription={deletingItem?.description}
        isDeleting={isDeleting}
      />

      <MonographReaderModal
        monograph={selectedMonograph}
        onClose={() => setSelectedMonograph(null)}
        onPublishToggle={handlePublishToggle}
      />

      <CompilePdfModal
        isOpen={isCompilePdfOpen}
        onClose={() => setIsCompilePdfOpen(false)}
      />

      <BatchUploadModal
        isOpen={isBatchUploadOpen}
        onClose={() => setIsBatchUploadOpen(false)}
        onUploadSuccess={handleBatchUploadSuccess}
      />

      <InviteContributorModal
        isOpen={isInviteContributorOpen}
        onClose={() => setIsInviteContributorOpen(false)}
        onInvite={handleInviteContributor}
      />

      <BreakingTickerModal
        isOpen={isScheduleTickerOpen}
        onClose={() => setIsScheduleTickerOpen(false)}
        onUpdateTicker={setTickerMessage}
        currentTicker={tickerMessage}
      />

      <ExportDispatchModal
        isOpen={isExportDispatchOpen}
        onClose={() => setIsExportDispatchOpen(false)}
        monographs={monographs}
      />
    </div>
  );
}
