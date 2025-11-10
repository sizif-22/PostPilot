'server only';
import { signOut } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export const logout = async () => {
  await signOut();
  return redirect('/');
};
