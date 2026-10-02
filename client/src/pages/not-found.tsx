import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 font-serif text-3xl">Let's get you back to the hub.</h1>
      <p className="mt-4 text-muted-foreground">
        This address does not match an available page. Browse Discover to find upcoming
        opportunities.
      </p>
      <Button asChild className="mt-6">
        <Link href="/discover">Open Discover</Link>
      </Button>
    </div>
  );
}
