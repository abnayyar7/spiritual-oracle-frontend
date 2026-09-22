import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import OnboardingFlow from "@/app/components/onboarding-flow";

export default async function OnboardingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has already completed onboarding
  const userProfile = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${user.id}`,
      },
      next: { revalidate: 0 },
    }
  )
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  if (userProfile?.onboarding_complete) {
    redirect("/oracle");
  }

  return <OnboardingFlow />;
}
