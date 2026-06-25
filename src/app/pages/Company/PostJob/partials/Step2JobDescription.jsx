import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

export default function Step2JobDescription({
  jobDescription,
  setJobDescription,
  responsibilities,
  setResponsibilities,
  whoYouAre,
  setWhoYouAre,
  niceToHaves,
  setNiceToHaves,
}) {
  const { t } = useTranslation();
  const maxDescription = 10000;
  const maxResponsibilities = 10000;
  const maxWhoYouAre = 10000;
  const maxNiceToHaves = 10000;

  const descriptionRef = useRef(null);
  const responsibilitiesRef = useRef(null);
  const whoYouAreRef = useRef(null);
  const niceToHavesRef = useRef(null);

  // Auto-resize textarea function
  const autoResize = (textarea) => {
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const maxHeight = lineHeight * 15; // 15 lines max

    if (scrollHeight > maxHeight) {
      textarea.style.height = maxHeight + "px";
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = scrollHeight + "px";
      textarea.style.overflowY = "hidden";
    }
  };

  // Auto-resize on content change
  useEffect(() => {
    autoResize(descriptionRef.current);
  }, [jobDescription]);

  useEffect(() => {
    autoResize(responsibilitiesRef.current);
  }, [responsibilities]);

  useEffect(() => {
    autoResize(whoYouAreRef.current);
  }, [whoYouAre]);

  useEffect(() => {
    autoResize(niceToHavesRef.current);
  }, [niceToHaves]);

  return (
    <div className="space-y-8">
      {/* Details Section */}
      <div className="border-b border-border border-gray-300">
        <p className="text-lg font-semibold mb-2 text-foreground">{t("postJob.details")}</p>
        <p className="text-normal font-regular text-muted-foreground mb-6">{t("postJob.detailsDesc")}</p>
      </div>

      {/* Job Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border border-gray-300 pb-6">
        <div>
          <Label htmlFor="jobDescriptions" className="text-foreground font-semibold text-lg">
            {t("postJob.jobDescriptionText")}
          </Label>
          <p className="text-normal font-regular text-muted-foreground mt-1">{t("postJob.jobDescriptionTextDesc")}</p>
        </div>
        <div className="md:col-span-2">
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <Textarea
              ref={descriptionRef}
              id="jobDescriptions"
              placeholder={t("postJob.jobDescriptionPlaceholder")}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value.slice(0, maxDescription));
                autoResize(e.target);
              }}
              className="min-h-[120px] border-0 resize-none focus-visible:ring-0 rounded-none"
              style={{ overflowY: "hidden" }}
            />
            <div className="px-3 py-2 text-xs text-muted-foreground text-right bg-muted/30 flex justify-end gap-2">
              {t("postJob.maxCharacters", { max: maxDescription })}
              <span className="font-medium">
                {jobDescription.length} / {maxDescription}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-amber-600">{t("postJob.aiScoringHint") || "Used by AI scoring — write clearly with relevant keywords."}</p>
        </div>
      </div>

      {/* Responsibilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border pb-6 border-gray-300">
        <div>
          <Label htmlFor="responsibilities" className="text-foreground font-semibold text-lg">
            {t("postJob.responsibilities")}
          </Label>
          <p className="text-normal font-regular text-muted-foreground mt-1">{t("postJob.responsibilitiesDesc")}</p>
        </div>
        <div className="md:col-span-2">
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <Textarea
              ref={responsibilitiesRef}
              id="responsibilities"
              placeholder={t("postJob.responsibilitiesPlaceholder")}
              value={responsibilities}
              onChange={(e) => {
                setResponsibilities(e.target.value.slice(0, maxResponsibilities));
                autoResize(e.target);
              }}
              className="min-h-[120px] border-0 resize-none focus-visible:ring-0 rounded-none"
              style={{ overflowY: "hidden" }}
            />
            <div className="px-3 py-2 text-xs text-muted-foreground text-right bg-muted/30 flex justify-end gap-2">
              {t("postJob.maxCharacters", { max: maxResponsibilities })}
              <span className="font-medium">
                {responsibilities.length} / {maxResponsibilities}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-amber-600">{t("postJob.aiScoringHint") || "Used by AI scoring — write clearly with relevant keywords."}</p>
        </div>
      </div>

      {/* Who You Are */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start border-b border-border pb-6 border-gray-300">
        <div>
          <Label htmlFor="whoYouAre" className="text-foreground font-semibold text-lg">
            {t("postJob.whoYouAre")}
          </Label>
          <p className="text-normal font-regular text-muted-foreground mt-1">{t("postJob.whoYouAreDesc")}</p>
        </div>
        <div className="md:col-span-2">
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <Textarea
              ref={whoYouAreRef}
              id="whoYouAre"
              placeholder={t("postJob.whoYouArePlaceholder")}
              value={whoYouAre}
              onChange={(e) => {
                setWhoYouAre(e.target.value.slice(0, maxWhoYouAre));
                autoResize(e.target);
              }}
              className="min-h-[120px] border-0 resize-none focus-visible:ring-0 rounded-none"
              style={{ overflowY: "hidden" }}
            />
            <div className="px-3 py-2 text-xs text-muted-foreground text-right bg-muted/30 flex justify-end gap-2">
              {t("postJob.maxCharacters", { max: maxWhoYouAre })}
              <span className="font-medium">
                {whoYouAre.length} / {maxWhoYouAre}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-amber-600">{t("postJob.aiScoringHint") || "Used by AI scoring — write clearly with relevant keywords."}</p>
        </div>
      </div>

      {/* Nice-To-Haves */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <Label htmlFor="niceToHaves" className="text-foreground font-semibold text-lg">
            {t("postJob.niceToHaves")}
          </Label>
          <p className="text-normal font-regular text-muted-foreground mt-1">{t("postJob.niceToHavesDesc")}</p>
        </div>
        <div className="md:col-span-2">
          <div className="border border-border rounded-lg overflow-hidden bg-white">
            <Textarea
              ref={niceToHavesRef}
              id="niceToHaves"
              placeholder={t("postJob.niceToHavesPlaceholder")}
              value={niceToHaves}
              onChange={(e) => {
                setNiceToHaves(e.target.value.slice(0, maxNiceToHaves));
                autoResize(e.target);
              }}
              className="min-h-[120px] border-0 resize-none focus-visible:ring-0 rounded-none"
              style={{ overflowY: "hidden" }}
            />
            <div className="px-3 py-2 text-xs text-muted-foreground text-right bg-muted/30 flex justify-end gap-2">
              {t("postJob.maxCharacters", { max: maxNiceToHaves })}
              <span className="font-medium">
                {niceToHaves.length} / {maxNiceToHaves}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-amber-600">{t("postJob.aiScoringHint") || "Used by AI scoring — write clearly with relevant keywords."}</p>
        </div>
      </div>
    </div>
  );
}
