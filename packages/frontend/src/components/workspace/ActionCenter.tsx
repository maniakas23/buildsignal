import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/hooks/useAnalytics";
import {
  Bookmark,
  Bell,
  Share2,
  FileDown,
  MessageSquare,
  Check,
  MapPin,
} from "lucide-react";

interface ActionCenterProps {
  recommendationId: number;
  pattern?: {
    county?: string;
    state?: string;
  };
}

export function ActionCenter({ recommendationId, pattern }: ActionCenterProps) {
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [noteText, setNoteText] = useState("");

  const handleSave = () => {
    setSaved(!saved);
    track(saved ? "opportunity_unsaved" : "opportunity_saved", { id: recommendationId });
  };

  const handleFollow = () => {
    setFollowing(!following);
    track(following ? "county_unfollowed" : "county_followed", { county: pattern?.county });
  };

  const handleAlert = () => {
    setAlertSet(!alertSet);
    track(alertSet ? "alert_disabled" : "alert_enabled", { id: recommendationId });
  };

  const handleExport = () => {
    const data = {
      recommendationId,
      county: pattern?.county,
      state: pattern?.state,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buildsignal-opportunity-${recommendationId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    track("opportunity_exported", { id: recommendationId });
  };

  const handleShare = () => {
    const shareData = {
      title: `BuildSignal Opportunity`,
      text: `Opportunity in ${pattern?.county}, ${pattern?.state}`,
      url: `${window.location.origin}/workspace/${recommendationId}`,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }

    track("opportunity_shared", { id: recommendationId });
  };

  const handleNoteSave = () => {
    if (!noteText.trim()) return;
    setNoteText("");
    track("note_added", { id: recommendationId });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={saved ? "default" : "outline"}
          size="sm"
          onClick={handleSave}
        >
          <Bookmark className="w-4 h-4 mr-1" />
          {saved ? "Saved" : "Save"}
        </Button>

        <Button
          variant={following ? "default" : "outline"}
          size="sm"
          onClick={handleFollow}
        >
          <MapPin className="w-4 h-4 mr-1" />
          {following ? "Following" : "Follow County"}
        </Button>

        <Button
          variant={alertSet ? "default" : "outline"}
          size="sm"
          onClick={handleAlert}
        >
          <Bell className="w-4 h-4 mr-1" />
          {alertSet ? "Alert Set" : "Set Alert"}
        </Button>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileDown className="w-4 h-4 mr-1" />
          Export
        </Button>

        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-1" />
          {showShare ? "Copied!" : "Share"}
        </Button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a note..."
          className="flex-1 px-3 py-2 border rounded-md text-sm"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNoteSave()}
        />
        <Button size="sm" onClick={handleNoteSave}>
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default ActionCenter;
