// This page is no longer needed as the topic selection is now integrated into the /interview/new page.
// We are redirecting to the new flow to avoid broken links.

import { redirect } from 'next/navigation';

export default function OldRoleTopicsPage() {
  redirect('/interview/new');
}
