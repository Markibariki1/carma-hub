import { isSignedIn } from '@/lib/sendAuth';
import { SendSignIn } from '@/components/send/SendSignIn';
import { SendTool } from '@/components/send/SendTool';

/**
 * Private page for sending the follow-up email after a phone call.
 * Locked behind SEND_PASSWORD; the email wording lives in lib/followup.ts.
 */
export default async function Page() {
  const signedIn = await isSignedIn();
  return (
    <main className="send">
      <header className="send__head">
        <p className="send__brand">Carma</p>
        <h1 className="send__title">Follow-up email</h1>
      </header>
      {signedIn ? (
        <SendTool sendingReady={Boolean(process.env.RESEND_API_KEY)} />
      ) : (
        <SendSignIn passwordSet={Boolean(process.env.SEND_PASSWORD)} />
      )}
    </main>
  );
}
