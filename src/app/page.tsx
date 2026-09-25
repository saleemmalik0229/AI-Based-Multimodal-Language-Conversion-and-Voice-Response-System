import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect('/translator');
  } else {
    redirect('/auth/login');
  }
}
