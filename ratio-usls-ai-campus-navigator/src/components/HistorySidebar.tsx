import React, { useEffect, useState } from "react";
import { UserInteraction } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  History,
  X,
  Footprints,
  Clock,
  Trash2,
  Navigation,
  Compass,
  ArrowRight,
} from "lucide-react";

export interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedId?: string | null;
  onSelectInteraction: (interaction: UserInteraction) => void;
  onNewRoute: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  selectedId,
  onSelectInteraction,
  onNewRoute,
}) => {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;

    if (!user || !db) {
      setInteractions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "users", user.uid, "interactions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: UserInteraction[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<UserInteraction, "id">),
          });
        });
        setInteractions(items);
        setLoading(false);
      },
      (err) => {
        console.warn("Firestore history error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user || !db) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "interactions", id));
    } catch (err) {
      console.error("Failed to delete trip:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-white border-l border-slate-200 shadow-2xl p-5 overflow-y-auto text-slate-800 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Saved Campus Trips</h2>
                <p className="text-xs text-slate-500 font-medium">Synced with your Firestore cloud profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Route Button */}
          <button
            onClick={() => {
              onNewRoute();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>Start Fresh Navigation Route</span>
          </button>

          {/* List of Saved Routes */}
          <div className="space-y-2.5 pt-2">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                Loading saved routes...
              </div>
            ) : interactions.length > 0 ? (
              interactions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectInteraction(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-emerald-50/60 hover:border-emerald-300 transition-all cursor-pointer space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-emerald-700" />
                      {item.title}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50"
                      title="Delete Saved Trip"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium">
                    {item.originName} &rarr; {item.destinationName}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-3 font-semibold">
                      <span className="flex items-center gap-1 text-emerald-800">
                        <Footprints className="h-3 w-3" />
                        ~{item.distanceMeters} m
                      </span>
                      <span className="flex items-center gap-1 text-blue-700">
                        <Clock className="h-3 w-3" />
                        ~{item.estimatedMinutes} min
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Compass className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">No saved trips yet.</p>
                <p className="text-[11px] text-slate-400">
                  Click "Save Trip" when viewing any active route to bookmark it here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
          >
            Close Saved Trips
          </button>
        </div>
      </div>
    </div>
  );
};
