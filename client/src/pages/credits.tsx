import { PageHeader } from "@/components/layout";
import { CLUB_DETAILS } from "@shared/clubs";
export default function Credits() {
  return (
    <>
      <PageHeader eyebrow="Credits" title="Content & photography" />
      <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 text-sm leading-relaxed">
        <p>
          Organization information and contacts link to the club or university page that publishes
          them. Membership figures are published snapshots, not live headcounts. Unpublished sizes
          and contacts have not been invented.
        </p>
        <section>
          <h2 className="mb-3 font-serif text-2xl">Brand assets</h2>
          <ul className="space-y-3">
            <li>
              Club marks are uniform abbreviation tiles, not official club logos. Approved logos and
              group photographs will be added together in a later asset pass.
            </li>
            <li>
              Baylor University marks:{" "}
              <a
                href="https://hankamer.baylor.edu/student-resources/organizations"
                className="underline"
              >
                Baylor's published website assets
              </a>
              , used unchanged in this review preview. Approval and licensed fonts should be
              supplied before public university deployment.
            </li>
          </ul>
        </section>
        <p>
          The landing-page atrium and category imagery are illustrations, not photographs of actual
          events. All organization photo spaces are neutral placeholders awaiting approved group
          imagery. No individual portrait is used to represent an organization.
        </p>
        <p>
          This is a public prototype with illustrative events, rolling recruiting dates and sample
          officer accounts. It is not an official Baylor service. Edits stay in the current tab and
          reset on reload. Confirm publication permission for university marks and replace sample
          listings with club-approved information before any institutional launch.
        </p>
        <section>
          <h2 className="mb-3 font-serif text-2xl">Profile information</h2>
          <ul className="space-y-2">
            {Object.entries(CLUB_DETAILS).map(([slug, o]) => (
              <li key={slug}>
                <a
                  className="underline"
                  href={o.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {o.name ?? slug.split("-").join(" ")}: organization information
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
