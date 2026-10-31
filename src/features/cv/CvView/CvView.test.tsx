import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CvEntry } from "#features/cv/components/CvEntry/CvEntry.tsx";
import { CV_SECTION } from "#features/cv/cv.constants.ts";
import { CV, CV_PAGE } from "#features/cv/cv.content.ts";
import type { CvEntryContent } from "#features/cv/cv.types.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { cvPdfLabel } from "#shared/content/profile.utils.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { UA } from "#test/user-agents.ts";

import { CvView } from "./CvView.tsx";

const renderCv = () => {
  const onNavigate = vi.fn();
  const user = userEvent.setup();
  render(<CvView onNavigate={onNavigate} />);
  return { onNavigate, user };
};

const sheet = () => within(screen.getByRole("article", { name: CV.header.name }));
/** "Download PDF (2 pages)" with a no-break space: getByRole matches names as they are, so the space is checked too. */
const downloadLabel = cvPdfLabel(CV_PAGE.download);

/** A job with no bullets, as no CV entry has now. */
const BULLETLESS: CvEntryContent = {
  id: "bulletless",
  title: "UX/UI Designer",
  org: ["GlobalLogic Poland", "Full-time", "Remote"],
  start: "2019-09",
  end: "2023-12",
  bullets: [],
};

describe("CvView", () => {
  it("names the page in the breadcrumb and Karolina in the only H1", () => {
    renderCv();
    const breadcrumb = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(breadcrumb.getByText("CV")).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(CV.header.name);
    expect(screen.getByText(CV.header.headline)).toBeInTheDocument();
  });

  it("shows the sections in Figma's order, each with a link to copy and a stable id", () => {
    renderCv();
    const headings = sheet().getAllByRole("heading", { level: 2 });
    expect(headings.map((heading) => heading.textContent)).toEqual(Object.values(CV_PAGE.titles));
    for (const id of Object.values(CV_SECTION)) {
      const title = CV_PAGE.titles[id];
      expect(screen.getByRole("region", { name: title })).toHaveAttribute("id", id);
      expect(screen.getByRole("link", { name: "Copy link to section: " + title })).toHaveAttribute("href", "#" + id);
    }
  });

  it("lists every job and degree with its dates and bullets that open with a bold lead-in", () => {
    renderCv();
    const entries = [...CV.experience, ...CV.education];
    expect(
      sheet()
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(entries.map((entry) => entry.title));
    const programado = screen.getByRole("heading", { level: 3, name: CV.experience[0]?.title });
    const header = programado.closest("div")?.parentElement;
    expect(header).toHaveTextContent("Programado · Remote");
    expect(header).toHaveTextContent("Nov 2023 - Present");
    expect(within(header!).getByText("Nov 2023")).toHaveAttribute("datetime", "2023-11");

    const bullets = sheet()
      .getAllByRole("listitem")
      .filter((item) => item.querySelector("strong"));
    expect(bullets).toHaveLength(entries.flatMap((entry) => entry.bullets).length);
    for (const bullet of bullets) expect(bullet.firstElementChild?.textContent).toMatch(/\S:$/);
  });

  it("gives each entry its bullets in one list", () => {
    renderCv();
    for (const entry of [...CV.experience, ...CV.education]) {
      const title = sheet().getByRole("heading", { level: 3, name: entry.title });
      const root = title.closest("div")?.parentElement?.parentElement;
      expect(within(root!).queryAllByRole("list"), entry.id).toHaveLength(entry.bullets.length > 0 ? 1 : 0);
    }
  });

  it("gives an entry without bullets no empty list", () => {
    // No CV entry is empty now (every job has its bullets: content-rules.test.ts), so one is rendered on its own.
    render(<CvEntry entry={BULLETLESS} />);
    expect(screen.getByRole("heading", { level: 3, name: BULLETLESS.title })).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("joins each skill area's skills into one line, as applicant tracking systems read them", () => {
    renderCv();
    const skills = within(screen.getByRole("region", { name: CV_PAGE.titles.skills }));
    for (const group of CV.skills) {
      const term = skills.getByText(group.area);
      expect(term.tagName).toBe("DT");
      expect(term.nextElementSibling).toHaveTextContent(group.items.join(", "));
    }
  });

  it("links the email, LinkedIn and the portfolio, with the PDF's tagged address on the portfolio link", async () => {
    const { onNavigate, user } = renderCv();
    const contacts = within(sheet().getByRole("list", { name: CV_PAGE.contactsLabel }));
    expect(contacts.getByText(CV.header.location)).toBeInTheDocument();
    expect(contacts.getByRole("link", { name: PROFILE.email })).toHaveAttribute("href", "mailto:" + PROFILE.email);
    const linkedin = contacts.getByRole("link", {
      name: /^https:\/\/www\.linkedin\.com\/in\/karolinakita.*opens in a new tab/,
    });
    expect(linkedin).toHaveAttribute("href", PROFILE.linkedinUrl);
    expect(linkedin).toHaveAttribute("target", "_blank");
    const site = contacts.getByRole("link", { name: "https://karolina.kita.company" });
    expect(site).toHaveAttribute("href", "/");
    expect(site).toHaveAttribute("data-pdf-href", "https://karolina.kita.company/?utm_medium=cv-pdf");
    await user.click(site);
    expect(onNavigate).toHaveBeenCalledWith(VIEW.work, undefined);
  });

  it("gives no phone number and no street address", () => {
    renderCv();
    expect(document.querySelector('a[href^="tel:"]')).toBeNull();
    const text = screen.getByRole("article", { name: CV.header.name }).textContent;
    expect(text).not.toMatch(/\+\d{2}|\d{3}[\s-]\d{3}[\s-]\d{3}|\bul\.|\bstreet\b/i);
  });

  it("ends with the consent in English only, with the email as a link", () => {
    renderCv();
    const consent = screen.getByText(/^I consent to the processing of my personal data/);
    expect(consent.tagName).toBe("P");
    expect(consent.closest("[lang]")).toBeNull();
    expect(consent.parentElement?.children).toHaveLength(1);
    expect(within(consent).getByRole("link", { name: PROFILE.email })).toHaveAttribute(
      "href",
      "mailto:" + PROFILE.email,
    );
    expect(consent).not.toHaveTextContent("{email}");
    const article = screen.getByRole("article", { name: CV.header.name });
    expect(article.querySelector('[lang="pl"]')).toBeNull();
  });

  it("offers the PDF as a download, without the in-app hint in an ordinary browser", () => {
    renderCv();
    const download = screen.getByRole("link", { name: downloadLabel });
    expect(download).toHaveAttribute("href", PROFILE.cvPdfUrl);
    expect(download).toHaveAttribute("href", "/karolina-kita-cv.pdf");
    expect(download).toHaveAttribute("download");
    expect(download).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByText(CV_PAGE.inAppHint)).not.toBeInTheDocument();
  });

  it.each([
    ["Messenger on Android", UA.messengerAndroid],
    ["LinkedIn on iOS", UA.linkedin],
  ])("tells %s that the PDF opens best in the phone's browser", (_, userAgent) => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
    renderCv();
    expect(screen.getByText(CV_PAGE.inAppHint)).toBeInTheDocument();
    // The hint describes the link: a screen reader hears it with "Download PDF", and Tab does not skip it.
    expect(screen.getByRole("link", { name: downloadLabel })).toHaveAccessibleDescription(CV_PAGE.inAppHint);
  });
});
