import { redirect } from "next/navigation";

export default function Page() {
  // Disable public signup page
  redirect("/login");
  return null;
}
