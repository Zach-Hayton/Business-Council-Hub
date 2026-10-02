import { PageHeader } from "@/components/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const questions = [
  [
    "Where can I find events?",
    "Use Discover to search sample events and recruiting deadlines. Filter by food, class year, major, interest or organization. Open-to-everyone listings appear by default.",
  ],
  [
    "Where can I find a club?",
    "Organizations includes profiles, published contacts and links to official pages. Compare up to three organizations side by side.",
  ],
  [
    "Are these real events?",
    "No. Event listings and recruiting dates are illustrative and roll forward when the page loads, so the demonstration remains usable. Check a club's official channels for real dates.",
  ],
  [
    "How do officer accounts work?",
    "The account menu provides sample roles, not real sign-in. Create, edit, duplicate or cancel listings in Workspace. Changes stay in the current tab and disappear on reload; they are not shared with other visitors.",
  ],
  [
    "What does private mean here?",
    "The interface demonstrates public and private visibility with sample data. All bundled data in a static public site is downloadable. This is not a security boundary: do not enter confidential information, membership rosters or real private schedules.",
  ],
  [
    "Does this submit anything to Connect?",
    "No. Connect prep formats sample details for copying. It does not submit a request, obtain approval or reserve a room.",
  ],
  [
    "What happens to correction reports?",
    "Example reports appear in this tab's workspace and administration view only. No email or notification is sent.",
  ],
  [
    "How do I restore the examples?",
    "Reload the page, or select Council Admin and use Reset sample data. There is no central database in this standalone version.",
  ],
];
export default function Guide() {
  return (
    <>
      <PageHeader eyebrow="Help" title="Using the prototype." />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <Accordion type="single" collapsible>
          {questions.map(([question, answer], index) => (
            <AccordionItem key={question} value={String(index)}>
              <AccordionTrigger>{question}</AccordionTrigger>
              <AccordionContent>{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
